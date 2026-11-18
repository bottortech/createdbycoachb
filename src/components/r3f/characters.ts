import * as THREE from "three";

// Avatars a visitor can walk the 3D gallery with. Every entry must be a
// Mixamo-rigged FBX (any "mixamorigN:" bone prefix works — see
// prepareCharacter). The walk/turn/idle clips in /character-movement are
// shared by all of them.
export interface CharacterDef {
  id: string;
  name: string;
  path: string;
  /** Standing height in meters once placed in the gallery. */
  height: number;
}

export const CHARACTERS: CharacterDef[] = [
  { id: "coachb", name: "Coach B", path: "/character-movement/coachb.fbx", height: 1.78 },
  // The original Mixamo avatar — kept for the upcoming character picker.
  { id: "classic", name: "Classic", path: "/character-movement/character-base.fbx", height: 1.76 },
];

export const ACTIVE_CHARACTER: CharacterDef = CHARACTERS[0];

/** Mixamo exports name bones "mixamorig:Hips", "mixamorig10:Hips", …; three.js
 *  drops the colon ("mixamorig10Hips"). Characters and animation clips from
 *  different downloads use different numbers, so both sides are normalized
 *  to the bare bone name ("Hips") before animations are bound. */
export function stripMixamoPrefix(name: string): string {
  return name.replace(/^mixamorig\d*:?/, "");
}

export interface PreparedCharacter {
  /** Uniform scale (model units → meters) that gives the configured height. */
  scale: number;
  /** Hips height above the feet, in the model's own units — the animation
   *  clips' hips position track is rescaled to this so a character with a
   *  different build doesn't float or crouch. */
  hipsHeight: number;
}

const prepared = new WeakMap<THREE.Object3D, PreparedCharacter>();

/** Normalizes bone names once and measures the model. Safe to call from any
 *  component that uses the same (cached) loaded model. */
export function prepareCharacter(model: THREE.Group, def: CharacterDef): PreparedCharacter {
  const cached = prepared.get(model);
  if (cached) return cached;

  // Every node, not just bones: some Mixamo exports also have a non-bone
  // "mixamorigN:Hips" helper node, and the animation binds to whichever
  // matching node it finds first — renaming all keeps that unchanged.
  model.traverse((child) => {
    child.name = stripMixamoPrefix(child.name);
  });

  // Measure in the model's own space, independent of wherever it's mounted.
  const savedParent = model.parent;
  savedParent?.remove(model);
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  let hipsY = 0;
  model.traverse((child) => {
    if (child.name === "Hips" && hipsY === 0) {
      hipsY = child.getWorldPosition(new THREE.Vector3()).y;
    }
  });
  savedParent?.add(model);

  const modelHeight = Math.max(box.max.y - box.min.y, 1e-6);
  const result = { scale: def.height / modelHeight, hipsHeight: hipsY - box.min.y };
  prepared.set(model, result);
  return result;
}
