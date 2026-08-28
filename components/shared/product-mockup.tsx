"use client";

import { useEffect, useRef } from "react";

export default function ProductMockup() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const center = rect.top + rect.height / 2 - vh / 2;
      const progress = center / vh;
      const rotateX = 16 - progress * 40;
      const rotateY = -12 + progress * 26;
      el.style.transform = `perspective(1600px) rotateX(${rotateX.toFixed(
        2
      )}deg) rotateY(${rotateY.toFixed(2)}deg)`;
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

  return (
    <div
      ref={ref}
      className="mx-auto w-full max-w-5xl px-5 [transform-style:preserve-3d] will-change-transform"
    >
      <div className="overflow-hidden rounded-[28px] border border-white/20 bg-[#0a0a14]/80 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        {/* 标题栏 */}
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.06] px-5 py-3.5">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-[13px] font-medium text-white/60">Etsy Seller AI Toolkit</span>
          <span className="rounded-full bg-[#F1641E] px-2.5 py-0.5 text-[11px] font-semibold text-white">
            Pro
          </span>
        </div>

        {/* 工具名 */}
        <div className="border-b border-white/10 px-6 py-4">
          <span className="text-sm font-semibold text-white">Listing Generator</span>
        </div>

        {/* 主体 */}
        <div className="grid gap-5 p-6 md:grid-cols-2">
          {/* 左：输入 */}
          <div className="flex flex-col gap-3 rounded-2xl bg-white/[0.05] p-5">
            <label className="text-xs font-semibold uppercase tracking-wide text-white/50">
              Product details
            </label>
            <div className="rounded-xl bg-white/[0.06] p-4 text-sm leading-relaxed text-white/70">
              Handmade ceramic coffee mug, 12 oz, glazed in speckled cream, kiln-fired at
              1200&deg;C, food-safe, microwave &amp; dishwasher safe…
            </div>
            <div className="flex flex-wrap gap-2">
              {["ceramic", "handmade", "minimalist"].map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/20 bg-white/[0.06] px-3 py-1 text-xs text-white/70"
                >
                  {t}
                </span>
              ))}
            </div>
            <button className="mt-1 rounded-full bg-[#F1641E] py-2.5 text-sm font-semibold text-white">
              Generate listing
            </button>
          </div>

          {/* 右：AI 结果 */}
          <div className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-white/[0.04] p-5">
            <label className="text-xs font-semibold uppercase tracking-wide text-white/50">
              AI output
            </label>
            <p className="text-lg font-semibold leading-snug tracking-tight text-white">
              Handmade Speckled Ceramic Coffee Mug
            </p>
            <p className="text-sm leading-relaxed text-white/70">
              A one-of-a-kind 12oz stoneware mug, thrown by hand and finished in a warm speckled
              cream glaze. Dishwasher and microwave safe.
            </p>
            <div className="flex flex-wrap gap-2">
              {["#ceramicmug", "#handmade", "#coffee"].map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-[#F1641E]/20 px-3 py-1 text-xs font-medium text-[#ff8a52]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
