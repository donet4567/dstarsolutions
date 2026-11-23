"use client";
import { useEffect, useRef, useState } from "react";

const palettes: readonly [number, number, number][][] = [
  [[243, 92, 147], [116, 178, 255]],   // Mecardee Rental: Electric Rose + Cool Sky Blue
  [[184, 152, 238], [241, 98, 164]],   // Mecardee Manager: Luminous Lilac + Raspberry
  [[199, 227, 66], [88, 214, 184]],    // HireVify: Chartreuse Lime + Seafoam Mint
];

/** An original interactive 3D kinetic wave-field motion study. */
export default function SelectedWorkVideoCard({ projectIndex = 0 }: { projectIndex?: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const figure = useRef<HTMLElement>(null);
  const targetIndex = useRef(projectIndex);
  const [fullscreen, setFullscreen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const activeFull = fullscreen || expanded;

  useEffect(() => {
    targetIndex.current = projectIndex;
  }, [projectIndex]);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [expanded]);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const ctx = element.getContext("2d", { alpha: false });
    if (!ctx) return;

    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false, frame = 0, last = 0, time = 0, width = 0, height = 0;

    // Smooth color interpolation across active project palettes
    const activePrimary = [...palettes[targetIndex.current % palettes.length][0]];
    const activeSecondary = [...palettes[targetIndex.current % palettes.length][1]];

    // Interactive cursor tilt + click pulse ripple
    const pointer = { x: .5, y: .45, tx: .5, ty: .45, active: 0, tActive: 0 };
    const pulse = { x: .5, y: .45, strength: 0 };

    const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

    const render = () => {
      const w = width, h = height;
      if (!w || !h) return;
      const t = time / 1000;
      const unit = Math.min(w, h);

      // Smoothly transition palette toward the selected project
      const nextPalette = palettes[targetIndex.current % palettes.length];
      for (let c = 0; c < 3; c++) {
        activePrimary[c] = lerp(activePrimary[c], nextPalette[0][c], .09);
        activeSecondary[c] = lerp(activeSecondary[c], nextPalette[1][c], .09);
      }

      pointer.x = lerp(pointer.x, pointer.tx, .12);
      pointer.y = lerp(pointer.y, pointer.ty, .12);
      pointer.active = lerp(pointer.active, pointer.tActive, .1);
      pulse.strength *= .93;

      const [r1, g1, b1] = activePrimary.map(Math.round);
      const [r2, g2, b2] = activeSecondary.map(Math.round);

      // 1. Deep midnight blue-black canvas with soft dual-tone ambient glow
      ctx.fillStyle = "#040a10";
      ctx.fillRect(0, 0, w, h);

      const glowX = w * (.5 + (pointer.x - .5) * .22);
      const glowY = h * (.42 + (pointer.y - .5) * .16);
      const aura = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, Math.max(w, h) * .72);
      aura.addColorStop(0, `rgba(${r1}, ${g1}, ${b1}, .28)`);
      aura.addColorStop(.48, `rgba(${r2}, ${g2}, ${b2}, .12)`);
      aura.addColorStop(1, "rgba(4, 10, 16, 0)");
      ctx.fillStyle = aura;
      ctx.fillRect(0, 0, w, h);

      // 2. Subtle architectural dot matrix
      ctx.fillStyle = "rgba(185, 202, 214, .11)";
      const step = Math.max(20, Math.round(unit * .085));
      for (let gx = step * .7; gx < w; gx += step) {
        for (let gy = step * .7; gy < h; gy += step) {
          ctx.fillRect(gx, gy, 1.2, 1.2);
        }
      }

      // 3. 3D Projected Kinetic Silk Wave Mesh
      const rows = 16;
      const cols = 38;
      const tiltX = (pointer.x - .5) * .24 * pointer.active;
      const tiltY = (pointer.y - .5) * .18 * pointer.active;
      const nodes: { x: number; y: number; crest: number }[] = [];

      for (let r = 0; r < rows; r++) {
        const depth = r / (rows - 1); // 0 = far horizon, 1 = foreground
        const persp = .46 + depth * .68;
        const baseY = h * (.22 + depth * .58) + tiltY * unit * (.18 * depth);
        const spanW = w * (.82 + depth * .42);
        const startX = (w - spanW) * .5 + tiltX * unit * (.28 * (depth - .3));

        const alpha = .16 + Math.sin(depth * Math.PI) * .68;
        const mix = (depth + .15 * Math.sin(t * .7 + r * .3)) % 1;
        const cr = Math.round(lerp(r2, r1, mix));
        const cg = Math.round(lerp(g2, g1, mix));
        const cb = Math.round(lerp(b2, b1, mix));

        ctx.beginPath();
        let prevX = 0, prevY = 0;

        for (let c = 0; c <= cols; c++) {
          const u = c / cols;
          const px = startX + u * spanW;

          // Multi-harmonic standing & travelling wave
          const waveA = Math.sin(u * 5.2 - t * 1.45 + r * .34);
          const waveB = Math.cos(u * 9.0 + t * 1.05 - r * .26) * .52;
          const waveC = Math.sin((u + depth) * 4.2 + t * .8) * .45;

          // Interactive cursor magnetic lift + radial click ripple
          const dx = px / w - pointer.x;
          const dy = baseY / h - pointer.y;
          const dist = Math.hypot(dx, dy);
          const cursorLift = pointer.active * Math.exp(-dist * dist * 24) * .85;

          const pdx = px / w - pulse.x;
          const pdy = baseY / h - pulse.y;
          const pDist = Math.hypot(pdx, pdy);
          const ripple = pulse.strength * Math.sin(pDist * 26 - t * 9) * Math.exp(-pDist * 5) * .9;

          const heightAmp = unit * (.085 * persp);
          const elevation = (waveA + waveB + waveC) * .45 + cursorLift + ripple;
          const py = baseY - elevation * heightAmp;

          if (c === 0) {
            ctx.moveTo(px, py);
          } else {
            const cx = (prevX + px) * .5;
            const cy = (prevY + py) * .5;
            ctx.quadraticCurveTo(prevX, prevY, cx, cy);
          }
          prevX = px;
          prevY = py;

          if (r % 3 === 1 && c % 6 === 3 && elevation > .32) {
            nodes.push({ x: px, y: py, crest: Math.min(1, elevation) });
          }
        }
        ctx.lineTo(prevX, prevY);

        ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha.toFixed(3)})`;
        ctx.lineWidth = .9 + depth * 1.35;
        ctx.stroke();

        // Crisp luminous specular ridge on foreground hero waves
        if (r === 6 || r === 11) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${(alpha * .42).toFixed(3)})`;
          ctx.lineWidth = .9;
          ctx.stroke();
        }
      }

      // 4. Shimmering starlight pearls riding the highest wave crests
      for (const node of nodes) {
        const rad = Math.max(1.4, unit * (.005 + node.crest * .005));
        const halo = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, rad * 2.8);
        halo.addColorStop(0, "rgba(255, 255, 255, .95)");
        halo.addColorStop(.4, `rgba(${r1}, ${g1}, ${b1}, .52)`);
        halo.addColorStop(1, `rgba(${r1}, ${g1}, ${b1}, 0)`);
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(node.x, node.y, rad * 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(node.x, node.y, Math.max(1.2, rad * .65), 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Minimal sculptural 4-point star emblem in upper-right sky
      const sx = w * .85, sy = h * .14, sr = Math.max(8, unit * .036);
      const starSpin = t * .28;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(starSpin);
      ctx.fillStyle = `rgba(${r1}, ${g1}, ${b1}, .9)`;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        const radius = i % 2 === 0 ? sr : sr * .24;
        if (i === 0) ctx.moveTo(Math.cos(a) * radius, Math.sin(a) * radius);
        else ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 6. Clean architectural studio telemetry & signature
      ctx.fillStyle = "rgba(185, 202, 214, .75)";
      ctx.font = `700 ${Math.max(10.5, Math.round(unit * .034))}px Arial, sans-serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillText("WAVEFIELD · 0" + ((targetIndex.current % palettes.length) + 1), w * .07, h * .14);

      ctx.fillStyle = "#ffffff";
      ctx.font = `700 ${Math.max(12, Math.round(unit * .04))}px Arial, sans-serif`;
      ctx.fillText("D STAR / KINETIC STUDY", w * .07, h * .93);

      // Subtle live pulse bead on bottom-right
      const pulseR = 3.5 + Math.sin(t * 3.2) * 1.1;
      ctx.fillStyle = `rgb(${r1}, ${g1}, ${b1})`;
      ctx.beginPath();
      ctx.arc(w * .91, h * .922, pulseR, 0, Math.PI * 2);
      ctx.fill();
    };

    const tick = (now: number) => {
      frame = 0;
      if (!visible || document.hidden || preference.matches) return;
      if (!last) last = now;
      const elapsed = now - last;
      if (elapsed >= 1000 / 45) {
        time += Math.min(elapsed, 64);
        last = now;
        render();
      }
      frame = requestAnimationFrame(tick);
    };

    const update = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
      element.dataset.running = String(visible && !document.hidden && !preference.matches);
      if (visible && !document.hidden && !preference.matches) frame = requestAnimationFrame(tick);
      else render();
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointer.tx = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      pointer.ty = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      pointer.tActive = 1;
    };
    const onPointerLeave = () => {
      pointer.tActive = 0;
      pointer.tx = .5;
      pointer.ty = .45;
    };
    const onPointerDown = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pulse.x = (event.clientX - rect.left) / rect.width;
      pulse.y = (event.clientY - rect.top) / rect.height;
      pulse.strength = 1.65;
    };

    const resize = new ResizeObserver(() => {
      const rect = element.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      element.width = Math.round(width * dpr);
      element.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      render();
    });
    resize.observe(element);

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    }, { threshold: .1 });
    observer.observe(element);

    const motionChange = () => update();
    motionChange();
    const fullChange = () => setFullscreen(document.fullscreenElement === figure.current);

    element.addEventListener("pointermove", onPointerMove, { passive: true });
    element.addEventListener("pointerleave", onPointerLeave, { passive: true });
    element.addEventListener("pointerdown", onPointerDown, { passive: true });
    preference.addEventListener("change", motionChange);
    document.addEventListener("visibilitychange", update);
    document.addEventListener("fullscreenchange", fullChange);

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      observer.disconnect();
      element.removeEventListener("pointermove", onPointerMove);
      element.removeEventListener("pointerleave", onPointerLeave);
      element.removeEventListener("pointerdown", onPointerDown);
      preference.removeEventListener("change", motionChange);
      document.removeEventListener("visibilitychange", update);
      document.removeEventListener("fullscreenchange", fullChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {});
      setExpanded(false);
      return;
    }
    if (expanded) {
      setExpanded(false);
      return;
    }
    try {
      const target = figure.current;
      if (target?.requestFullscreen) {
        await Promise.race([
          target.requestFullscreen(),
          new Promise((resolve) => setTimeout(resolve, 250)),
        ]);
        if (document.fullscreenElement === target) return;
      }
    } catch { /* Fall back to fixed-viewport expansion when native Fullscreen is disallowed. */ }
    setExpanded(true);
  };

  return <aside className="selected-work-media" aria-label="Original motion study">
    <figure ref={figure} className="selected-work-video motion-reel" data-expanded={expanded || undefined}>
      <canvas ref={canvas} role="img" aria-label="Interactive 3D kinetic wave field that shifts color with the selected project" />
      <figcaption className="motion-reel-controls"><span>Ideas in motion.</span><div><button type="button" onClick={() => void toggleFullscreen()}>{activeFull ? "Exit full screen" : "Full screen"}</button></div></figcaption>
    </figure>
  </aside>;
}
