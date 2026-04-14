"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture, Text } from "@react-three/drei";
import * as THREE from "three";
import { Project } from "../gallery/ProjectModal";
import GalleryLight from "./GalleryLight";

const WORK_TYPE: Record<string, string> = {
  "WiggleWoo's Word Quest": "Educational Game / Web App",
  "Carla's Creation": "Flyer Design",
  "JB TV": "Brand Logo / Visual Identity",
  "Lush Brows": "Logo Design",
  "RetroRack.app": "Inventory Management Web App",
  "RetroRack Logo": "Brand Logo Design",
  "RetroRack Extension": "Chrome Extension / Cross Listing Tool",
  "Bottor Assist": "AI Tool / Web App",
  "By Any Means": "Brand Logo Design",
  "WiggleWoo Character": "Character Design",
  "Professor WiggleWoo": "Children's Book",
};

// Frame PNG textures with actual image aspect ratios and inner cutout ratios.
// cutout = what fraction of the frame PNG width is the inner opening
const FRAME_TEXTURES: Record<string, { src: string; pngAspect: number; cutout: number }> = {
  square:    { src: "/images/frames/frame-square.png",    pngAspect: 1024 / 1536, cutout: 0.72 },
  landscape: { src: "/images/frames/frame-landscape.png", pngAspect: 1536 / 1024, cutout: 0.62 },
  portrait:  { src: "/images/frames/frame-portrait.png",  pngAspect: 1024 / 1536, cutout: 0.58 },
};

const FRAME_ASPECT: Record<string, number> = {
  square: 1,
  landscape: 3 / 2,
  portrait: 2 / 3,
};

interface WallArtworkProps {
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  frameType: "square" | "landscape" | "portrait";
  project: Project;
  onClick: () => void;
  isActive?: boolean;
}

export default function WallArtwork({
  position,
  rotation,
  width,
  frameType,
  project,
  onClick,
  isActive = false,
}: WallArtworkProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const aspect = FRAME_ASPECT[frameType];
  const height = width / aspect;

  const D = 0.04;
  const frameBorder = 0.06;
  const matBorder = 0.02;

  const artW = width - (frameBorder + matBorder) * 2;
  const artH = height - (frameBorder + matBorder) * 2;

  const artTexture = useTexture(project.image);
  // plaque.png has no alpha — using 3D geometry instead
  const frameConfig = FRAME_TEXTURES[frameType];
  const hasFrameTexture = Boolean(frameConfig);
  const frameTexture = useTexture(hasFrameTexture ? frameConfig.src : project.image);

  // Frame plane dimensions — use the PNG's natural aspect ratio
  const frameScale = 1.15;
  const frameW = width * frameScale;
  const frameH = hasFrameTexture ? frameW / frameConfig.pngAspect : frameW / aspect;

  // Artwork dimensions — fill the inner opening of the frame
  const artScale = hasFrameTexture ? frameW * frameConfig.cutout : width * 0.58;
  const artAspect = aspect; // artwork matches the frame type's aspect ratio

  useFrame(() => {
    if (!groupRef.current) return;
    const targetZ = hovered ? 0.02 : 0;
    groupRef.current.position.z += (targetZ - groupRef.current.position.z) * 0.08;
  });

  // Plaque dimensions
  const plaqueW = Math.max(width * 0.55, 0.35);
  const plaqueH = 0.08;

  return (
    <group position={position} rotation={rotation}>
      <group
        ref={groupRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        {hasFrameTexture ? (
          <>
            {/* === PNG FRAME MODE === */}
            {/* Artwork behind — fills the inner opening of the frame */}
            <mesh position={[0, 0, 0.003]}>
              <planeGeometry args={[artScale, artScale / artAspect]} />
              <meshStandardMaterial map={artTexture} toneMapped={false} />
            </mesh>

            {/* Frame PNG in front — transparent center shows artwork behind */}
            <mesh position={[0, 0, 0.006]} renderOrder={1}>
              <planeGeometry args={[frameW, frameH]} />
              <meshBasicMaterial
                map={frameTexture}
                transparent
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          </>
        ) : (
          <>
            {/* === 3D GEOMETRY FRAME MODE (landscape/portrait) === */}
            {/* Back plate */}
            <mesh position={[0, 0, 0.0025]}>
              <boxGeometry args={[width + 0.01, height + 0.01, 0.005]} />
              <meshStandardMaterial color="#080604" />
            </mesh>

            {/* Frame sides */}
            <mesh position={[0, height / 2 - frameBorder / 2, D / 2 + 0.0025]} castShadow>
              <boxGeometry args={[width, frameBorder, D]} />
              <meshStandardMaterial color="#2a1d10" metalness={0.3} roughness={0.65} />
            </mesh>
            <mesh position={[0, -height / 2 + frameBorder / 2, D / 2 + 0.0025]} castShadow>
              <boxGeometry args={[width, frameBorder, D]} />
              <meshStandardMaterial color="#2a1d10" metalness={0.3} roughness={0.65} />
            </mesh>
            <mesh position={[-width / 2 + frameBorder / 2, 0, D / 2 + 0.0025]} castShadow>
              <boxGeometry args={[frameBorder, height, D]} />
              <meshStandardMaterial color="#2a1d10" metalness={0.3} roughness={0.65} />
            </mesh>
            <mesh position={[width / 2 - frameBorder / 2, 0, D / 2 + 0.0025]} castShadow>
              <boxGeometry args={[frameBorder, height, D]} />
              <meshStandardMaterial color="#2a1d10" metalness={0.3} roughness={0.65} />
            </mesh>

            {/* Gilt trim */}
            <mesh position={[0, artH / 2 + matBorder + 0.005, D - 0.002]}>
              <boxGeometry args={[artW + matBorder * 2, 0.008, 0.006]} />
              <meshStandardMaterial color="#c9a84c" metalness={0.6} roughness={0.35} />
            </mesh>
            <mesh position={[0, -artH / 2 - matBorder - 0.005, D - 0.002]}>
              <boxGeometry args={[artW + matBorder * 2, 0.008, 0.006]} />
              <meshStandardMaterial color="#c9a84c" metalness={0.6} roughness={0.35} />
            </mesh>

            {/* Mat */}
            <mesh position={[0, 0, D - 0.008]}>
              <planeGeometry args={[artW + matBorder * 2, artH + matBorder * 2]} />
              <meshStandardMaterial color="#e8e0d0" />
            </mesh>

            {/* Artwork */}
            <mesh position={[0, 0, D - 0.004]}>
              <planeGeometry args={[artW, artH]} />
              <meshStandardMaterial map={artTexture} toneMapped={false} />
            </mesh>

            {/* Glass */}
            <mesh position={[0, 0, D + 0.001]}>
              <planeGeometry args={[width - frameBorder * 2, height - frameBorder * 2]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={hovered ? 0.04 : 0.01} />
            </mesh>
          </>
        )}
      </group>

      {/* Plaque — positioned below the frame's visual bottom */}
      <group position={[0, -(hasFrameTexture ? (frameType === "square" ? frameH / 2 - 0.12 : frameH / 2) : height / 2) - 0.08, 0.005]}>
        {/* Brass plaque — 3D geometry with metallic gold finish */}
        <mesh>
          <boxGeometry args={[plaqueW * 1.4, plaqueH * 1.3, 0.01]} />
          <meshStandardMaterial color="#c9a84c" metalness={0.65} roughness={0.3} />
        </mesh>
        {/* Thin dark border inset */}
        <mesh position={[0, 0, 0.006]}>
          <boxGeometry args={[plaqueW * 1.4 - 0.01, plaqueH * 1.3 - 0.008, 0.002]} />
          <meshStandardMaterial color="#b8922e" metalness={0.7} roughness={0.25} />
        </mesh>
        {/* Type label only */}
        <Text
          position={[0, 0.002, 0.008]}
          fontSize={0.028}
          color="#1a1108"
          anchorX="center"
          anchorY="middle"
          maxWidth={plaqueW * 1.3}
          textAlign="center"
          fontWeight="bold"
          letterSpacing={0.06}
        >
          {(WORK_TYPE[project.title] || project.category).toUpperCase()}
        </Text>
      </group>

      {/* Gallery picture light — above the frame */}
      <group position={[0, (hasFrameTexture ? frameH / 2 : height / 2) + 0.08, 0.01]}>
        <GalleryLight isActive={isActive} width={hasFrameTexture ? frameW : width} />
      </group>

    </group>
  );
}
