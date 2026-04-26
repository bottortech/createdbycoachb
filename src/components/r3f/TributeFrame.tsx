"use client";

import { Text } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useRef, useState } from "react";

/**
 * Wall-mounted ornate memorial frame in the main gallery — replaces the
 * old floating-lantern portal trigger. Displays the brother's photo
 * inside a brass/walnut frame. A small engraved placard hangs below.
 *
 * Hovering switches the cursor to pointer (no visual brighten — the
 * frame stays at one steady appearance). Clicking flies the camera
 * into the tribute room and plays a soft wind-chime sound cue.
 */
interface TributeFrameProps {
  /** World position of the frame center (the photo center). */
  position: [number, number, number];
  /** Y rotation so the frame faces away from the wall it's mounted on.
   *  Default 0 = frame normal points in world +Z (mounted on a wall
   *  whose surface faces +Z, e.g. the south gallery wall). */
  rotationY?: number;
  /** Fires when the frame is clicked. Parent flies the camera into
   *  the tribute room. */
  onClick?: () => void;
}

const PHOTO_SRC = "/images/anime-brother.png";
const SOUND_SRC = "/audio/wind-chime.mp3";
const FRAME_W = 0.55;
const FRAME_H = 0.7;

export default function TributeFrame({ position, rotationY = 0, onClick }: TributeFrameProps) {
  const [photoTex, setPhotoTex] = useState<THREE.Texture | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Imperative texture load so a slow/failing photo download can never
  // blank the surrounding scene the way Suspense + useTexture can.
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    let cancelled = false;
    loader.load(
      PHOTO_SRC,
      (t) => {
        if (cancelled) return;
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 4;
        setPhotoTex(t);
      },
      undefined,
      () => {
        // Photo failing to load shouldn't crash anything — the frame
        // will just render with a dark fallback color.
      }
    );
    return () => {
      cancelled = true;
    };
  }, []);

  // Lazy-load the chime audio. If the file is missing, .play() rejects
  // silently and we never crash the page.
  useEffect(() => {
    const a = new Audio(SOUND_SRC);
    a.volume = 0.35;
    audioRef.current = a;
    return () => {
      a.pause();
      audioRef.current = null;
    };
  }, []);

  return (
    <group
      position={position}
      rotation={[0, rotationY, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default";
      }}
      onClick={(e) => {
        e.stopPropagation();
        // Sound cue ON CLICK ONLY (no hover sound).
        const a = audioRef.current;
        if (a) {
          a.currentTime = 0;
          a.play().catch(() => {});
        }
        onClick?.();
      }}
    >
      {/* Outer dark walnut frame backing — gives the brass detail
          something to sit against. */}
      <mesh position={[0, 0, 0]} castShadow>
        <planeGeometry args={[FRAME_W + 0.22, FRAME_H + 0.22]} />
        <meshStandardMaterial color="#2a1c0a" roughness={0.6} />
      </mesh>
      {/* Brass inner border — ornate metallic, steady appearance. */}
      <mesh position={[0, 0, 0.001]}>
        <planeGeometry args={[FRAME_W + 0.16, FRAME_H + 0.16]} />
        <meshStandardMaterial
          color="#b89248"
          metalness={0.85}
          roughness={0.32}
          emissive="#5a3a18"
          emissiveIntensity={0.28}
        />
      </mesh>
      {/* Decorative brass inset — slightly darker stripe for an ornate
          molding feel. */}
      <mesh position={[0, 0, 0.002]}>
        <planeGeometry args={[FRAME_W + 0.1, FRAME_H + 0.1]} />
        <meshStandardMaterial
          color="#8a6a2a"
          metalness={0.7}
          roughness={0.45}
        />
      </mesh>
      {/* Mat surrounding the photo */}
      <mesh position={[0, 0, 0.003]}>
        <planeGeometry args={[FRAME_W + 0.04, FRAME_H + 0.04]} />
        <meshStandardMaterial color="#1a120a" roughness={0.7} />
      </mesh>
      {/* Photo — meshBasicMaterial (unlit) so the portrait always reads
          clearly regardless of gallery lighting. Slight cream tint
          (#fff8ec) softens any harsh white. */}
      <mesh position={[0, 0, 0.005]}>
        <planeGeometry args={[FRAME_W, FRAME_H]} />
        <meshBasicMaterial
          map={photoTex ?? undefined}
          color={photoTex ? "#fff8ec" : "#1a1208"}
          toneMapped={false}
        />
      </mesh>

      {/* Wall placard — small cream rectangle with brass border, mounted
          below the frame. Engraved memorial text in three lines. */}
      <group position={[0, -FRAME_H / 2 - 0.22, 0.005]}>
        {/* Brass border */}
        <mesh position={[0, 0, -0.001]}>
          <planeGeometry args={[0.5, 0.18]} />
          <meshStandardMaterial color="#8a6a2a" metalness={0.7} roughness={0.45} />
        </mesh>
        {/* Cream plate */}
        <mesh>
          <planeGeometry args={[0.46, 0.15]} />
          <meshStandardMaterial color="#e8d8b0" roughness={0.92} />
        </mesh>
        {/* Engraved text — three lines, deep brown ink */}
        <Text
          position={[0, 0.045, 0.001]}
          fontSize={0.018}
          color="#1a1208"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.2}
        >
          IN MEMORY
        </Text>
        <Text
          position={[0, 0.005, 0.001]}
          fontSize={0.024}
          color="#1a1208"
          anchorX="center"
          anchorY="middle"
        >
          Jamal Brown
        </Text>
        <Text
          position={[0, -0.04, 0.001]}
          fontSize={0.018}
          color="#3a2818"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.1}
        >
          1997 — 2021
        </Text>
      </group>
    </group>
  );
}
