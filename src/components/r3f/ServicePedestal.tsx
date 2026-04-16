"use client";

import { useRef, useMemo, useState } from "react";
import { useLoader } from "@react-three/fiber";
import { useTexture, Text, Html } from "@react-three/drei";
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
  noLight?: boolean;
  children: React.ReactNode; // the 3D model goes here
}

/**
 * A reusable service pedestal — marble base with spotlight,
 * brass plaque, and an interactive 3D object on top.
 */
function ServicePedestal({ position, label, sublabel, onClick, noLight, children }: ServicePedestalProps) {
  const marbleTex = useTexture("/images/gallery/floor.jpg");
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      {/* Spotlight — skip if noLight to stay within WebGL light limits */}
      {!noLight && (
        <>
          <SpotLightWithTarget
            position={[0, 3.4, 0]}
            targetPosition={[position[0], 0.8, position[2]]}
            intensity={30}
            angle={0.5}
            penumbra={0.5}
            distance={8}
            castShadow={false}
          />
          <pointLight position={[0, 2, 0.3]} intensity={2} distance={4} color="#ffe0a0" />
        </>
      )}

      {/* Pedestal base */}
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <boxGeometry args={[0.7, 0.02, 0.7]} />
        <meshStandardMaterial map={marbleTex} color="#908478" metalness={0.35} roughness={0.6} />
      </mesh>
      {/* Pedestal body */}
      <mesh position={[0, 0.3, 0]} receiveShadow>
        <boxGeometry args={[0.55, 0.6, 0.55]} />
        <meshStandardMaterial map={marbleTex} color="#908478" metalness={0.35} roughness={0.6} />
      </mesh>
      {/* Pedestal cap */}
      <mesh position={[0, 0.61, 0]}>
        <boxGeometry args={[0.62, 0.02, 0.62]} />
        <meshStandardMaterial map={marbleTex} color="#a09488" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* 3D object on top */}
      <group position={[0, 0.62, 0]}>
        {children}
      </group>

      {/* Hover glow */}
      {hovered && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.007, 0]}>
          <circleGeometry args={[0.45, 32]} />
          <meshBasicMaterial color="#c9a84c" transparent opacity={0.25} />
        </mesh>
      )}

      {/* Hover label */}
      {hovered && (
        <Html position={[0, 1.3, 0]} center style={{ pointerEvents: "none" }}>
          <div style={{
            background: "rgba(12,10,8,0.9)",
            border: "1px solid rgba(201,168,76,0.4)",
            borderRadius: "6px",
            padding: "6px 12px",
            textAlign: "center",
            whiteSpace: "nowrap",
          }}>
            <div style={{ color: "#c9a84c", fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em" }}>
              {label}
            </div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "9px", marginTop: "2px" }}>
              {sublabel}
            </div>
          </div>
        </Html>
      )}

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
  const originalModel = useLoader(FBXLoader, "/images/uploads_files_4888333_Award+-+Glass.fbx");

  const { model, scale } = useMemo(() => {
    const clone = originalModel.clone(true);

    // Keep only the first mesh child (remove the duplicate award)
    const meshes: THREE.Object3D[] = [];
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) meshes.push(child);
    });
    // Remove all but the first mesh
    for (let i = 1; i < meshes.length; i++) {
      meshes[i].parent?.remove(meshes[i]);
    }

    // Apply material to remaining mesh
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = false;
        (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({
          color: "#c9a84c",
          metalness: 0.9,
          roughness: 0.1,
        });
      }
    });

    // Calculate bounding box for scaling and centering
    const box = new THREE.Box3().setFromObject(clone);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);
    const s = 0.45 / Math.max(size.x, size.y, size.z);

    // Wrap in a container group, center within it, rotate on Y for angled display
    const container = new THREE.Group();
    clone.position.set(-center.x, -box.min.y, -center.z);
    container.add(clone);
    container.rotation.y = Math.PI / 3;

    return { model: container, scale: s };
  }, [originalModel]);

  return (
    <ServicePedestal position={position} label="Enterprise" sublabel="Bottor Technologies" onClick={onClick}>
      <primitive object={model} scale={scale} position={[0, 0, 0]} />
    </ServicePedestal>
  );
}

export function PhonePedestal({ position, onClick }: { position: [number, number, number]; onClick: () => void }) {
  return (
    <ServicePedestal position={position} label="Book a Call" sublabel="1:1 with Coach B" onClick={onClick} noLight>
      <group rotation={[0, Math.PI / 3, 0]} position={[0, 0.12, 0]}>
        {/* Phone body */}
        <mesh>
          <boxGeometry args={[0.12, 0.22, 0.012]} />
          <meshStandardMaterial color="#c9a84c" metalness={0.85} roughness={0.15} />
        </mesh>
        {/* Screen bezel */}
        <mesh position={[0, 0.005, 0.007]}>
          <boxGeometry args={[0.1, 0.18, 0.002]} />
          <meshStandardMaterial color="#1a1408" metalness={0.3} roughness={0.8} />
        </mesh>
        {/* Camera bump */}
        <mesh position={[-0.035, 0.07, -0.009]}>
          <boxGeometry args={[0.035, 0.04, 0.005]} />
          <meshStandardMaterial color="#b8922e" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </ServicePedestal>
  );
}

export function EnvelopePedestal({ position, onClick }: { position: [number, number, number]; onClick: () => void }) {
  const originalModel = useLoader(FBXLoader, "/images/uploads_files_5258561_PickUpPack_Part_1_Envelope.fbx");

  const { model, scale } = useMemo(() => {
    const clone = originalModel.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).castShadow = false;
        (child as THREE.Mesh).material = new THREE.MeshStandardMaterial({
          color: "#c9a84c",
          metalness: 0.8,
          roughness: 0.2,
        });
      }
    });

    const box = new THREE.Box3().setFromObject(clone);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);
    const s = 0.45 / Math.max(size.x, size.y, size.z);

    const container = new THREE.Group();
    clone.position.set(-center.x, -box.min.y, -center.z);
    container.add(clone);
    container.rotation.y = Math.PI / 3;

    return { model: container, scale: s };
  }, [originalModel]);

  return (
    <ServicePedestal position={position} label="Contact" sublabel="Start a Project" onClick={onClick}>
      <primitive object={model} scale={scale} position={[0, 0, 0]} />
    </ServicePedestal>
  );
}

export function ConnectPedestal({ position, onClick }: { position: [number, number, number]; onClick: () => void }) {
  return (
    <ServicePedestal position={position} label="Connect" sublabel="Stay Connected" onClick={onClick} noLight>
      <group rotation={[0, Math.PI / 3, 0]} position={[0, 0.1, 0]}>
        {/* Chain link — two interlocked tori */}
        <mesh position={[-0.04, 0, 0]} rotation={[0, 0, Math.PI / 6]}>
          <torusGeometry args={[0.07, 0.015, 16, 32]} />
          <meshStandardMaterial color="#c9a84c" metalness={0.85} roughness={0.15} />
        </mesh>
        <mesh position={[0.04, 0, 0]} rotation={[0, Math.PI / 2, Math.PI / 6]}>
          <torusGeometry args={[0.07, 0.015, 16, 32]} />
          <meshStandardMaterial color="#c9a84c" metalness={0.85} roughness={0.15} />
        </mesh>
      </group>
    </ServicePedestal>
  );
}
