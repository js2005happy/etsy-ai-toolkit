"use client";

import { useEffect, useRef } from "react";
import ProductWindow from "./product-window";

export default function HeroProduct() {
  const ref = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  // 滚动：由近及远缩小 + 淡出
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / (vh * 0.85)));
      const scale = 1 - progress * 0.1;
      const opacity = 1 - progress * 0.55;
      el.style.transform = `scale(${scale.toFixed(3)})`;
      el.style.opacity = opacity.toFixed(3);
      raf = 0;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // 鼠标跟随 3D 倾斜
  useEffect(() => {
    const el = tiltRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(1200px) rotateX(${(-py * 10).toFixed(
        2
      )}deg) rotateY(${(px * 14).toFixed(2)}deg)`;
    };
    const onMouseLeave = () => {
      el.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg)";
    };

    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseleave", onMouseLeave);
    return () => {
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <div ref={ref} className="will-change-transform">
      <div
        ref={tiltRef}
        className="will-change-transform transition-transform duration-200 ease-out"
      >
        <ProductWindow dark />
      </div>
    </div>
  );
}
