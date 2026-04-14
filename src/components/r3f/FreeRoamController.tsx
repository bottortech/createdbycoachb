"use client";

import { useRef, useEffect, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ------------------------------------------------------------------ */
/*  COLLISION BOUNDARIES                                               */
/* ------------------------------------------------------------------ */

// Define walls as line segments [x1,z1, x2,z2] — camera can't cross these
const WALLS: [number, number, number, number][] = [
  // Entry chamber
  [-3, 2, 3, 2],         // back wall (behind you)
  [-3, -1.25, -3, 2],    // left wall
  [3, 0.2, 3, 2],        // right wall (short)
  [-2.9, -1, 0.7, -1],   // WiggleWoo display wall

  // Main gallery
  [0, 1, 20, 1],         // top wall (z = GZ + GW = 1)
  [0, -4, 20, -4],       // bottom wall (z = GZ - GW = -4)
  [19, -4, 19, 1],       // end wall
];

const WALL_MARGIN = 0.3; // how close camera can get to a wall

/** Check if a point is too close to any wall segment */
function collideWalls(px: number, pz: number): [number, number] {
  let cx = px;
  let cz = pz;

  for (const [x1, z1, x2, z2] of WALLS) {
    // Find closest point on the segment to (cx, cz)
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len2 = dx * dx + dz * dz;

    if (len2 < 0.001) continue; // degenerate segment

    let t = ((cx - x1) * dx + (cz - z1) * dz) / len2;
    t = Math.max(0, Math.min(1, t));

    const nearX = x1 + t * dx;
    const nearZ = z1 + t * dz;
    const distX = cx - nearX;
    const distZ = cz - nearZ;
    const dist = Math.sqrt(distX * distX + distZ * distZ);

    if (dist < WALL_MARGIN && dist > 0.001) {
      // Push away from wall
      const nx = distX / dist;
      const nz = distZ / dist;
      cx = nearX + nx * WALL_MARGIN;
      cz = nearZ + nz * WALL_MARGIN;
    }
  }

  return [cx, cz];
}

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

interface FreeRoamControllerProps {
  enabled: boolean;
  /** External joystick input: x = strafe (-1 left, 1 right), y = forward (-1 back, 1 forward) */
  joystickInput?: { x: number; y: number };
  /** External look delta (from virtual joystick look area) */
  lookDelta?: number;
}

export default function FreeRoamController({ enabled, joystickInput, lookDelta }: FreeRoamControllerProps) {
  const { camera, gl } = useThree();

  // Movement state
  const keys = useRef({ w: false, a: false, s: false, d: false });
  const yaw = useRef(0);       // horizontal look angle
  const isPointerDown = useRef(false);
  const lastPointerX = useRef(0);

  const MOVE_SPEED = 2.5;      // units per second
  const LOOK_SPEED = 0.003;    // radians per pixel

  // Keyboard handlers
  useEffect(() => {
    if (!enabled) return;

    const onDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "w" || k === "arrowup") keys.current.w = true;
      if (k === "a" || k === "arrowleft") keys.current.a = true;
      if (k === "s" || k === "arrowdown") keys.current.s = true;
      if (k === "d" || k === "arrowright") keys.current.d = true;
    };
    const onUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "w" || k === "arrowup") keys.current.w = false;
      if (k === "a" || k === "arrowleft") keys.current.a = false;
      if (k === "s" || k === "arrowdown") keys.current.s = false;
      if (k === "d" || k === "arrowright") keys.current.d = false;
    };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      keys.current = { w: false, a: false, s: false, d: false };
    };
  }, [enabled]);

  // Mouse/touch look handlers
  useEffect(() => {
    if (!enabled) return;
    const canvas = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      isPointerDown.current = true;
      lastPointerX.current = e.clientX;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isPointerDown.current) return;
      const dx = e.clientX - lastPointerX.current;
      lastPointerX.current = e.clientX;
      yaw.current -= dx * LOOK_SPEED;
    };
    const onPointerUp = () => {
      isPointerDown.current = false;
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerUp);

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerUp);
    };
  }, [enabled, gl]);

  // Initialize yaw from current camera direction when entering free-roam
  const initialized = useRef(false);
  useEffect(() => {
    if (enabled && !initialized.current) {
      // Get current camera forward direction
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      yaw.current = Math.atan2(-dir.x, -dir.z);
      initialized.current = true;
    }
    if (!enabled) {
      initialized.current = false;
    }
  }, [enabled, camera]);

  // Frame update — movement + collision + look
  useFrame((_, delta) => {
    if (!enabled) return;

    const dt = Math.min(delta, 0.05); // cap delta

    // Calculate forward/right vectors from yaw (horizontal only)
    const forwardX = -Math.sin(yaw.current);
    const forwardZ = -Math.cos(yaw.current);
    const rightX = Math.cos(yaw.current);
    const rightZ = -Math.sin(yaw.current);

    // Apply external look delta (virtual joystick)
    if (lookDelta) {
      yaw.current -= lookDelta * LOOK_SPEED;
    }

    // Accumulate movement from keyboard
    let moveX = 0;
    let moveZ = 0;

    if (keys.current.w) { moveX += forwardX; moveZ += forwardZ; }
    if (keys.current.s) { moveX -= forwardX; moveZ -= forwardZ; }
    if (keys.current.a) { moveX -= rightX; moveZ -= rightZ; }
    if (keys.current.d) { moveX += rightX; moveZ += rightZ; }

    // Add joystick input
    if (joystickInput) {
      moveX += forwardX * joystickInput.y + rightX * joystickInput.x;
      moveZ += forwardZ * joystickInput.y + rightZ * joystickInput.x;
    }

    // Normalize diagonal movement
    const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (len > 0) {
      moveX = (moveX / len) * MOVE_SPEED * dt;
      moveZ = (moveZ / len) * MOVE_SPEED * dt;
    }

    // Apply movement with collision
    let newX = camera.position.x + moveX;
    let newZ = camera.position.z + moveZ;
    [newX, newZ] = collideWalls(newX, newZ);

    camera.position.x = newX;
    camera.position.z = newZ;
    camera.position.y = 1.7; // locked eye height

    // Apply look direction
    const lookX = camera.position.x + forwardX * 5;
    const lookZ = camera.position.z + forwardZ * 5;
    camera.lookAt(lookX, 1.6, lookZ);
  });

  return null; // no visual output — just controls
}
