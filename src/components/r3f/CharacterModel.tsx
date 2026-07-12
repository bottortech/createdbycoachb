"use client";

import { useEffect } from "react";
import { useFBX } from "@react-three/drei";
import * as THREE from "three";

const CHARACTER_PATH = "/character-movement/character-base.fbx";

// The source FBX embeds its Diffuse/Normal/Specular/Glossiness maps at
// 4096x4096 each (Mixamo's default export) — ~250MB+ of GPU memory for a
// character that never fills more than a fraction of the screen. That's
// what was collapsing FPS the instant the character became visible.
// Downscaling here (post-load, pre-GPU-upload) avoids needing to re-export
// the source asset from Mixamo/Blender.
const MAX_TEXTURE_SIZE = 1024;

function downscaleTexture(texture: THREE.Texture) {
  const apply = () => {
    const image = texture.image as HTMLImageElement | undefined;
    if (!image || !image.width || image.width <= MAX_TEXTURE_SIZE) return;
    const scale = MAX_TEXTURE_SIZE / Math.max(image.width, image.height);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    texture.image = canvas;
    texture.needsUpdate = true;
  };

  const image = texture.image as HTMLImageElement | undefined;
  if (image && "complete" in image && !image.complete) {
    image.addEventListener("load", apply, { once: true });
  } else {
    apply();
  }
}

/** Loads the Mixamo character mesh + skeleton. Purely visual — no position/animation logic. */
export default function CharacterModel() {
  const fbx = useFBX(CHARACTER_PATH);

  useEffect(() => {
    fbx.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((mat) => {
          const m = mat as THREE.MeshPhongMaterial;
          [m.map, m.normalMap, m.specularMap].forEach((tex) => {
            if (tex) downscaleTexture(tex);
          });
        });
      }
    });
  }, [fbx]);

  return <primitive object={fbx} />;
}
