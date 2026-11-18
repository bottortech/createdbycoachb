// Where each published prediction's board hangs in the AI Predictions Wing,
// shared by the room itself (PredictionsWing.tsx, lazy-loaded) and the scene
// (GalleryScene.tsx), which needs the same positions to walk a visitor up to a
// board picked from the wing's PredictionsMap. Kept in its own tiny module so
// importing it doesn't pull the whole wing into the main gallery bundle.
//
// Room: x=-5..0, z=-9..-4 (doorway in the z=-4 wall). Visitors enter facing
// the back wall, so boards are numbered left-to-right in that view:
//   west wall (near → far) → back wall (left → right) → east wall (far → near)
// That gives 7 boards at eye level. If the archive outgrows that, a second
// row is added above it in the same order (14 total) and the first row drops
// slightly so both rows stay readable.

export const BOARD_WIDTH = 1.3;
export const BOARD_HEIGHT = 0.95;

const WALL_INSET = 0.012;
const X_MIN = -5;
const X_MAX = 0;
const Z_MIN = -9;

type Vec3 = [number, number, number];

interface WallSpot {
  x: number;
  z: number;
  /** Rotation about Y so the board's front (+z in its own space) faces into the room. */
  rotY: number;
  /** Unit vector pointing from the wall into the room. */
  normal: [number, number];
}

const SPOTS: WallSpot[] = [
  // West wall (x=-5), faces +x — near the doorway first
  { x: X_MIN + WALL_INSET, z: -5.35, rotY: Math.PI / 2, normal: [1, 0] },
  { x: X_MIN + WALL_INSET, z: -7.65, rotY: Math.PI / 2, normal: [1, 0] },
  // Back wall (z=-9), faces +z — left to right
  { x: -4.0, z: Z_MIN + WALL_INSET, rotY: 0, normal: [0, 1] },
  { x: -2.5, z: Z_MIN + WALL_INSET, rotY: 0, normal: [0, 1] },
  { x: -1.0, z: Z_MIN + WALL_INSET, rotY: 0, normal: [0, 1] },
  // East wall (x=0), faces -x — far end first
  { x: X_MAX - WALL_INSET, z: -7.65, rotY: -Math.PI / 2, normal: [-1, 0] },
  { x: X_MAX - WALL_INSET, z: -5.35, rotY: -Math.PI / 2, normal: [-1, 0] },
];

export const MAX_PREDICTION_BOARDS = SPOTS.length * 2;

export interface BoardSlot {
  position: Vec3;
  rotation: Vec3;
  normal: [number, number];
}

/** Board slots for `count` predictions, in display order. */
export function getBoardSlots(count: number): BoardSlot[] {
  const twoRows = count > SPOTS.length;
  const rowY = twoRows ? [1.6, 2.75] : [1.75];
  const slots: BoardSlot[] = [];
  for (let i = 0; i < Math.min(count, MAX_PREDICTION_BOARDS); i++) {
    const spot = SPOTS[i % SPOTS.length];
    const y = rowY[Math.floor(i / SPOTS.length)];
    slots.push({ position: [spot.x, y, spot.z], rotation: [0, spot.rotY, 0], normal: spot.normal });
  }
  return slots;
}

export interface BoardView {
  /** Where the avatar stands (floor level) and the point it faces. */
  avatar: Vec3;
  facing: Vec3;
  /** Camera framing used while the avatar stays put — set back far enough
   *  and high enough that the avatar sits below the sight line to the board. */
  camera: Vec3;
  look: Vec3;
}

/** A clear, readable view of the board in `slot` (fits a portrait phone). */
export function getBoardView(slot: BoardSlot): BoardView {
  const [x, y, z] = slot.position;
  const [nx, nz] = slot.normal;
  return {
    avatar: [x + nx * 1.9, 0, z + nz * 1.9],
    facing: [x, y, z],
    // +0.75 keeps the avatar's head (1.8m) under the sight line to the
    // board's bottom edge even for the lower of two rows; capped below the
    // 3.6m ceiling for the upper row.
    camera: [x + nx * 3.3, Math.min(y + 0.75, 3.45), z + nz * 3.3],
    look: [x, y, z],
  };
}
