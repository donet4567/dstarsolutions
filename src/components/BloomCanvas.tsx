"use client";

import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei/core/Environment";
import { Lightformer } from "@react-three/drei/core/Lightformer";
import SceneRenderer from "./SceneRenderer";
import { bloomColours, createPetal, updateBloom } from "./bloom-model";
import * as THREE from "three";

// Stable JSX prevents rebuilding the environment when controls or chapters change.
const environment = <Environment resolution={128} frames={1}>
      <Lightformer position={[-3, 4, 5]} scale={[5, 4, 1]} intensity={3} color="#ffffff" />
      <Lightformer position={[4, 0, 2]} scale={[2, 6, 1]} intensity={2} color="#e8dfff" />
      <Lightformer position={[0, -4, 3]} scale={[5, 2, 1]} intensity={1} color="#ffdfce" />
    </Environment>;

export type BloomInput = {
  progress: number;
  pointerX: number;
  pointerY: number;
  rotation: number;
  invalidate?: () => void;
};

function Sculpture({ input, animate }: { input: MutableRefObject<BloomInput>; animate: boolean }) {
  const root = useRef<THREE.Group>(null);
  const petals = useRef<(THREE.Group | null)[]>([]);
  const geometry = useMemo(() => createPetal(), []);
  const time = useRef(0);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    if (!root.current) return;
    if (animate) time.current += delta;
    updateBloom(root.current, petals.current, input.current, time.current, delta);
  });

  return <group ref={root} rotation={[-0.25, -0.28, -0.16]}>
    {bloomColours.map((colour, index) => <group key={colour + index} rotation={[0, 0, index * Math.PI / 4]}>
      <group ref={(node) => { petals.current[index] = node; }}>
        <mesh geometry={geometry} castShadow receiveShadow>
          <meshPhysicalMaterial color={colour} metalness={0.16} roughness={0.29}
            clearcoat={0.85} clearcoatRoughness={0.24} envMapIntensity={0.9} />
        </mesh>
      </group>
    </group>)}
    <mesh position={[0, 0, 0.34]} castShadow>
      <sphereGeometry args={[0.58, 40, 40]} />
      <meshPhysicalMaterial color="#f5dec8" metalness={0.12} roughness={0.27} clearcoat={0.9} />
    </mesh>
  </group>;
}

export default function BloomCanvas({ input, animate, onReady }: {
  input: MutableRefObject<BloomInput>;
  animate: boolean;
  onReady: () => void;
}) {
  return <Canvas aria-hidden="true" frameloop={animate ? "always" : "demand"}
    camera={{ position: [0, 0, 9.5], fov: 40 }} dpr={[1, 1.5]} shadows={{ type: THREE.PCFShadowMap }}
    gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
    onCreated={({ gl }) => { gl.setClearColor(0x000000, 0); }}>
    <ambientLight intensity={0.8} />
    <directionalLight position={[-3, 5, 6]} intensity={3.4} color="#fff8ef" castShadow
      shadow-mapSize={[1024, 1024]} shadow-bias={-0.001} />
    <directionalLight position={[4, -1, 3]} intensity={1.7} color="#d5dfff" />
    {environment}
    <Sculpture input={input} animate={animate} />
    <SceneRenderer onReady={onReady} />
  </Canvas>;
}
