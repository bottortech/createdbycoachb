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
}

export default function ThirdPersonCamera({ active, characterState, resetSignal = 0, debugState }: ThirdPersonCameraProps) {
  const { camera } = useThree();
  const desiredPos = useRef(new THREE.Vector3());
  const desiredLook = useRef(new THREE.Vector3());
  const seeded = useRef(false);
  const lastResetSignal = useRef(resetSignal);
  const lastLog = useRef(0);

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
