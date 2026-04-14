"use client";

import { useRef, useMemo, useState } from "react";
import { useLoader } from "@react-three/fiber";
import { useTexture, Text } from "@react-three/drei";
import * as THREE from "three";
import { TDSLoader } from "three/examples/jsm/loaders/TDSLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import SpotLightWithTarget from "./SpotLightWithTarget";

interface ServicePedestalProps {
  position: [number, number, number];
  label: string;
  sublabel: string;
  onClick: () => void;
  children: React.ReactNode; // the 3D model goes here
}

/**
 * A reusable service pedestal — marble base with spotlight,
 * brass plaque, and an interactive 3D object on top.
 */
function ServicePedestal({ position, label, sublabel, onClick, children }: ServicePedestalProps) {
  const marbleTex = useTexture("/images/gallery/floor.png");
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      {/* Spotlight */}
      <SpotLightWithTarget
        position={[0, 3.4, 0]}
        targetPosition={[position[0], 0.8, position[2]]}
        intensity={30}
        angle={0.5}
        penumbra={0.5}
        distance={8}
        castShadow
      />
      <pointLight position={[0, 2, 0.3]} intensity={2} distance={4} color="#ffe0a0" />

      {/* Pedestal base */}
      <mesh position={[0, 0.01, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.02, 0.7]} />
        <meshStandardMaterial map={marbleTex} color="#908478" metalness={0.35} roughness={0.6} />
      </mesh>
      {/* Pedestal body */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.55, 0.6, 0.55]} />
        <meshStandardMaterial map={marbleTex} color="#908478" metalness={0.35} roughness={0.6} />
      </mesh>
      {/* Pedestal cap */}
      <mesh position={[0, 0.61, 0]} castShadow>
        <boxGeometry args={[0.62, 0.02, 0.62]} />
        <meshStandardMaterial map={marbleTex} color="#a09488" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* 3D object on top */}
      <group position={[0, 0.62, 0]}>
        {children}
      </group>

      {/* Click target */}
      <mesh
        position={[0, 0.6, 0]}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        <boxGeometry args={[0.8, 1.2, 0.8]} />
        <meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
      </mesh>

      {/* Brass plaque */}
      <group position={[0, -0.02, 0.35]}>
        <mesh>
          <boxGeometry args={[0.45, 0.08, 0.008]} />
          <meshStandardMaterial color="#c9a84c" metalness={0.55} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.005]}>
          <boxGeometry args={[0.43, 0.07, 0.002]} />
          <meshStandardMaterial color="#b8922e" metalness={0.7} roughness={0.25} />
        </mesh>
        <Text
          position={[0, 0.008, 0.008]}
          fontSize={0.018}
          color="#1a1108"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          letterSpacing={0.05}
        >
          {label.toUpperCase()}
        </Text>
        <Text
          position={[0, -0.012, 0.008]}
          fontSize={0.011}
          color="#3a2810"
          anchorX="center"
          anchorY="middle"
        >
          {sublabel.toUpperCase()}
        </Text>
      </group>

      {/* Floor glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <circleGeometry args={[0.5, 32]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.3} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <circleGeometry args={[0.35, 32]} />
        <meshBasicMaterial color="#c9a84c" transparent opacity={0.05} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  INDIVIDUAL SERVICE MODELS                                          */
/* ------------------------------------------------------------------ */

export function DiamondPedestal({ position, onClick }: { position: [number, number, number]; onClick: () => void }) {
  const originalModel = useLoader(TDSLoader, "/images/diamond.3ds");

  const model = useMemo(() => {
    const clone = originalModel.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
        (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({
          color: "#c9a84c",
          metalness: 0.9,
          roughness: 0.1,
        });
      }
    });
    return clone;
  }, [originalModel]);

  const scale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(originalModel);
    const size = new THREE.Vector3();
    box.getSize(size);
    return 0.25 / Math.max(size.x, size.y, size.z);
  }, [originalModel]);

  return (
    <ServicePedestal position={position} label="Enterprise" sublabel="Bottor Technologies" onClick={onClick}>
      <primitive object={model} scale={scale} position={[0, 0.15, 0]} />
    </ServicePedestal>
  );
}

export function PhonePedestal({ position, onClick }: { position: [number, number, number]; onClick: () => void }) {
  const gltf = useLoader(GLTFLoader, "/images/16 pro.glb");

  const model = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
      }
    });
    return clone;
  }, [gltf]);

  const scale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    return 0.3 / Math.max(size.x, size.y, size.z);
  }, [gltf]);

  return (
    <ServicePedestal position={position} label="Book a Call" sublabel="1:1 with Coach B" onClick={onClick}>
      <primitive object={model} scale={scale} position={[0, 0.15, 0]} rotation={[0.3, 0, 0]} />
    </ServicePedestal>
  );
}

export function EnvelopePedestal({ position, onClick }: { position: [number, number, number]; onClick: () => void }) {
  const originalModel = useLoader(FBXLoader, "/images/uploads_files_5258561_PickUpPack_Part_1_Envelope.fbx");

  const model = useMemo(() => {
    const clone = originalModel.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
        (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({
          color: "#c9a84c",
          metalness: 0.8,
          roughness: 0.2,
        });
      }
    });
    return clone;
  }, [originalModel]);

  const scale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(originalModel);
    const size = new THREE.Vector3();
    box.getSize(size);
    return 0.25 / Math.max(size.x, size.y, size.z);
  }, [originalModel]);

  return (
    <ServicePedestal position={position} label="Contact" sublabel="Start a Project" onClick={onClick}>
      <primitive object={model} scale={scale} position={[0, 0.1, 0]} />
    </ServicePedestal>
  );
}

export function ChainRingPedestal({ position, onClick }: { position: [number, number, number]; onClick: () => void }) {
  const originalModel = useLoader(FBXLoader, "/images/uploads_files_3780212_CGT_0231_right_hand_chain_ring_FB.fbx");

  const model = useMemo(() => {
    const clone = originalModel.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = true;
        (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({
          color: "#c9a84c",
          metalness: 0.85,
          roughness: 0.15,
        });
      }
    });
    return clone;
  }, [originalModel]);

  const scale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(originalModel);
    const size = new THREE.Vector3();
    box.getSize(size);
    return 0.25 / Math.max(size.x, size.y, size.z);
  }, [originalModel]);

  return (
    <ServicePedestal position={position} label="Connect" sublabel="Stay Connected" onClick={onClick}>
      <primitive object={model} scale={scale} position={[0, 0.15, 0]} />
    </ServicePedestal>
  );
}
