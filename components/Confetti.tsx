"use client";

import { useEffect, useRef } from "react";

// Petite explosion de confettis (canvas) jouée UNE fois — récompense visuelle
// à la fin d'une séance. Sans dépendance, et coupée si l'utilisateur a demandé
// « moins d'animations » (prefers-reduced-motion).
export function Confetti({ duration = 1600 }: { duration?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    const colors = ["#E12A3A", "#EDE9E0", "#ECC53A", "#54C06A"];
    const parts = Array.from({ length: 100 }, () => ({
      x: w / 2 + (Math.random() - 0.5) * 80,
      y: h * 0.3 + (Math.random() - 0.5) * 40,
      vx: (Math.random() - 0.5) * 9,
      vy: -7 - Math.random() * 7,
      s: 4 + Math.random() * 5,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.35,
      c: colors[Math.floor(Math.random() * colors.length)],
    }));

    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = now - start;
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.vy += 0.24; // gravité
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, 1 - t / duration);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
        ctx.restore();
      }
      if (t < duration) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
    />
  );
}
