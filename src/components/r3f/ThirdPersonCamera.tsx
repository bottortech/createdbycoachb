"use client";

import { useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { CharacterOutState } from "./CharacterController";
import { findSafeCameraDistance } from "@/lib/collision";

// TEMPORARY diagnostics — flip on to debug, off for normal use.
const DEBUG_CAMERA = false;

// Ideal boom distance — some STOPS camera spots were tuned for a first-person
// view and don't have this much clearance behind them, so the actual
// distance used each frame is scaled down to whatever's safe (see
// findSafeCameraDistance) instead of embedding the camera in a wall/vitrine.
const BACK_DISTANCE = 2.8;
// Never let the boom collapse below this, even in a very tight room — a
// slight graze past the wall-clearance buffer looks far better than the
// near-vertical, "staring at the top of the character's head" pitch that
// near-zero horizontal distance produces once height is factored in.
const MIN_BOOM_DISTANCE = 0.7;
const CAMERA_HEIGHT = 2.2;
// Aimed above chest height (was 1.4) — wall-mounted content like the
// Client Reviews screen (center ~1.78, top edge ~2.42) was getting cut off
// above frame since the camera aimed low relative to it. 1.65 wasn't quite
// enough; 1.85 brings it close to the screen's own center.
const LOOK_HEIGHT = 1.85;
// Extra height added on top of CAMERA_HEIGHT as the boom distance shrinks in
// a tight spot — up to this much at the tightest. Kept modest: too much
// pushes the pitch so steep the wall/content behind the character drops out
// of frame entirely (rooms are tall enough that some lift still helps, just
// not aggressively).
const OVERHEAD_BOOST = 0.3;
const FOLLOW_SMOOTHING = 4.5; // higher = snappier, lower = floatier

/** A fixed camera framing held while the avatar stays where a stop (or a
 *  prediction board) placed it — see GalleryStop.walkView. Released the
 *  moment the avatar moves or turns away from `anchor`. */
export interface CameraFraming {
  anchor: { x: number; z: number; yaw: number };
  pos: [number, number, number];
  look: [number, number, number];
}
// How far the avatar may drift from the anchor before the framing releases.
const FRAMING_RELEASE_DIST = 0.2;
const FRAMING_RELEASE_YAW = 0.1;
// Blend speed between the follow camera and a held framing (per second).
const FRAMING_BLEND_SPEED = 2.5;

export interface CameraDebugState {
  camPos: THREE.Vector3;
  camLook: THREE.Vector3;
}

interface ThirdPersonCameraProps {
  /** False while a portal / pre-entry cinematic camera owns the real camera. */
  active: boolean;
  characterState: RefObject<CharacterOutState>;
  /** Bumped by the "Reset View" debug button to force an instant re-snap. */
  resetSignal?: number;
  /** Mutated every active frame for the debug HUD to read (outside the Canvas). */
  debugState?: RefObject<CameraDebugState>;
  /** Optional held framing; released here once the avatar moves away. */
  framing?: RefObject<CameraFraming | null>;
}

export default function ThirdPersonCamera({ active, characterState, resetSignal = 0, debugState, framing }: ThirdPersonCameraProps) {
  const { camera } = useThree();
  const desiredPos = useRef(new THREE.Vector3());
  const desiredLook = useRef(new THREE.Vector3());
  const seeded = useRef(false);
  const lastResetSignal = useRef(resetSignal);
  const lastLog = useRef(0);
  // 0 = normal follow camera, 1 = fully on the held framing.
  const framingBlend = useRef(0);
  const lastFraming = useRef<CameraFraming | null>(null);
  // The framing object the avatar has already walked away from — it stays
  // released until the scene hands over a new one.
  const releasedFraming = useRef<CameraFraming | null>(null);

  useFrame(({ clock }, delta) => {
    if (resetSignal !== lastResetSignal.current) {
      lastResetSignal.current = resetSignal;
      seeded.current = false; // force an instant re-snap next active frame
    }

    if (!active) {
      seeded.current = false;
      return;
    }
    const dt = Math.min(delta, 0.05);
    const { position, yaw } = characterState.current;

    const dirX = Math.sin(yaw);
    const dirZ = Math.cos(yaw);
    const safeDist = Math.max(MIN_BOOM_DISTANCE, findSafeCameraDistance(position.x, position.z, dirX, dirZ, BACK_DISTANCE));
    const behindX = dirX * safeDist;
    const behindZ = dirZ * safeDist;
    // When a tight spot shrinks the horizontal boom distance, go up instead
    // of down: raise the camera and let it look down at the character from
    // above, rather than parking it beside the character at near-eye-level
    // (which put the character's own body flickering in and out of frame as
    // it swayed). Rooms are tall enough (3.6m) that vertical room is the one
    // direction that's essentially always available.
    const heightRatio = BACK_DISTANCE > 0 ? safeDist / BACK_DISTANCE : 1;
    const effectiveCameraHeight = CAMERA_HEIGHT + (1 - heightRatio) * OVERHEAD_BOOST;
    desiredPos.current.set(position.x + behindX, position.y + effectiveCameraHeight, position.z + behindZ);
    desiredLook.current.set(position.x, position.y + LOOK_HEIGHT, position.z);

    // Held framing: release it once the avatar walks or turns away, then
    // blend smoothly between the follow camera and the framing either way.
    const offered = framing?.current ?? null;
    let held = offered && offered !== releasedFraming.current ? offered : null;
    if (held) {
      const dx = position.x - held.anchor.x;
      const dz = position.z - held.anchor.z;
      let dYaw = Math.abs(yaw - held.anchor.yaw) % (Math.PI * 2);
      if (dYaw > Math.PI) dYaw = Math.PI * 2 - dYaw;
      if (Math.hypot(dx, dz) > FRAMING_RELEASE_DIST || dYaw > FRAMING_RELEASE_YAW) {
        releasedFraming.current = held;
        held = null;
      } else {
        lastFraming.current = held;
      }
    }
    const targetBlend = held ? 1 : 0;
    framingBlend.current += (targetBlend - framingBlend.current) * (1 - Math.exp(-FRAMING_BLEND_SPEED * dt));
    if (Math.abs(targetBlend - framingBlend.current) < 0.001) framingBlend.current = targetBlend;
    const b = framingBlend.current;
    if (b > 0 && lastFraming.current) {
      const f = lastFraming.current;
      desiredPos.current.set(
        desiredPos.current.x + (f.pos[0] - desiredPos.current.x) * b,
        desiredPos.current.y + (f.pos[1] - desiredPos.current.y) * b,
        desiredPos.current.z + (f.pos[2] - desiredPos.current.z) * b,
      );
      desiredLook.current.set(
        desiredLook.current.x + (f.look[0] - desiredLook.current.x) * b,
        desiredLook.current.y + (f.look[1] - desiredLook.current.y) * b,
        desiredLook.current.z + (f.look[2] - desiredLook.current.z) * b,
      );
    } else if (b === 0) {
      lastFraming.current = null;
    }

    if (!seeded.current) {
      seeded.current = true;
      camera.position.copy(desiredPos.current);
      camera.lookAt(desiredLook.current);
    } else {
      const k = 1 - Math.exp(-FOLLOW_SMOOTHING * dt);
      camera.position.lerp(desiredPos.current, k);
      camera.lookAt(desiredLook.current);
    }

    if (debugState?.current) {
      debugState.current.camPos.copy(camera.position);
      debugState.current.camLook.copy(desiredLook.current);
    }

    if (DEBUG_CAMERA && clock.elapsedTime - lastLog.current > 1) {
      lastLog.current = clock.elapsedTime;
      // eslint-disable-next-line no-console
      console.log("[ThirdPersonCamera]", {
        camPos: camera.position.toArray().map((n) => +n.toFixed(2)),
        camLook: desiredLook.current.toArray().map((n) => +n.toFixed(2)),
        charPos: [position.x, position.y, position.z].map((n) => +n.toFixed(2)),
        yaw: +yaw.toFixed(2),
      });
    }
  });

  return null;
}
