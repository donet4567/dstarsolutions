"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";

// Let the driver compile physical-material shaders asynchronously before the
// first draw. Rendering immediately forces WebGL to wait on the main thread.
export default function SceneRenderer({ onReady }: { onReady: () => void }) {
  const { gl, scene, camera, invalidate } = useThree();
  const compiled = useRef(false);
  const reported = useRef(false);
  useEffect(() => {
    let cancelled = false;
    void gl.compileAsync(scene, camera).then(() => {
      if (cancelled) return;
      compiled.current = true;
      invalidate();
    });
    return () => { cancelled = true; compiled.current = false; };
  }, [gl, scene, camera, invalidate]);
  useFrame(() => {
    if (!compiled.current) return;
    gl.render(scene, camera);
    if (!reported.current) {
      reported.current = true;
      onReady();
    }
  }, 1);
  return null;
}
