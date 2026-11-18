"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { useFBX, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import CharacterModel from "./CharacterModel";
import { ACTIVE_CHARACTER, prepareCharacter, stripMixamoPrefix } from "./characters";

// Retargets a Mixamo clip onto the active character: track names lose their
// "mixamorigN" prefix (matching prepareCharacter's renamed nodes), and the
// hips position track — the only position track Mixamo clips carry; every
// other bone is rotation-only and transfers as-is — is rescaled from the
// skeleton the clip was recorded on to this character's hip height.
function retargetClip(clip: THREE.AnimationClip, hipsRatio: number): THREE.AnimationClip {
  const out = clip.clone();
  out.tracks.forEach((track) => {
    const dot = track.name.indexOf(".");
    track.name = stripMixamoPrefix(track.name.slice(0, dot)) + track.name.slice(dot);
    if (hipsRatio !== 1 && track.name === "Hips.position") {
      for (let i = 0; i < track.values.length; i++) track.values[i] *= hipsRatio;
    }
  });
  return out;
}

export type MovementState = "idle" | "walk" | "walkBack" | "turnLeft" | "turnRight";

const CLIP_PATHS: Record<MovementState, string> = {
  idle: "/character-movement/breathing-idle.fbx",
  walk: "/character-movement/walking.fbx",
  walkBack: "/character-movement/walking-backwards.fbx",
  turnLeft: "/character-movement/left-turn.fbx",
  turnRight: "/character-movement/right-turn.fbx",
};

// Basic crossfade for now — Phase 4 is where blend quality gets tuned further.
const FADE_SECONDS = 0.35;

// Mixamo bakes world-space root motion into the Hips bone: Walking/Walking
// Backwards translate the hips forward/back across the clip, and Left/Right
// Turn rotate the hips in place. CharacterController is the ONLY thing
// allowed to move/rotate the character (it drives the outer group every
// frame from WASD input), so left unstripped, the baked motion fights it —
// on Walking specifically, the hips slide forward all clip long and then
// jump back to their start pose the instant the loop restarts, which reads
// exactly like "moves forward, then snaps back." Freezing the hips' XZ
// position and yaw rotation to their first-frame values removes the baked
// world motion while keeping the vertical bob and all leg/arm/spine motion
// (which are separate bones/tracks) untouched.
function stripHipsRootMotion(clip: THREE.AnimationClip): THREE.AnimationClip {
  const cloned = clip.clone();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();

  cloned.tracks.forEach((track) => {
    const isHips = track.name.toLowerCase().includes("hips");
    if (!isHips) return;

    if (track.name.endsWith(".position") && track instanceof THREE.VectorKeyframeTrack) {
      const values = track.values;
      const firstX = values[0];
      const firstZ = values[2];
      for (let i = 0; i < values.length; i += 3) {
        values[i] = firstX;
        values[i + 2] = firstZ;
      }
    }

    if (track.name.endsWith(".quaternion") && track instanceof THREE.QuaternionKeyframeTrack) {
      const values = track.values;
      for (let i = 0; i < values.length; i += 4) {
        q.set(values[i], values[i + 1], values[i + 2], values[i + 3]);
        e.setFromQuaternion(q, "YXZ");
        e.y = 0; // neutralize baked yaw — CharacterController's outer group owns all turning
        q.setFromEuler(e);
        values[i] = q.x;
        values[i + 1] = q.y;
        values[i + 2] = q.z;
        values[i + 3] = q.w;
      }
    }
  });

  return cloned;
}

export interface AnimationControllerHandle {
  /**
   * Called every frame. `speedRatio` = actual current speed / the speed the
   * clip was designed for (1 = matches natural pace) — keeps foot/leg motion
   * synced to how fast the character is really moving instead of always
   * playing at the clip's fixed authored pace (which reads as sliding or
   * walking-in-place). Ignored for "idle" — Breathing Idle always plays at 1x.
   */
  update: (state: MovementState, speedRatio: number) => void;
}

const AnimationController = forwardRef<AnimationControllerHandle>(function AnimationController(_props, ref) {
  const group = useRef<THREE.Group>(null);

  const idleFbx = useFBX(CLIP_PATHS.idle);
  const walkFbx = useFBX(CLIP_PATHS.walk);
  const walkBackFbx = useFBX(CLIP_PATHS.walkBack);
  const turnLeftFbx = useFBX(CLIP_PATHS.turnLeft);
  const turnRightFbx = useFBX(CLIP_PATHS.turnRight);
  const characterFbx = useFBX(ACTIVE_CHARACTER.path);

  const clips = useMemo(() => {
    // All clips come from the same Mixamo skeleton; the idle clip's first
    // frame gives that skeleton's hip height. Within 3% counts as the same
    // build (e.g. the classic avatar) and is left untouched.
    const { hipsHeight } = prepareCharacter(characterFbx, ACTIVE_CHARACTER);
    const idleHips = idleFbx.animations[0]?.tracks.find((t) => /Hips\.position$/.test(t.name));
    const sourceHips = idleHips ? idleHips.values[1] : hipsHeight;
    const rawRatio = sourceHips > 0 ? hipsHeight / sourceHips : 1;
    const hipsRatio = Math.abs(rawRatio - 1) < 0.03 ? 1 : rawRatio;

    // Idle is left completely untouched — it looks good as-is and has no
    // horizontal root motion to strip anyway.
    const named = (src: THREE.Group, name: MovementState, stripRootMotion: boolean) => {
      let clip = src.animations[0] ? retargetClip(src.animations[0], hipsRatio) : undefined;
      if (clip) {
        clip.name = name;
        if (stripRootMotion) clip = stripHipsRootMotion(clip);
      }
      return clip;
    };
    return [
      named(idleFbx, "idle", false),
      named(walkFbx, "walk", true),
      named(walkBackFbx, "walkBack", true),
      named(turnLeftFbx, "turnLeft", true),
      named(turnRightFbx, "turnRight", true),
    ].filter(Boolean) as THREE.AnimationClip[];
  }, [idleFbx, walkFbx, walkBackFbx, turnLeftFbx, turnRightFbx, characterFbx]);

  const { actions } = useAnimations(clips, group);
  const currentState = useRef<MovementState>("idle");

  useEffect(() => {
    actions.idle?.reset().fadeIn(FADE_SECONDS).play();
  }, [actions]);

  useImperativeHandle(
    ref,
    () => ({
      update: (state: MovementState, speedRatio: number) => {
        if (state !== currentState.current) {
          actions[currentState.current]?.fadeOut(FADE_SECONDS);
          actions[state]?.reset().fadeIn(FADE_SECONDS).play();
          currentState.current = state;
        }
        const action = actions[state];
        if (action && state !== "idle") {
          action.timeScale = THREE.MathUtils.clamp(speedRatio, 0.4, 1.6);
        }
      },
    }),
    [actions]
  );

  return (
    <group ref={group} dispose={null}>
      <CharacterModel />
    </group>
  );
});

export default AnimationController;
