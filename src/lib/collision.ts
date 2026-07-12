// Hand-rolled 2D (X/Z) AABB collision for the walkable gallery character.
// No physics library in this project, and every wall in the scene is
// axis-aligned (rotations are multiples of 90°), so a flat array of boxes
// checked with simple arithmetic is both correct and effectively free
// compared to what already stressed the GPU on weak hardware.

export interface BoxCollider {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  label?: string;
}

const WALL_THICKNESS = 0.15;

/** A wall running along X at a fixed Z (e.g. "north wall z=1, x:0..20"). */
function wallAlongX(z: number, xMin: number, xMax: number, label?: string): BoxCollider {
  const h = WALL_THICKNESS / 2;
  return { minX: xMin, maxX: xMax, minZ: z - h, maxZ: z + h, label };
}

/** A wall running along Z at a fixed X (e.g. "east end wall x=19, z:-4..1"). */
function wallAlongZ(x: number, zMin: number, zMax: number, label?: string): BoxCollider {
  const h = WALL_THICKNESS / 2;
  return { minX: x - h, maxX: x + h, minZ: zMin, maxZ: zMax, label };
}

/** A free-standing footprint (pedestal/vitrine/statue), centered on (cx, cz). */
function footprint(cx: number, cz: number, width: number, depth: number, label?: string): BoxCollider {
  return { minX: cx - width / 2, maxX: cx + width / 2, minZ: cz - depth / 2, maxZ: cz + depth / 2, label };
}

const GZ = -1.5;

// Full-height room walls (H=3.6) — block both the ground-level character
// and the 3rd-person camera (which sits at ~1.6m).
const WALLS: BoxCollider[] = [
  // --- Entry Chamber ---
  wallAlongX(2, -3, 3, "entry front wall"),
  wallAlongX(1.2, 2, 4, "entry right accent wall"),
  wallAlongX(-1, -0.95, 0.95, "entry display panel"),

  // --- Main Gallery corridor (x:0..19, z:-4..1) ---
  wallAlongX(1, 0, 20, "main gallery north wall"),
  wallAlongX(-4, 0, 3, "main gallery south wall (west of Tech Vault doorway)"),
  wallAlongX(-4, 5, 20, "main gallery south wall (east of Tech Vault doorway)"),
  wallAlongZ(19, -4, 1, "main gallery east end wall"),

  // --- Gallery II west wing (x:-19..0, z:-4..1) ---
  wallAlongX(1, -19, 0, "gallery II north wall"),
  wallAlongX(-4, -19, -3.5, "gallery II south wall (west of Predictions doorway)"),
  wallAlongX(-4, -1.5, 0, "gallery II south wall (east of Predictions doorway)"),
  wallAlongZ(-19, -4, 1, "gallery II west end wall"),
  wallAlongZ(-6, -3.5, 0.5, "gallery II velvet rope barrier"),

  // --- AI Predictions Wing (x:-5..0, z:-9..-4) ---
  wallAlongX(-9, -5, 0, "predictions wing back wall"),
  wallAlongZ(-5, -9, -4, "predictions wing west wall"),
  wallAlongZ(0, -9, -4, "predictions wing east wall"),

  // --- Tech Vault (x:0.5..7.5, z:-11..-4) ---
  wallAlongZ(0.5, -11, -4, "tech vault west wall"),
  wallAlongZ(7.5, -11, -4, "tech vault east wall"),
  wallAlongX(-11, 0.5, 7.5, "tech vault back wall"),
];

// Tech Vault display vitrines — pedestal (0.3m) + glass case (1.7m) = 2.0m
// tall, taller than the camera, so these block it too, unlike the low
// furniture below.
const VITRINES: BoxCollider[] = [
  footprint(2, -10, 0.8, 0.6, "tech vault vitrine: backend"),
  footprint(4, -10, 0.8, 0.6, "tech vault vitrine: ai core"),
  footprint(6, -10, 0.8, 0.6, "tech vault vitrine: frontend"),
  footprint(1.5, -7.5, 0.8, 0.6, "tech vault vitrine: dev tools"),
  footprint(3, -7.5, 0.8, 0.6, "tech vault vitrine: payments"),
  footprint(4.5, -7.5, 0.8, 0.6, "tech vault vitrine: game dev"),
  footprint(6, -7.5, 0.8, 0.6, "tech vault vitrine: automation"),
];

// Low furniture (service pedestals ~0.6m, goat statue's tallest tier ~0.5m)
// — well under the ~1.6m camera height, so these should block the
// ground-level character but never the boom camera flying over them.
const LOW_OBSTACLES: BoxCollider[] = [
  footprint(17.5, GZ + 1.2, 0.7, 0.7, "service pedestal: connect"),
  footprint(17.5, GZ + 0.4, 0.7, 0.7, "service pedestal: enterprise"),
  footprint(17.5, GZ - 0.4, 0.7, 0.7, "service pedestal: commission"),
  footprint(17.5, GZ - 1.2, 0.7, 0.7, "service pedestal: appointments"),
  footprint(10, GZ, 1.4, 1.0, "goat statue"),
];

/** Ground-level colliders for the walkable character (WASD/joystick, free mode). */
export const GALLERY_COLLIDERS: BoxCollider[] = [...WALLS, ...VITRINES, ...LOW_OBSTACLES];

/** Colliders tall enough to matter for the 3rd-person boom camera — walls and vitrines only. */
export const CAMERA_COLLIDERS: BoxCollider[] = [...WALLS, ...VITRINES];

export const CHARACTER_RADIUS_DEFAULT = 0.3;

function circleHitsBox(cx: number, cz: number, r: number, b: BoxCollider): boolean {
  const closestX = Math.max(b.minX, Math.min(cx, b.maxX));
  const closestZ = Math.max(b.minZ, Math.min(cz, b.maxZ));
  const dx = cx - closestX;
  const dz = cz - closestZ;
  return dx * dx + dz * dz < r * r;
}

function isBlocked(x: number, z: number, colliders: BoxCollider[], r: number): boolean {
  for (let i = 0; i < colliders.length; i++) {
    if (circleHitsBox(x, z, r, colliders[i])) return true;
  }
  return false;
}

/**
 * Marches outward from (originX, originZ) along a unit direction up to
 * maxDist, returning the furthest distance that doesn't overlap a collider
 * (expanded by `clearance`).
 */
function findSafeDistance(
  originX: number,
  originZ: number,
  dirX: number,
  dirZ: number,
  maxDist: number,
  colliders: BoxCollider[],
  clearance: number,
  steps = 48
): number {
  let safe = 0;
  for (let i = 1; i <= steps; i++) {
    const d = (maxDist * i) / steps;
    const x = originX + dirX * d;
    const z = originZ + dirZ * d;
    if (isBlocked(x, z, colliders, clearance)) break;
    safe = d;
  }
  return safe;
}

// How much of the true available space to actually use for the camera boom.
// Using a fixed clearance buffer instead of this scales badly: a buffer
// sized for a spacious room rejects almost the entire path in a tight spot
// (rounding all the way down to 0, which puts the camera inside the
// character's own body — worse than the wall-clip this is meant to avoid).
// Scaling off the true physical limit at each spot instead means a tight
// spot just gets a proportionally tighter — but still valid — shot.
const CAMERA_SAFETY_FACTOR = 0.85;

/**
 * Safe 3rd-person boom distance for a character at (charX, charZ) facing
 * along the unit direction (dirX, dirZ), up to `maxDist`. Every STOPS camera
 * spot in the gallery was tuned for a first-person view, which never needed
 * clearance behind it — several end up too close to a wall/vitrine for a
 * fixed-distance boom, embedding the camera in the wall. This keeps every
 * stop usable (proportionally tighter framing in tight spots, full distance
 * everywhere else) without hand-tuning each one.
 */
export function findSafeCameraDistance(charX: number, charZ: number, dirX: number, dirZ: number, maxDist: number): number {
  const trueLimit = findSafeDistance(charX, charZ, dirX, dirZ, maxDist, CAMERA_COLLIDERS, 0.02);
  return Math.min(maxDist, trueLimit * CAMERA_SAFETY_FACTOR);
}

/**
 * Axis-separated move-and-slide: tries the X-only move against the current
 * Z, then the Z-only move against the (possibly just-updated) X. This is
 * what turns a diagonal walk into a wall into sliding along it, instead of
 * a hard stop the instant either axis would overlap.
 */
export function resolveMove(
  x: number,
  z: number,
  dx: number,
  dz: number,
  colliders: BoxCollider[],
  radius: number = CHARACTER_RADIUS_DEFAULT
): { x: number; z: number } {
  let nx = x;
  let nz = z;
  if (dx !== 0) {
    const tryX = x + dx;
    if (!isBlocked(tryX, nz, colliders, radius)) nx = tryX;
  }
  if (dz !== 0) {
    const tryZ = z + dz;
    if (!isBlocked(nx, tryZ, colliders, radius)) nz = tryZ;
  }
  return { x: nx, z: nz };
}
