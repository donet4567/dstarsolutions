"use client";

import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei/core/Environment";
import { Lightformer } from "@react-three/drei/core/Lightformer";
import { RoundedBox } from "@react-three/drei/core/RoundedBox";
import SceneRenderer from "./SceneRenderer";
import * as THREE from "three";

// Stable JSX prevents rebuilding the environment when controls or chapters change.
const environment = <Environment resolution={128} frames={1}>
      <Lightformer position={[-3, 4, 5]} scale={[5, 5, 1]} intensity={3} />
      <Lightformer position={[5, 1, 2]} scale={[2, 6, 1]} intensity={2} color="#e4d6f5" />
    </Environment>;

export type DimensionInput = { progress: number; invalidate?: () => void };

function screenTexture(application = false, phone = false) {
  const canvas = document.createElement("canvas");
  canvas.width = phone ? 480 : 1280;
  canvas.height = phone ? 960 : 800;
  const ctx = canvas.getContext("2d")!;
  const box = (x: number, y: number, w: number, h: number, colour: string, radius = 16) => {
    ctx.fillStyle = colour;
    ctx.beginPath(); ctx.roundRect(x, y, w, h, radius); ctx.fill();
  };
  const text = (value: string, x: number, y: number, size: number, colour = "#63516f", serif = false) => {
    ctx.fillStyle = colour;
    ctx.font = `${serif ? "italic" : "normal"} ${size}px ${serif ? "Georgia" : "Arial"}`;
    ctx.fillText(value, x, y);
  };
  ctx.fillStyle = "#fcfaf8"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (phone) {
    text("dstar / flow", 38, 95, 30);
    text("Your day.", 38, 230, 66);
    text("In harmony.", 38, 305, 64, "#9b80ae", true);
    box(38, 370, 404, 160, "#e9e1f1");
    text("ONE CLEAR OVERVIEW", 65, 413, 17, "#a08ab0");
    text("Room to do more.", 65, 477, 33);
    ["A thoughtful start", "A clearer workflow", "Your next chapter"].forEach((value, index) => {
      box(38, 575 + index * 90, 404, 70, "#f0edf3", 10);
      text("✓", 57, 619 + index * 90, 24, "#9e87b2");
      text(value, 97, 619 + index * 90, 23);
    });
  } else if (application) {
    box(0, 0, 245, 800, "#e9e3f0", 0);
    text("flow.", 40, 86, 49, "#7c6590", true);
    ["Overview", "Projects", "Schedule", "Settings"].forEach((value, index) => {
      if (index === 0) box(22, 150, 202, 58, "#d9cee7", 10);
      text(value, 44, 188 + index * 85, 23, "#9b85ad");
    });
    text("YOUR WORKSPACE", 290, 75, 16, "#b2a2bd");
    text("Everything, connected.", 290, 163, 52);
    text("Less busywork. More possibility.", 292, 208, 24, "#a792b1");
    box(290, 260, 445, 160, "#eee7f5"); box(763, 260, 445, 160, "#f4e5ed");
    text("YOUR PROJECT", 315, 305, 16, "#aa96b8"); text("Taking shape ↗", 315, 374, 34);
    text("YOUR FOCUS", 788, 305, 16, "#b598aa"); text("The bigger picture", 788, 374, 34);
    text("SMALL STEPS. BIG POSSIBILITIES.", 292, 480, 16, "#b2a2bd");
    ["Shape the idea", "Make it feel right", "Bring it to life"].forEach((value, index) => {
      box(290, 510 + index * 76, 918, 58, "#f1edf5", 8);
      text("✓", 312, 548 + index * 76, 23, "#9b87ad");
      text(value, 360, 548 + index * 76, 23);
    });
  } else {
    text("yourbrand®", 50, 82, 33);
    text("ABOUT        WORK        CONTACT", 872, 80, 15, "#a390ac");
    box(32, 130, 1216, 510, "#eee4ee", 8);
    text("A DISTINCTIVE POINT OF VIEW", 76, 200, 16, "#a084a2");
    text("Make an", 72, 340, 101);
    text("impression.", 72, 453, 110, "#9f7fa5", true);
    box(76, 512, 315, 60, "#a383aa", 30);
    text("Explore the possibilities  ↗", 100, 550, 20, "#fff9ff");
    const gradient = ctx.createRadialGradient(1010, 300, 5, 1000, 410, 220);
    gradient.addColorStop(0, "#fff5ef"); gradient.addColorStop(.45, "#d3bde2"); gradient.addColorStop(1, "#a98cbd");
    ctx.fillStyle = gradient; ctx.beginPath(); ctx.ellipse(1020, 410, 180, 206, -.35, 0, Math.PI * 2); ctx.fill();
    text("DESIGNED AROUND YOU", 53, 720, 16, "#a793b0");
    text("Thoughtful. Distinctive. Entirely yours.", 53, 765, 27);
    text("01 — ∞", 1110, 745, 24, "#ad95ba");
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function DigitalForm({ input: inputRef, animate, chapter }: {
  input: MutableRefObject<DimensionInput>;
  animate: boolean;
  chapter: number;
}) {
  const browser = useRef<THREE.Group>(null);
  const phone = useRef<THREE.Group>(null);
  const idea = useRef<THREE.Group>(null);
  const application = useRef<THREE.MeshBasicMaterial>(null);
  const progress = useRef(0);
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    if (!animate) return;
    inputRef.current.invalidate = invalidate;
    invalidate();
    const value = inputRef.current;
    return () => { delete value.invalidate; };
  }, [animate, inputRef, invalidate]);
  const textures = useMemo(() => [screenTexture(), screenTexture(true), screenTexture(true, true)], []);
  useEffect(() => () => textures.forEach((texture) => texture.dispose()), [textures]);

  useFrame(({ camera }, rawDelta) => {
    const delta = Math.min(rawDelta, .06);
    progress.current = animate ? THREE.MathUtils.damp(progress.current, inputRef.current.progress, 5, delta) : inputRef.current.progress;
    const p = progress.current;
    const emergence = THREE.MathUtils.smoothstep(p, .1, .53);
    if (browser.current) {
      browser.current.scale.setScalar(.02 + emergence * .98);
      browser.current.position.set(-.15, -1.5 + emergence * 1.5, -.15);
      browser.current.rotation.set((1 - emergence) * -.75, -.18 + p * .35, 0);
    }
    if (phone.current) {
      const connect = THREE.MathUtils.smoothstep(p, .55, .92);
      phone.current.position.set(2.75, -1.9 + connect * 1.13, .55);
      phone.current.scale.setScalar(.01 + connect * .99);
      phone.current.rotation.y = -.2;
    }
    if (idea.current) {
      idea.current.scale.setScalar(.001 + (1 - emergence) * 1.05);
      idea.current.position.set(0, .3 + emergence * .7, .1);
      idea.current.rotation.set(p * .7, p * Math.PI * 1.5, p * .5);
    }
    if (application.current) application.current.opacity = THREE.MathUtils.smoothstep(p, .58, .82);
    camera.position.set(3.1 - p * 2.4, 2.3 - p * .9, 10.5 - Math.sin(p * Math.PI) * .9);
    camera.lookAt(.2, -.1, 0);
    // This scene moves only with scroll input. Keep damping at the same speed,
    // then stop requesting identical frames once it has settled.
    if (animate && Math.abs(p - inputRef.current.progress) > .00001) invalidate();
  });

  return <>
    <group ref={idea}>
      <mesh castShadow><sphereGeometry args={[1.17, 48, 48]} /><meshPhysicalMaterial color="#c6b2e0" metalness={.4} roughness={.19} clearcoat={1} /></mesh>
      {[0, 1, 2].map((index) => <mesh key={index} rotation={[index * .75, index * .65, index * .4]} castShadow>
        <torusGeometry args={[1.52 + index * .12, .035, 12, 96]} />
        <meshStandardMaterial color={["#e8c5ce", "#c7d9df", "#ece0c6"][index]} metalness={.65} roughness={.25} />
      </mesh>)}
    </group>
    <group ref={browser}>
      <RoundedBox args={[4.85, 3.16, .2]} radius={.13} smoothness={4} castShadow>
        <meshPhysicalMaterial color="#d8cde5" metalness={.5} roughness={.22} clearcoat={1} />
      </RoundedBox>
      <mesh position={[0, 0, .108]}><planeGeometry args={[4.58, 2.86]} /><meshBasicMaterial map={textures[0]} toneMapped={false} /></mesh>
      <mesh position={[0, 0, .111]}><planeGeometry args={[4.58, 2.86]} /><meshBasicMaterial ref={application} map={textures[1]} toneMapped={false} transparent depthWrite={false} opacity={chapter === 2 ? 1 : 0} /></mesh>
      <RoundedBox args={[.16, .55, .2]} position={[0, -1.72, -.06]} radius={.04} castShadow><meshStandardMaterial color="#c8bbd5" metalness={.5} roughness={.3} /></RoundedBox>
      <RoundedBox args={[1.5, .1, .75]} position={[0, -1.99, .1]} radius={.04} castShadow><meshStandardMaterial color="#c8bbd5" metalness={.5} roughness={.3} /></RoundedBox>
    </group>
    <group ref={phone}>
      <RoundedBox args={[1.22, 2.53, .16]} radius={.12} smoothness={4} castShadow><meshPhysicalMaterial color="#877397" metalness={.55} roughness={.23} clearcoat={1} /></RoundedBox>
      <mesh position={[0, 0, .086]}><planeGeometry args={[1.08, 2.23]} /><meshBasicMaterial map={textures[2]} toneMapped={false} /></mesh>
    </group>
    <mesh position={[.1, -2.13, 0]} receiveShadow><cylinderGeometry args={[3.8, 3.9, .18, 80]} /><meshStandardMaterial color="#ebe5ef" metalness={.12} roughness={.65} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.24, 0]} receiveShadow><planeGeometry args={[30, 30]} /><shadowMaterial transparent opacity={.12} /></mesh>
  </>;
}

export default function DimensionCanvas({ input, animate, chapter, onReady }: {
  input: MutableRefObject<DimensionInput>;
  animate: boolean;
  chapter: number;
  onReady: () => void;
}) {
  return <Canvas aria-hidden="true" frameloop="demand"
    camera={{ position: [3.1, 2.3, 10.5], fov: 37 }} dpr={[1, 1.5]}
    shadows={{ type: THREE.PCFShadowMap }} gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
    >
    <ambientLight intensity={1.5} />
    <directionalLight position={[-4, 7, 6]} intensity={2.7} color="#fff7ef" castShadow shadow-mapSize={[1024, 1024]} shadow-radius={4} shadow-bias={-.001} />
    <directionalLight position={[5, 1, 4]} intensity={1.8} color="#d9ddff" />
    {environment}
    <DigitalForm input={input} animate={animate} chapter={chapter} />
    <SceneRenderer onReady={onReady} />
  </Canvas>;
}
