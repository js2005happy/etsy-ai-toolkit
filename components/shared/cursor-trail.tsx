"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
};

const PINK = "#FF90E8";
const BLACK = "#0d0d0d";

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    let particles: Particle[] = [];
    let mouseX = -100;
    let mouseY = -100;
    let prevX = -100;
    let prevY = -100;
    let rafId = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = (x: number, y: number, speed: number) => {
      const angle = Math.random() * Math.PI * 2;
      const vel = (Math.random() * 0.6 + 0.2) * speed;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * vel,
        vy: Math.sin(angle) * vel - Math.random() * 0.4,
        life: 0,
        maxLife: Math.random() * 0.5 + 0.4,
        size: Math.random() * 7 + 3,
        color: Math.random() > 0.18 ? PINK : BLACK,
      });
    };

    const onMove = (e: MouseEvent) => {
      prevX = mouseX;
      prevY = mouseY;
      mouseX = e.clientX;
      mouseY = e.clientY;

      const dist = Math.hypot(mouseX - prevX, mouseY - prevY);
      const steps = Math.min(Math.floor(dist / 6), 4);
      for (let i = 0; i < steps; i++) {
        const t = i / Math.max(steps, 1);
        spawn(prevX + (mouseX - prevX) * t, prevY + (mouseY - prevY) * t, dist / 20);
      }
    };
    window.addEventListener("mousemove", onMove);

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles = particles.filter((p) => p.life < p.maxLife);
      for (const p of particles) {
        p.life += 0.016;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy = p.vy * 0.96 + 0.04;

        const t = p.life / p.maxLife;
        const alpha = 1 - t;
        const r = p.size * (1 - t * 0.7);

        ctx.globalAlpha = Math.max(alpha, 0);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(r, 0.1), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      rafId = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999]"
    />
  );
}
