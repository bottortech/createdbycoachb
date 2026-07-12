"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import AnimationController, { AnimationControllerHandle, MovementState } from "./AnimationController";
import { resolveMove, GALLERY_COLLIDERS } from "@/lib/collision";

// Mixamo FBX characters are authored in centimeters — 0.01 brings the ~170cm
// rig down to ~1.7 world units, matching the eye-height convention (1.7) the
// rest of the gallery already uses for STOPS positions.
const MODEL_SCALE = 0.01;

// If the character appears to walk backwards or sideways relative to the
// direction it's actually moving, flip this by Math.PI — it corrects for
// whichever way the source FBX rig was authored to face.
const FACING_OFFSET = Math.PI;

const MOVE_SPEED_FORWARD = 1.7; // units/sec — natural indoor walking pace
const MOVE_SPEED_BACKWARD = 1.3;
const TURN_SPEED = 2.6; // radians/sec (~150°/s)

// Circle radius used for wall/obstacle collision (free mode only) — tuned to
// roughly match the character's shoulder width, kept a little generous so
// nothing ever visibly clips.
const CHARACTER_RADIUS = 0.3;

// How fast velocity/turn-rate ease toward their target each frame. High
// enough that input still feels immediate, low enough to round off the
// instant on/off snap into a natural accel/decel (time constant ~1/rate sec).
const ACCEL_RATE = 9; // ~110ms to reach full speed
const TURN_ACCEL_RATE = 16; // ~60ms — turning still feels responsive

const STOPPED_EPSILON = 0.02;
const VELOCITY_EPSILON = 0.03;
// Scripted-mode only: below this remaining distance to the target, the
// character stops facing its direction of travel and rotates to face the
// destination's intended camera-facing orientation instead.
const MOVEMENT_FACING_DIST = 0.4;

// TEMPORARY diagnostics — flip on to debug, off for normal use (avoids
// console spam and the extra work of formatting a log line every second).
const DEBUG_CHARACTER = false;

export interface CharacterOutState {
  position: THREE.Vector3;
  yaw: number;
}

interface CharacterControllerProps {
  /** Whether the character is visible/participating at all (hidden during portals / pre-entry). */
  active: boolean;
  /** "free" = WASD/joystick-driven by the player. "scripted" = follows navTarget (tour/map-jump). */
  controlMode: "free" | "scripted";
  /** Proxy object GalleryRoom's existing STOPS/camera logic writes to when controlMode is "scripted". */
  navTarget: THREE.Object3D | null;
  /** Mutated directly by MobileControls; read every frame, no re-renders. */
  joystickInputRef: RefObject<{ forward: number; turn: number }>;
  /** World-space spawn position + facing yaw, used once on mount. */
  spawn: { position: [number, number, number]; yaw: number };
  /** Mutated every frame so ThirdPersonCamera can read the character's live transform. */
  outState: RefObject<CharacterOutState>;
  /** Bumped by the "Reset View" debug button to force an instant teleport to resetTo. */
  resetSignal?: number;
  /** Where "Reset View" places the character — should be a known-open spot. */
  resetTo?: { position: [number, number, number]; yaw: number };
  /**
   * Mutated directly (no re-render) by GalleryScene whenever a scripted
   * transition needs the character to be authoritatively AT a specific
   * waypoint/destination right now, instead of trusting the exponential
   * chase to have visually caught up to navTarget by some deadline. Bump
   * `.signal` and set `.position`/`.yaw` in the same write; checked once
   * per frame here and applied instantly the frame after it changes.
   */
  snapTargetRef?: RefObject<{ signal: number; position: [number, number, number]; yaw: number }>;
}

export default function CharacterController({
  active,
  controlMode,
  navTarget,
  joystickInputRef,
  spawn,
  outState,
  resetSignal = 0,
  resetTo,
  snapTargetRef,
}: CharacterControllerProps) {
  const group = useRef<THREE.Group>(null);
  const animRef = useRef<AnimationControllerHandle>(null);

  const position = useRef(new THREE.Vector3(...spawn.position));
  const yaw = useRef(spawn.yaw);
  // Current eased speed (signed: +forward/-backward) and yaw rate — these
  // chase the raw key/joystick target every frame instead of snapping to it,
  // which is what gives smooth accel/decel instead of an instant on/off.
  const velocity = useRef(0);
  const turnVelocity = useRef(0);
  const initialized = useRef(false);
  const lastResetSignal = useRef(resetSignal);
  const lastSnapSignal = useRef(0);
  const lastLog = useRef(0);

  const keys = useRef<Record<"w" | "a" | "s" | "d", boolean>>({ w: false, a: false, s: false, d: false });

  useEffect(() => {
    if (controlMode !== "free") return;

    const isMoveKey = (k: string): k is "w" | "a" | "s" | "d" => k === "w" || k === "a" || k === "s" || k === "d";

    const onDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (isMoveKey(k)) keys.current[k] = true;
    };
    const onUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (isMoveKey(k)) keys.current[k] = false;
    };

    // If the window loses focus while a key is physically held down (alt-tab,
    // taking a screenshot, clicking outside the browser), the OS/browser
    // never delivers that key's "keyup" — so without this, keys.current stays
    // stuck true and the character keeps walking/turning indefinitely.
    const releaseAll = () => {
      keys.current = { w: false, a: false, s: false, d: false };
    };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", releaseAll);
    document.addEventListener("visibilitychange", releaseAll);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", releaseAll);
      document.removeEventListener("visibilitychange", releaseAll);
      keys.current = { w: false, a: false, s: false, d: false };
    };
  }, [controlMode]);

  const dirVec = useRef(new THREE.Vector3());

  useFrame(({ clock }, delta) => {
    if (!group.current) return;

    // Spawn once, the first active frame — avoids re-snapping on every prop change.
    if (!initialized.current) {
      initialized.current = true;
      position.current.set(...spawn.position);
      yaw.current = spawn.yaw;
    }

    if (resetSignal !== lastResetSignal.current) {
      lastResetSignal.current = resetSignal;
      const target = resetTo ?? spawn;
      position.current.set(...target.position);
      yaw.current = target.yaw;
    }

    const snapTarget = snapTargetRef?.current;
    if (snapTarget && snapTarget.signal !== lastSnapSignal.current) {
      lastSnapSignal.current = snapTarget.signal;
      position.current.set(...snapTarget.position);
      yaw.current = snapTarget.yaw;
    }

    if (!active) return;
    const dt = Math.min(delta, 0.05);

    let movementState: MovementState = "idle";
    let speedRatio = 1;

    if (controlMode === "free") {
      const joystick = joystickInputRef.current;
      const forwardInput = (keys.current.w ? 1 : 0) - (keys.current.s ? 1 : 0) + (joystick?.forward ?? 0);
      const turnInput = (keys.current.d ? 1 : 0) - (keys.current.a ? 1 : 0) + (joystick?.turn ?? 0);

      const clampedForward = Math.max(-1, Math.min(1, forwardInput));
      const clampedTurn = Math.max(-1, Math.min(1, turnInput));

      // Target velocity/turn-rate from raw input, eased toward every frame
      // (accel/decel) instead of snapping straight to it.
      const targetVelocity = clampedForward * (clampedForward >= 0 ? MOVE_SPEED_FORWARD : MOVE_SPEED_BACKWARD);
      const targetTurnVelocity = clampedTurn * TURN_SPEED;

      const accelLerp = 1 - Math.exp(-ACCEL_RATE * dt);
      const turnAccelLerp = 1 - Math.exp(-TURN_ACCEL_RATE * dt);
      velocity.current += (targetVelocity - velocity.current) * accelLerp;
      turnVelocity.current += (targetTurnVelocity - turnVelocity.current) * turnAccelLerp;

      yaw.current += turnVelocity.current * dt;

      if (Math.abs(velocity.current) > VELOCITY_EPSILON) {
        const forwardX = -Math.sin(yaw.current);
        const forwardZ = -Math.cos(yaw.current);
        const dx = forwardX * velocity.current * dt;
        const dz = forwardZ * velocity.current * dt;
        const resolved = resolveMove(position.current.x, position.current.z, dx, dz, GALLERY_COLLIDERS, CHARACTER_RADIUS);
        position.current.x = resolved.x;
        position.current.z = resolved.z;
      }

      // Animation priority: forward/back motion wins over in-place turning,
      // matching the spec's "turning while stationary" rule. Driven by raw
      // input (not the eased velocity) so the animation switches the instant
      // a key is pressed — only the actual translation eases in underneath.
      if (clampedForward > 0.05) {
        movementState = "walk";
        speedRatio = Math.abs(velocity.current) / MOVE_SPEED_FORWARD;
      } else if (clampedForward < -0.05) {
        movementState = "walkBack";
        speedRatio = Math.abs(velocity.current) / MOVE_SPEED_BACKWARD;
      } else if (clampedTurn < -0.05) {
        movementState = "turnLeft";
        speedRatio = Math.abs(turnVelocity.current) / TURN_SPEED;
      } else if (clampedTurn > 0.05) {
        movementState = "turnRight";
        speedRatio = Math.abs(turnVelocity.current) / TURN_SPEED;
      } else {
        movementState = "idle";
      }
    } else if (navTarget) {
      // Scripted: chase the STOPS-driven proxy (guided tour / map jump / next-prev).
      navTarget.getWorldDirection(dirVec.current);
      const destinationYaw = Math.atan2(-dirVec.current.x, -dirVec.current.z);
      const targetX = navTarget.position.x;
      const targetZ = navTarget.position.z;

      const distX = targetX - position.current.x;
      const distZ = targetZ - position.current.z;
      const dist = Math.sqrt(distX * distX + distZ * distZ);

      // Face the direction of travel while actually moving — destinationYaw
      // is where the camera should look AT the destination, which often
      // isn't the direction from here to there, and facing it the whole way
      // made the character appear to strafe/walk backward toward stops that
      // aren't straight ahead. Only switch to the destination's intended
      // facing once close enough to arrival that it reads as "settling in,"
      // not "walking wrong."
      const targetYaw = dist > MOVEMENT_FACING_DIST ? Math.atan2(-distX, -distZ) : destinationYaw;

      // Reverted: running scripted-mode moves through resolveMove blocked
      // illegal moves but couldn't route around them (no pathfinding), so a
      // target reachable only via a doorway/corner — not a straight line
      // from the current position — could leave the character wedged
      // against a wall mid-transition instead of arriving. That's worse
      // than the cosmetic clip it was meant to fix. Scripted paths route
      // through curated STOPS waypoints instead (see transitionNeedsDirectSnap).
      const posLerp = 1 - Math.exp(-3.5 * dt);
      position.current.x += distX * posLerp;
      position.current.z += distZ * posLerp;

      // Switching from "facing direction of travel" to "facing the
      // destination" (see MOVEMENT_FACING_DIST above) can require a large,
      // sudden turn right as the character arrives — e.g. walking mostly
      // east toward a stop that ultimately faces south. At the old turn
      // rate that could take the better part of a second to finish, so the
      // character visibly arrived at the right spot but was still
      // mid-rotation, reading as "facing the wrong wall." Turning much
      // faster here (this is a snap-to-face on arrival, not a walking
      // animation) makes that resolve essentially immediately instead.
      let dYaw = targetYaw - yaw.current;
      while (dYaw > Math.PI) dYaw -= Math.PI * 2;
      while (dYaw < -Math.PI) dYaw += Math.PI * 2;
      yaw.current += dYaw * (1 - Math.exp(-12 * dt));

      movementState = dist > STOPPED_EPSILON ? "walk" : "idle";
    }

    group.current.position.set(position.current.x, 0, position.current.z);
    group.current.rotation.y = yaw.current + FACING_OFFSET;

    animRef.current?.update(movementState, speedRatio);

    if (outState.current) {
      outState.current.position.copy(position.current);
      outState.current.yaw = yaw.current;
    }

    if (DEBUG_CHARACTER && clock.elapsedTime - lastLog.current > 1) {
      lastLog.current = clock.elapsedTime;
      // eslint-disable-next-line no-console
      console.log("[CharacterController]", {
        controlMode,
        movementState,
        position: [position.current.x, position.current.y, position.current.z].map((n) => +n.toFixed(2)),
        yaw: +yaw.current.toFixed(2),
        navTargetPos: navTarget ? navTarget.position.toArray().map((n) => +n.toFixed(2)) : null,
      });
    }
  });

  return (
    <group ref={group} visible={active} scale={MODEL_SCALE}>
      <AnimationController ref={animRef} />
    </group>
  );
}
