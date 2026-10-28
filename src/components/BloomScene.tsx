"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import type { BloomInput } from "./BloomCanvas";

const FallbackCanvas = dynamic(() => import("./BloomCanvas"), { ssr: false });

export default function BloomScene({ input: inputRef, animate, onReady }: {
  input: MutableRefObject<BloomInput>; animate: boolean; onReady: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const worker = useRef<Worker | null>(null);
  const active = useRef(animate);
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    const container = host.current;
    if (!container) return;
    if (!HTMLCanvasElement.prototype.transferControlToOffscreen || typeof Worker === "undefined") {
      queueMicrotask(() => setFallback(true));
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    container.append(canvas);
    let sceneWorker: Worker;
    let createdWorker: Worker | undefined;
    try {
      sceneWorker = createdWorker = new Worker(new URL("./bloom.worker.ts", import.meta.url), { type: "module" });
      const offscreen = canvas.transferControlToOffscreen();
      worker.current = sceneWorker;
      const values = () => ({ progress: inputRef.current.progress, pointerX: inputRef.current.pointerX, pointerY: inputRef.current.pointerY, rotation: inputRef.current.rotation });
      const bounds = container.getBoundingClientRect();
      sceneWorker.postMessage({ type: "init", canvas: offscreen, width: bounds.width, height: bounds.height, dpr: Math.max(1, Math.min(devicePixelRatio, 1.5)), input: values(), animate: active.current }, [offscreen]);
      inputRef.current.invalidate = () => sceneWorker.postMessage({ type: "input", input: values() });
    } catch {
      createdWorker?.terminate();
      canvas.remove();
      queueMicrotask(() => setFallback(true));
      return;
    }
    const fail = () => {
      sceneWorker.terminate();
      delete inputRef.current.invalidate;
      worker.current = null;
      canvas.remove();
      setFallback(true);
    };
    sceneWorker.onerror = fail;
    sceneWorker.onmessage = (event) => {
      if (event.data.type === "ready") onReady();
      else if (event.data.type === "error") fail();
    };
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width && height) sceneWorker.postMessage({ type: "resize", width, height, dpr: Math.max(1, Math.min(devicePixelRatio, 1.5)) });
    });
    observer.observe(container);
    const value = inputRef.current;
    return () => {
      observer.disconnect();
      delete value.invalidate;
      sceneWorker.terminate();
      worker.current = null;
      canvas.remove();
    };
  }, [inputRef, onReady]);
  useEffect(() => {
    active.current = animate;
    worker.current?.postMessage({ type: "animate", animate });
  }, [animate]);
  return fallback ? <FallbackCanvas input={inputRef} animate={animate} onReady={onReady} />
    : <div ref={host} style={{ position: "absolute", inset: 0 }} />;
}
