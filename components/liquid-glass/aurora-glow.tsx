const palettes = {
  teal: {
    a: "bg-cyan-400/25",
    b: "bg-teal-300/20",
    c: "bg-blue-500/20",
  },
  violet: {
    a: "bg-violet-500/25",
    b: "bg-fuchsia-400/20",
    c: "bg-indigo-500/20",
  },
  slate: {
    a: "bg-white/15",
    b: "bg-slate-400/15",
    c: "bg-slate-500/15",
  },
} as const;

const particles = [
  { left: "12%", top: "28%", size: "h-1.5 w-1.5", delay: "0s" },
  { left: "70%", top: "18%", size: "h-1 w-1", delay: "1.2s" },
  { left: "38%", top: "58%", size: "h-1.5 w-1.5", delay: "0.6s" },
  { left: "84%", top: "52%", size: "h-1 w-1", delay: "1.8s" },
  { left: "22%", top: "72%", size: "h-1 w-1", delay: "2.4s" },
  { left: "62%", top: "82%", size: "h-1.5 w-1.5", delay: "0.9s" },
  { left: "48%", top: "12%", size: "h-1 w-1", delay: "3s" },
  { left: "90%", top: "78%", size: "h-1 w-1", delay: "1.5s" },
];

export default function AuroraGlow({
  variant = "teal",
}: {
  variant?: keyof typeof palettes;
}) {
  const p = palettes[variant];

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div
        className={`absolute -top-24 left-1/4 h-[38rem] w-[38rem] rounded-full blur-3xl animate-aurora-1 ${p.a}`}
      />
      <div
        className={`absolute top-1/3 -right-32 h-[34rem] w-[34rem] rounded-full blur-3xl animate-aurora-2 ${p.b}`}
      />
      <div
        className={`absolute bottom-[-8rem] left-1/3 h-[32rem] w-[32rem] rounded-full blur-3xl animate-aurora-3 ${p.c}`}
      />
      {particles.map((pt, i) => (
        <span
          key={i}
          className={`absolute ${pt.size} rounded-full bg-white/30 blur-[1px] animate-float`}
          style={{ left: pt.left, top: pt.top, animationDelay: pt.delay }}
        />
      ))}
    </div>
  );
}
