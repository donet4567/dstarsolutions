"use client";

import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";

export type BloomInput = {
  progress: number;
  pointerX: number;
  pointerY: number;
  rotation: number;
};

const colours = ["#c3afe8", "#efb8d1", "#f4d4b3", "#b7ddce", "#b8dced", "#d6c5ee", "#f0c2d8", "#f2dbbd"];

// A closed, curved petal, sculpted locally. No downloaded models or HDR files.
function createPetal() {
  const geometry = new THREE.SphereGeometry(1, 40, 40);
  const position = geometry.attributes.position;
  for (let index = 0; index < position.count; index++) {
    const t = (position.getY(index) + 1) / 2;
    const x = position.getX(index) * (0.68 + t * 0.4);
    const z = position.getZ(index) * 0.26;
    const twist = t * 1.05;
    position.setXYZ(index,
      x * Math.cos(twist) - z * Math.sin(twist) + t * t * 0.28,
      t * 2.35 + 0.08,
      x * Math.sin(twist) + z * Math.cos(twist) + t * t * 0.65,
    );
  }
  geometry.computeVertexNormals();
  return geometry;
}

function Sculpture({ input, animate }: { input: MutableRefObject<BloomInput>; animate: boolean }) {
  const root = useRef<THREE.Group>(null);
  const petals = useRef<(THREE.Group | null)[]>([]);
  const geometry = useMemo(() => createPetal(), []);
  const time = useRef(0);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ invalidate }, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    if (!root.current) return;
    if (animate) time.current += delta;
    const p = input.current.progress;
    const targetX = -0.25 + input.current.pointerY * 0.12 + p * 0.35;
    const targetY = -0.28 + input.current.pointerX * 0.2 + input.current.rotation + p * 0.8;
    root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, targetX, 4, delta);
    root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, targetY, 4, delta);
    root.current.rotation.z = -0.16 + time.current * 0.055 + p * 0.4;
    root.current.position.y = Math.sin(time.current * 0.65) * 0.06;
    root.current.scale.setScalar(1 - p * 0.16);
    petals.current.forEach((petal, index) => {
      if (!petal) return;
      petal.rotation.x = 0.1 + p * 0.38 + Math.sin(time.current * 0.6 + index * 0.7) * 0.025;
    });
    if (animate) invalidate();
  });

  return <group ref={root} rotation={[-0.25, -0.28, -0.16]}>
    {colours.map((colour, index) => <group key={colour + index} rotation={[0, 0, index * Math.PI / 4]}>
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
    onCreated={({ gl }) => { gl.setClearColor(0x000000, 0); onReady(); }}>
    <ambientLight intensity={0.8} />
    <directionalLight position={[-3, 5, 6]} intensity={3.4} color="#fff8ef" castShadow
      shadow-mapSize={[1024, 1024]} shadow-bias={-0.001} />
    <directionalLight position={[4, -1, 3]} intensity={1.7} color="#d5dfff" />
    <Environment resolution={128} frames={1}>
      <Lightformer position={[-3, 4, 5]} scale={[5, 4, 1]} intensity={3} color="#ffffff" />
      <Lightformer position={[4, 0, 2]} scale={[2, 6, 1]} intensity={2} color="#e8dfff" />
      <Lightformer position={[0, -4, 3]} scale={[5, 2, 1]} intensity={1} color="#ffdfce" />
    </Environment>
    <Sculpture input={input} animate={animate} />
  </Canvas>;
}
