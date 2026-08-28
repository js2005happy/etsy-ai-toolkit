type DoodleProps = {
  className?: string;
};

const LINE = "#0d0d0d";
const FACE = "#FFE4F8";
const PINK = "#FF90E8";

function Sparkle({ cx, cy, r, fill = PINK }: { cx: number | string; cy: number | string; r: number | string; fill?: string }) {
  const x = Number(cx);
  const y = Number(cy);
  const radius = Number(r);
  return (
    <path
      d={`M${x} ${y - radius} Q${x} ${y} ${x + radius} ${y} Q${x} ${y} ${x} ${y + radius} Q${x} ${y} ${x - radius} ${y} Q${x} ${y} ${x} ${y - radius} Z`}
      fill={fill}
    />
  );
}

export function WavePerson({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 160 160" fill="none" className={className} aria-hidden="true">
      <circle cx="80" cy="52" r="26" fill={FACE} stroke={LINE} strokeWidth="4" />
      <circle cx="70" cy="50" r="3.5" fill={LINE} />
      <circle cx="90" cy="50" r="3.5" fill={LINE} />
      <path d="M70 62c4 4 16 4 20 0" stroke={LINE} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="63" cy="60" r="4" fill={PINK} opacity="0.75" />
      <circle cx="97" cy="60" r="4" fill={PINK} opacity="0.75" />
      <path d="M80 78v30" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      <path d="M80 108l-12 24M80 108l12 24" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      <path d="M80 90c-3 10-13 20-30 20" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      <path d="M50 110l-6-14 12 4" stroke={LINE} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M80 90c2 8 8 14 18 14" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      <Sparkle cx="34" cy="34" r="9" />
      <circle cx="138" cy="66" r="5" fill={PINK} />
    </svg>
  );
}

export function PenPerson({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 160 160" fill="none" className={className} aria-hidden="true">
      <circle cx="72" cy="52" r="26" fill={FACE} stroke={LINE} strokeWidth="4" />
      <circle cx="63" cy="50" r="3.5" fill={LINE} />
      <circle cx="83" cy="50" r="3.5" fill={LINE} />
      <path d="M64 62c4 4 14 4 18 0" stroke={LINE} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M72 78v26" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      <path d="M72 104l-11 24M72 104l11 24" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      <path d="M72 88c-3 6-8 10-16 10" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      <path d="M54 102l20-10" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      <path d="M74 92l-6 3 5 3z" fill={PINK} stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M72 88c2 6 4 10 8 12" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      <rect x="104" y="94" width="30" height="36" rx="3" fill="#fff" stroke={LINE} strokeWidth="3" transform="rotate(6 119 112)" />
      <path d="M112 106l16-2M112 114l12-1M112 122l14-1" stroke={LINE} strokeWidth="2.5" strokeLinecap="round" />
      <Sparkle cx="126" cy="34" r="8" />
      <circle cx="36" cy="112" r="5" fill={PINK} opacity="0.7" />
    </svg>
  );
}

export function ThinkPerson({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 160 160" fill="none" className={className} aria-hidden="true">
      <circle cx="80" cy="56" r="26" fill={FACE} stroke={LINE} strokeWidth="4" />
      <path d="M66 52h8" stroke={LINE} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="92" cy="52" r="3.5" fill={LINE} />
      <path d="M72 66c4 2 12 2 16 0" stroke={LINE} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M80 82v24" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      <path d="M80 106l-11 24M80 106l11 24" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      <path d="M80 92c-3 6-10 8-18 5" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      <path d="M80 92c2 6 6 8 14 8" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      <circle cx="118" cy="36" r="11" fill={PINK} stroke={LINE} strokeWidth="3" />
      <rect x="114" y="46" width="8" height="5" rx="1.5" fill={LINE} />
      <path d="M104 30l-5 1M104 42l-5-1" stroke={LINE} strokeWidth="2.5" strokeLinecap="round" />
      <Sparkle cx="34" cy="40" r="8" />
    </svg>
  );
}

export function CelebratePerson({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 160 160" fill="none" className={className} aria-hidden="true">
      <circle cx="80" cy="54" r="26" fill={FACE} stroke={LINE} strokeWidth="4" />
      <circle cx="70" cy="52" r="3.5" fill={LINE} />
      <circle cx="90" cy="52" r="3.5" fill={LINE} />
      <path d="M68 64c5 5 19 5 24 0" stroke={LINE} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M80 80v22" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      <path d="M80 102c-6 4-8 12-10 22M80 102c6 6 8 14 8 24" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      <path d="M80 88c-8-6-18-8-30-4" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      <path d="M80 88c8-6 18-8 30-4" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      <Sparkle cx="40" cy="36" r="9" />
      <Sparkle cx="126" cy="44" r="7" />
      <circle cx="136" cy="90" r="5" fill={PINK} opacity="0.7" />
    </svg>
  );
}

export function RunPerson({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 160 160" fill="none" className={className} aria-hidden="true">
      <circle cx="80" cy="48" r="23" fill={FACE} stroke={LINE} strokeWidth="4" />
      <circle cx="72" cy="46" r="3" fill={LINE} />
      <circle cx="89" cy="46" r="3" fill={LINE} />
      <path d="M72 56c4 4 13 4 17 0" stroke={LINE} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M80 71c4 9 5 20 3 31" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      <path d="M80 102c-10 2-16 8-18 18M83 102c8 4 12 13 13 24" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      <path d="M80 78c-9-4-17-2-23 2M80 78c10 0 19 4 23 11" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      <path d="M44 40l4-2M120 30l2 4" stroke={LINE} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function ThumbsUpPerson({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 160 160" fill="none" className={className} aria-hidden="true">
      <circle cx="80" cy="52" r="24" fill={FACE} stroke={LINE} strokeWidth="4" />
      <circle cx="71" cy="50" r="3" fill={LINE} />
      <circle cx="89" cy="50" r="3" fill={LINE} />
      <path d="M70 61c4 4 16 4 20 0" stroke={LINE} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="64" cy="59" r="4" fill={PINK} opacity="0.75" />
      <circle cx="96" cy="59" r="4" fill={PINK} opacity="0.75" />
      <path d="M80 76v28" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      <path d="M80 104l-11 23M80 104l11 23" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      <path d="M80 86c-2 8-8 14-20 16" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      <circle cx="58" cy="104" r="7" fill={FACE} stroke={LINE} strokeWidth="3.5" />
      <path d="M62 100l2-14" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      <path d="M80 86c2 8 6 12 14 13" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      <Sparkle cx="34" cy="40" r="8" />
    </svg>
  );
}

export function LovePerson({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 160 160" fill="none" className={className} aria-hidden="true">
      <circle cx="80" cy="46" r="22" fill={FACE} stroke={LINE} strokeWidth="4" />
      <circle cx="72" cy="44" r="3" fill={LINE} />
      <circle cx="88" cy="44" r="3" fill={LINE} />
      <path d="M71 54c3.5 3.5 14 3.5 18 0" stroke={LINE} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="65" cy="54" r="4" fill={PINK} opacity="0.75" />
      <circle cx="95" cy="54" r="4" fill={PINK} opacity="0.75" />
      <path d="M80 80c-8-2-14 0-18 4M80 80c8-2 14 0 18 4" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      <path d="M80 72 C 80 72 60 60 60 72 C 60 82 72 88 80 97 C 88 88 100 82 100 72 C 100 60 80 72 80 72 Z" fill={PINK} stroke={LINE} strokeWidth="3" strokeLinejoin="round" />
      <path d="M80 92v10" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      <path d="M80 102l-10 24M80 102l10 24" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      <Sparkle cx="124" cy="38" r="7" />
      <circle cx="34" cy="110" r="5" fill={PINK} opacity="0.7" />
    </svg>
  );
}

export function MeditatePerson({ className }: DoodleProps) {
  return (
    <svg viewBox="0 0 160 160" fill="none" className={className} aria-hidden="true">
      <circle cx="80" cy="58" r="22" fill={FACE} stroke={LINE} strokeWidth="4" />
      <path d="M70 56c2 3 6 3 8 0M82 56c2 3 6 3 8 0" stroke={LINE} strokeWidth="3" strokeLinecap="round" />
      <path d="M73 66c4 2 10 2 14 0" stroke={LINE} strokeWidth="3" strokeLinecap="round" />
      <path d="M80 80v14" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      <path d="M80 94c-10 4-16 12-18 22M80 94c10 4 16 12 18 22" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      <path d="M64 116c4-6 10-8 16-8c6 0 12 2 16 8" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      <path d="M80 82c-8 2-14 8-16 16M80 82c8 2 14 8 16 16" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      <path d="M62 34c10-6 26-6 36 0" stroke={PINK} strokeWidth="4" strokeLinecap="round" />
      <Sparkle cx="40" cy="70" r="7" />
    </svg>
  );
}
