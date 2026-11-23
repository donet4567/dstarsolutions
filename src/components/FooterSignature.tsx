"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { defaultWhatsApp } from "./site";

const STAR_LETTERS = [
  { char: "S", tilt: "-1.6deg", y: "1px", delay: "70ms" },
  { char: "T", tilt: ".6deg", y: "-2px", delay: "110ms" },
  { char: "A", tilt: "-.8deg", y: "-1px", delay: "150ms" },
  { char: "R", tilt: "1.8deg", y: "2px", delay: "190ms" },
] as const;

type RollSpec = {
  id: string;
  kind: "roll";
  xFrac: number;
  startYStep: number;
  vxInit: number;
  initAngle: number;
  sizeRatio: number;
  rim: string;
  core: string;
  ink: string;
  arcTop: string;
  arcBottom: string;
  line1: string;
  line2: string;
  badge: string;
};

type DiscSpec = {
  id: string;
  kind: "disc";
  xFrac: number;
  startYStep: number;
  vxInit: number;
  initAngle: number;
  sizeRatio: number;
  bg: string;
  ink: string;
  icon: "work" | "pricing" | "whatsapp";
  href: string;
  external?: boolean;
  label: string;
};

type RoundSpec = RollSpec | DiscSpec;

const ROUND_SPECS: readonly RoundSpec[] = [
  // Lower-far-left bright accent disc
  {
    id: "work-disc",
    kind: "disc",
    xFrac: 0.055,
    startYStep: 0.2,
    vxInit: 12,
    initAngle: -0.18,
    sizeRatio: 0.62,
    bg: "#b8d336",
    ink: "#061018",
    icon: "work",
    href: "/work",
    label: "Explore D Star studio work",
  },
  // Lower-left studio roll
  {
    id: "uiux-roll",
    kind: "roll",
    xFrac: 0.215,
    startYStep: 0.1,
    vxInit: -16,
    initAngle: 0.1,
    sizeRatio: 1,
    rim: "#d95d39",
    core: "#f59d7e",
    ink: "#081018",
    arcTop: "CRAFTED IN KERALA • PIXEL PRECISION",
    arcBottom: "INTERFACE & BRAND SYSTEMS",
    line1: "UI / UX",
    line2: "DESIGN",
    badge: "STUDIO",
  },
  // Upper-left roll perched in the valley between work-disc and uiux-roll
  {
    id: "web-roll",
    kind: "roll",
    xFrac: 0.145,
    startYStep: 1.55,
    vxInit: 8,
    initAngle: -0.12,
    sizeRatio: 1,
    rim: "#6f74f2",
    core: "#c7cafe",
    ink: "#081018",
    arcTop: "D STAR SOLUTIONS • BESPOKE WEBSITES",
    arcBottom: "FAST • RESPONSIVE • SEO READY",
    line1: "WEB",
    line2: "STUDIO",
    badge: "NORMAL",
  },
  // Lower-right studio roll
  {
    id: "apps-roll",
    kind: "roll",
    xFrac: 0.775,
    startYStep: 0.1,
    vxInit: 14,
    initAngle: -0.09,
    sizeRatio: 1,
    rim: "#309ce0",
    core: "#8fd4fb",
    ink: "#081018",
    arcTop: "NEXT.JS ENGINE • CUSTOM PLATFORMS",
    arcBottom: "BUILT TO SCALE • KERALA",
    line1: "CUSTOM",
    line2: "WEB APPS",
    badge: "BUILD",
  },
  // Upper-right roll perched on the left shoulder of apps-roll
  {
    id: "motion-roll",
    kind: "roll",
    xFrac: 0.71,
    startYStep: 1.65,
    vxInit: 18,
    initAngle: 0.11,
    sizeRatio: 1,
    rim: "#f5a600",
    core: "#ffd566",
    ink: "#081018",
    arcTop: "INTERACTIVE MOTION • 3D & SCROLL",
    arcBottom: "SMOOTH PERFORMANCE • 60FPS",
    line1: "3D &",
    line2: "MOTION",
    badge: "CRAFT",
  },
  // Lower-far-right bright accent disc (WhatsApp)
  {
    id: "whatsapp-disc",
    kind: "disc",
    xFrac: 0.945,
    startYStep: 0.25,
    vxInit: -12,
    initAngle: 0.16,
    sizeRatio: 0.62,
    bg: "#b8d336",
    ink: "#061018",
    icon: "whatsapp",
    href: defaultWhatsApp,
    external: true,
    label: "Talk to D Star on WhatsApp",
  },
  // Mid-right bright accent disc perched above whatsapp-disc and apps-roll
  {
    id: "pricing-disc",
    kind: "disc",
    xFrac: 0.905,
    startYStep: 1.5,
    vxInit: -18,
    initAngle: -0.14,
    sizeRatio: 0.62,
    bg: "#b8d336",
    ink: "#061018",
    icon: "pricing",
    href: "/pricing",
    label: "View D Star website packages",
  },
];

type Body = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  angle: number;
  omega: number;
  sizeRatio: number;
  el: HTMLElement;
  grabbed: boolean;
};

function StudioRollSvg({ spec }: { spec: RollSpec }) {
  const uid = useId().replace(/:/g, "");
  const maskId = `roll-cut-${spec.id}-${uid}`;
  const topArcId = `roll-top-${spec.id}-${uid}`;

  return (
    <svg className="sig-roll-svg" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <defs>
        <mask id={maskId}>
          <rect width="200" height="200" fill="#000" />
          <circle cx="100" cy="100" r="97" fill="#fff" />
          {/* Transparent center cutout so page background and D STAR edges peek through */}
          <path
            d="M84,45 h32 c5,0 9,4 9,8.5 c0,4.5 -4,8.5 -9,8.5 h-32 c-5,0 -9,-4 -9,-8.5 c0,-4.5 4,-8.5 9,-8.5 Z"
            fill="#000"
          />
          <circle cx="100" cy="56" r="11" fill="#000" />
        </mask>
        <path id={topArcId} d="M 33,100 A 67,67 0 1,1 167,100" />
      </defs>

      <g mask={`url(#${maskId})`}>
        {/* Outer colored tape rim */}
        <circle cx="100" cy="100" r="97" fill={spec.rim} />
        {/* Inner studio paper band */}
        <circle cx="100" cy="100" r="76" fill={spec.core} />

        {/* Subtle circular rim label */}
        <text
          fill={spec.ink}
          fontSize="6.6"
          fontWeight="800"
          letterSpacing="1.15"
          opacity="0.86"
        >
          <textPath href={`#${topArcId}`} startOffset="50%" textAnchor="middle">
            {spec.arcTop}
          </textPath>
        </text>

        {/* Mini brand stamp right below core hole */}
        <ellipse cx="100" cy="79" rx="22" ry="9" fill="#081018" />
        <text
          x="100"
          y="82"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="6.8"
          fontWeight="900"
          letterSpacing="0.8"
        >
          D STAR
        </text>

        {/* Bold stacked studio discipline headline */}
        <text
          x="100"
          y="108"
          textAnchor="middle"
          fill={spec.ink}
          fontSize="21"
          fontWeight="900"
          letterSpacing="-0.5"
        >
          {spec.line1}
        </text>
        <text
          x="100"
          y="130"
          textAnchor="middle"
          fill={spec.ink}
          fontSize="19"
          fontWeight="900"
          letterSpacing="-0.4"
        >
          {spec.line2}
        </text>

        {/* Crisp studio ticket / barcode accent */}
        <rect x="76" y="138" width="48" height="16" rx="2" fill="rgba(255,255,255,0.88)" />
        <path
          d="M81,141 v10 M84,141 v10 M86,141 v10 M90,141 v10 M93,141 v10 M97,141 v10 M99,141 v10 M103,141 v10 M106,141 v10 M110,141 v10 M112,141 v10 M116,141 v10 M119,141 v10"
          stroke="#081018"
          strokeWidth="1.5"
        />

        {/* Bottom rim pill word */}
        <text
          x="100"
          y="190"
          textAnchor="middle"
          fill={spec.rim === "#f5a600" ? "#081018" : "#ffffff"}
          fontSize="12.5"
          fontWeight="900"
          letterSpacing="1.2"
        >
          {spec.badge}
        </text>
      </g>

      {/* Subtle inner rim outline for tactile paper depth */}
      <circle cx="100" cy="100" r="96.5" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
    </svg>
  );
}

function DiscArtwork({ spec }: { spec: DiscSpec }) {
  if (spec.icon === "whatsapp") {
    return (
      <span className="sig-disc-face">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M12 2.8a9 9 0 0 0-7.8 13.4L3 20.8l4.7-1.2A9 9 0 1 0 12 2.8Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinejoin="round"
          />
          <path
            d="M9 8.8c.2-.3.4-.3.6-.3h.5c.2 0 .4.1.5.4l.6 1.6c.1.2 0 .4-.1.6l-.5.5c-.1.2-.1.3 0 .5.3.6.8 1.1 1.3 1.6.6.5 1.2.8 1.9 1 .2.1.4 0 .5-.1l.6-.7c.2-.2.4-.2.6-.1l1.5.7c.2.1.3.3.3.5 0 .6-.4 1.3-1 1.6-.6.3-1.3.3-2.2 0-1.3-.4-2.5-1.1-3.5-2.1-1-1-1.8-2.2-2.2-3.4-.3-.8-.2-1.5.2-2.1.2-.2.3-.2.5-.2Z"
            fill="currentColor"
          />
        </svg>
      </span>
    );
  }

  if (spec.icon === "pricing") {
    return (
      <span className="sig-disc-face sig-disc-face--text">
        <strong><span className="inr">₹</span>8K+</strong>
        <span>PLANS</span>
      </span>
    );
  }

  return (
    <span className="sig-disc-face sig-disc-face--text">
      <strong>WORK</strong>
      <span>LIVE ↗</span>
    </span>
  );
}

export default function FooterSignature() {
  const stageRef = useRef<HTMLDivElement>(null);
  const ballRefs = useRef<(HTMLElement | null)[]>([]);
  const [showRounds, setShowRounds] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || showRounds) return;
    const target = stage.closest("footer") ?? stage;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setShowRounds(true);
        observer.disconnect();
      },
      { rootMargin: "420px 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [showRounds]);

  useEffect(() => {
    if (!showRounds) return;
    const stage = stageRef.current;
    if (!stage) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const bodies: Body[] = [];
    let rafId = 0;
    let started = false;
    let settledFrames = 0;
    let lastTime = 0;
    let stageW = Math.max(160, stage.clientWidth);
    let stageH = Math.max(180, stage.clientHeight);

    const readStageSize = () => {
      stageW = Math.max(160, stage.clientWidth);
      stageH = Math.max(180, stage.clientHeight);
    };

    const computeRollBaseRadius = () => {
      // Proportional to Sweet Tape (~18% viewport width diameter on desktop, safely fitted on small phones)
      const ideal = stageW < 640 ? stageW * 0.105 : Math.min(112, stageW * 0.084);
      const maxFit = (stageW - 28) / 6.7;
      return Math.max(26, Math.round(Math.min(ideal, maxFit)));
    };

    const syncStaticLayout = () => {
      readStageSize();
      const baseR = computeRollBaseRadius();
      ROUND_SPECS.forEach((spec, idx) => {
        const el = ballRefs.current[idx];
        if (!el) return;
        const r = Math.round(baseR * spec.sizeRatio);
        const pad = r + 6;
        const x = pad + (stageW - pad * 2) * spec.xFrac;
        const tierOffset = spec.startYStep > 1 ? r * 1.45 : 0;
        const y = stageH - r - 10 - tierOffset;
        el.style.width = `${r * 2}px`;
        el.style.height = `${r * 2}px`;
        el.style.transform = `translate3d(${(x - r).toFixed(1)}px, ${(y - r).toFixed(1)}px, 0) rotate(${spec.initAngle.toFixed(3)}rad)`;
      });
    };

    const layoutBodies = () => {
      readStageSize();
      if (reducedMotion) {
        stage.dataset.entered = "true";
        syncStaticLayout();
        return;
      }

      const baseR = computeRollBaseRadius();
      bodies.length = 0;
      ROUND_SPECS.forEach((spec, idx) => {
        const el = ballRefs.current[idx];
        if (!el) return;
        const r = Math.round(baseR * spec.sizeRatio);
        el.style.width = `${r * 2}px`;
        el.style.height = `${r * 2}px`;
        const pad = r + 6;
        const x = pad + (stageW - pad * 2) * spec.xFrac;
        const y = started
          ? Math.min(stageH - r - 8, Math.max(r + 8, stageH * 0.35 - spec.startYStep * r))
          : -r * (1.2 + spec.startYStep * 1.65);

        bodies.push({
          x,
          y,
          vx: spec.vxInit,
          vy: 120 + spec.startYStep * 90,
          r,
          angle: spec.initAngle,
          omega: spec.vxInit * 0.012,
          sizeRatio: spec.sizeRatio,
          el,
          grabbed: false,
        });
        el.style.transform = `translate3d(${(x - r).toFixed(1)}px, ${(y - r).toFixed(1)}px, 0) rotate(${spec.initAngle.toFixed(3)}rad)`;
      });
    };

    const renderBodies = () => {
      for (const b of bodies) {
        b.el.style.transform = `translate3d(${(b.x - b.r).toFixed(1)}px, ${(b.y - b.r).toFixed(1)}px, 0) rotate(${b.angle.toFixed(3)}rad)`;
      }
    };

    const wakeSimulation = () => {
      settledFrames = 0;
      if (!rafId && started && !reducedMotion) {
        lastTime = performance.now();
        rafId = requestAnimationFrame(step);
      }
    };

    const resolveCollisions = () => {
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const a = bodies[i];
          const b = bodies[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy);
          const minDist = a.r + b.r + 1;
          if (dist <= 0.001 || dist >= minDist) continue;

          const nx = dx / dist;
          const ny = dy / dist;
          const overlap = minDist - dist;
          const aMass = a.grabbed ? 0 : a.r * a.r;
          const bMass = b.grabbed ? 0 : b.r * b.r;
          const invMassSum = (aMass ? 1 / aMass : 0) + (bMass ? 1 / bMass : 0);
          if (invMassSum === 0) continue;

          const aShare = aMass ? (1 / aMass) / invMassSum : 0;
          const bShare = bMass ? (1 / bMass) / invMassSum : 0;
          a.x -= nx * overlap * aShare;
          a.y -= ny * overlap * aShare;
          b.x += nx * overlap * bShare;
          b.y += ny * overlap * bShare;

          const rvx = b.vx - a.vx;
          const rvy = b.vy - a.vy;
          const velAlongNormal = rvx * nx + rvy * ny;
          if (velAlongNormal > 0) continue;

          const restitution = 0.48;
          const impulse = (-(1 + restitution) * velAlongNormal) / invMassSum;

          // Contact friction helps upper rounds cradle naturally onto lower rounds
          const tx = -ny;
          const ty = nx;
          const vt = rvx * tx + rvy * ty;
          const frictionImpulse = (-vt * 0.38) / invMassSum;

          if (!a.grabbed) {
            const invMa = 1 / aMass;
            a.vx -= (impulse * nx + frictionImpulse * tx) * invMa;
            a.vy -= (impulse * ny + frictionImpulse * ty) * invMa;
            a.omega -= (vt * 0.004) / Math.max(20, a.r) * 14;
          }
          if (!b.grabbed) {
            const invMb = 1 / bMass;
            b.vx += (impulse * nx + frictionImpulse * tx) * invMb;
            b.vy += (impulse * ny + frictionImpulse * ty) * invMb;
            b.omega += (vt * 0.004) / Math.max(20, b.r) * 14;
          }
        }
      }
    };

    const step = (now: number) => {
      const dt = Math.min(0.032, Math.max(0.004, (now - lastTime) / 1000));
      lastTime = now;

      let totalEnergy = 0;
      const gravity = 1480;
      const floorY = stageH - 8;

      for (const b of bodies) {
        if (b.grabbed) {
          totalEnergy += 100;
          continue;
        }

        b.vy += gravity * dt;
        b.vx *= Math.pow(0.95, dt * 60);
        b.omega *= Math.pow(0.93, dt * 60);
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.angle += b.omega * dt;

        const minX = b.r + 6;
        const maxX = stageW - b.r - 6;
        if (b.x < minX) {
          b.x = minX;
          b.vx = Math.abs(b.vx) * 0.45;
          b.omega = b.vy / Math.max(24, b.r);
        } else if (b.x > maxX) {
          b.x = maxX;
          b.vx = -Math.abs(b.vx) * 0.45;
          b.omega = -b.vy / Math.max(24, b.r);
        }

        const maxY = floorY - b.r;
        if (b.y > maxY) {
          b.y = maxY;
          if (Math.abs(b.vy) > 48) {
            b.vy = -b.vy * 0.36;
          } else {
            b.vy = 0;
          }
          b.vx *= 0.82;
          b.omega = b.vx / Math.max(24, b.r);
        }

        const topMinY = b.r + 6;
        if (b.y < topMinY && b.vy < 0) {
          b.y = topMinY;
          b.vy = -b.vy * 0.4;
        }
      }

      resolveCollisions();
      resolveCollisions();
      resolveCollisions();

      for (const b of bodies) {
        const minX = b.r + 6;
        const maxX = stageW - b.r - 6;
        const maxY = floorY - b.r;
        b.x = Math.max(minX, Math.min(maxX, b.x));
        b.y = Math.min(maxY, b.y);
        totalEnergy += Math.abs(b.vx) + Math.abs(b.vy) + Math.abs(b.omega) * 18;
      }

      renderBodies();

      if (totalEnergy < 16) {
        settledFrames += 1;
        if (settledFrames > 28) {
          rafId = 0;
          return;
        }
      } else {
        settledFrames = 0;
      }

      rafId = requestAnimationFrame(step);
    };

    const onResize = () => {
      readStageSize();
      if (reducedMotion || !started) {
        layoutBodies();
        return;
      }
      const baseR = computeRollBaseRadius();
      bodies.forEach((b) => {
        const nextR = Math.round(baseR * b.sizeRatio);
        b.r = nextR;
        b.el.style.width = `${nextR * 2}px`;
        b.el.style.height = `${nextR * 2}px`;
        b.x = Math.max(nextR + 6, Math.min(stageW - nextR - 6, b.x));
        b.y = Math.min(stageH - nextR - 8, b.y);
      });
      wakeSimulation();
    };

    let activeBody: Body | null = null;
    let activePointerId = -1;
    let grabOffsetX = 0;
    let grabOffsetY = 0;
    let dragDistance = 0;
    let prevPtrX = 0;
    let prevPtrY = 0;
    let prevPtrT = 0;
    let throwVx = 0;
    let throwVy = 0;
    let suppressClickForEl: HTMLElement | null = null;

    const handlePointerDown = (e: PointerEvent) => {
      if (reducedMotion) return;
      const target = (e.target as HTMLElement | null)?.closest(".sig-ball") as HTMLElement | null;
      if (!target) return;
      const body = bodies.find((b) => b.el === target);
      if (!body) return;

      e.preventDefault();
      activeBody = body;
      activePointerId = e.pointerId;
      body.grabbed = true;
      body.el.dataset.grabbed = "true";

      const rect = stage.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      grabOffsetX = body.x - px;
      grabOffsetY = body.y - py;
      prevPtrX = px;
      prevPtrY = py;
      prevPtrT = performance.now();
      dragDistance = 0;
      throwVx = 0;
      throwVy = 0;
      suppressClickForEl = null;

      try {
        target.setPointerCapture(e.pointerId);
      } catch {
        // Synthetic pointer events in automated browsers may omit pointer capture
      }
      wakeSimulation();
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!activeBody || e.pointerId !== activePointerId) return;
      const rect = stage.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const now = performance.now();
      const dt = Math.max(0.008, (now - prevPtrT) / 1000);
      const dx = px - prevPtrX;
      const dy = py - prevPtrY;

      dragDistance += Math.hypot(dx, dy);
      throwVx = Math.max(-1350, Math.min(1350, dx / dt));
      throwVy = Math.max(-1350, Math.min(1350, dy / dt));
      prevPtrX = px;
      prevPtrY = py;
      prevPtrT = now;

      activeBody.x = Math.max(activeBody.r + 6, Math.min(stageW - activeBody.r - 6, px + grabOffsetX));
      activeBody.y = Math.max(activeBody.r + 6, Math.min(stageH - activeBody.r - 8, py + grabOffsetY));
      activeBody.vx = throwVx * 0.45;
      activeBody.vy = throwVy * 0.45;
      activeBody.omega = throwVx * 0.005;
      renderBodies();
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!activeBody || e.pointerId !== activePointerId) return;
      if (dragDistance > 6) {
        suppressClickForEl = activeBody.el;
      }
      activeBody.grabbed = false;
      activeBody.el.dataset.grabbed = "false";
      activeBody.vx = throwVx;
      activeBody.vy = throwVy;
      activeBody.omega = throwVx * 0.011;
      activeBody = null;
      activePointerId = -1;
      wakeSimulation();
    };

    const handleClickCapture = (e: MouseEvent) => {
      if (!suppressClickForEl) return;
      const target = (e.target as HTMLElement | null)?.closest(".sig-ball") as HTMLElement | null;
      if (target && target === suppressClickForEl) {
        e.preventDefault();
        e.stopPropagation();
      }
      suppressClickForEl = null;
    };

    layoutBodies();

    const ro = new ResizeObserver(onResize);
    ro.observe(stage);
    stage.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    window.addEventListener("pointercancel", handlePointerUp, { passive: true });
    stage.addEventListener("click", handleClickCapture, true);
    window.addEventListener("resize", onResize, { passive: true });

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        stage.dataset.entered = "true";
        if (!started && !reducedMotion) {
          started = true;
          wakeSimulation();
        }
        io.disconnect();
      },
      { threshold: 0.1 },
    );
    io.observe(stage);

    return () => {
      io.disconnect();
      ro.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
      stage.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      stage.removeEventListener("click", handleClickCapture, true);
      window.removeEventListener("resize", onResize);
    };
  }, [showRounds]);

  return (
    <div ref={stageRef} className="footer-stage" data-entered="false">
      <div className="footer-signature" aria-hidden="true">
        <span className="sig-d">
          <span className="sig-char sig-char-d">D</span>
        </span>{" "}
        <span className="sig-star">
          {STAR_LETTERS.map((item) => (
            <span
              key={item.char}
              className="sig-char sig-char-star"
              style={
                {
                  "--sig-delay": item.delay,
                  "--sig-tilt": item.tilt,
                  "--sig-y": item.y,
                } as React.CSSProperties
              }
            >
              {item.char}
            </span>
          ))}
        </span>
      </div>

      {showRounds && (
        <div className="footer-balls" aria-hidden="true">
          {ROUND_SPECS.map((spec, index) => {
            if (spec.kind === "roll") {
              return (
                <div
                  key={spec.id}
                  ref={(el) => {
                    ballRefs.current[index] = el;
                  }}
                  className="sig-ball sig-ball--roll"
                >
                  <StudioRollSvg spec={spec} />
                </div>
              );
            }

            const style = {
              "--ball-bg": spec.bg,
              "--ball-ink": spec.ink,
            } as React.CSSProperties;

            if (spec.external) {
              return (
                <a
                  key={spec.id}
                  ref={(el) => {
                    ballRefs.current[index] = el;
                  }}
                  href={spec.href}
                  target="_blank"
                  rel="noreferrer"
                  tabIndex={-1}
                  className="sig-ball sig-ball--disc"
                  style={style}
                  aria-label={spec.label}
                >
                  <DiscArtwork spec={spec} />
                </a>
              );
            }

            return (
              <Link
                key={spec.id}
                ref={(el) => {
                  ballRefs.current[index] = el;
                }}
                href={spec.href}
                prefetch={false}
                tabIndex={-1}
                className="sig-ball sig-ball--disc"
                style={style}
                aria-label={spec.label}
              >
                <DiscArtwork spec={spec} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
