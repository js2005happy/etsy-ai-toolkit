export type CinematicTheme =
  | 'default'
  | 'listing'
  | 'messages'
  | 'social'
  | 'reviews'
  | 'announcement'
  | 'keywords'
  | 'translate'
  | 'optimizer'
  | 'pricing'

// 每个主题三色：主色 / 副色 / 强调色，对应渐变基底、bokeh 光斑与极光
const THEMES: Record<CinematicTheme, [string, string, string]> = {
  default: ['#8b5cf6', '#06b6d4', '#ec4899'],
  listing: ['#06b6d4', '#3b82f6', '#1d4ed8'],
  messages: ['#ec4899', '#a855f7', '#7c3aed'],
  social: ['#8b5cf6', '#6366f1', '#4338ca'],
  reviews: ['#06b6d4', '#3b82f6', '#1d4ed8'],
  announcement: ['#ec4899', '#a855f7', '#7c3aed'],
  keywords: ['#8b5cf6', '#6366f1', '#4338ca'],
  translate: ['#06b6d4', '#3b82f6', '#1d4ed8'],
  optimizer: ['#ec4899', '#a855f7', '#7c3aed'],
  pricing: ['#8b5cf6', '#6366f1', '#4338ca'],
}

function rgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function CinematicBackground({ theme = 'default' }: { theme?: CinematicTheme }) {
  const [a, b, c] = THEMES[theme]

  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden bg-[#070510]">
      {/* 电影感渐变基底 */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${rgba(a, 0.55)}, ${rgba(b, 0.65)}, ${rgba(c, 0.45)})`,
        }}
      />
      {/* bokeh 霓虹深度 */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 18% 28%, ${rgba(a, 0.32)}, transparent 50%), radial-gradient(ellipse at 82% 18%, ${rgba(b, 0.28)}, transparent 45%), radial-gradient(ellipse at 60% 82%, ${rgba(c, 0.3)}, transparent 50%), radial-gradient(ellipse at 30% 78%, ${rgba(b, 0.28)}, transparent 48%)`,
        }}
      />
      {/* 缓慢漂移的极光光斑 */}
      <div
        className="animate-aurora-1 absolute -top-40 left-[8%] h-[42rem] w-[42rem] rounded-full blur-[80px] mix-blend-screen will-change-transform"
        style={{ background: `radial-gradient(circle, ${rgba(a, 0.55)}, transparent 60%)` }}
      />
      <div
        className="animate-aurora-2 absolute top-[30%] -right-32 h-[38rem] w-[38rem] rounded-full blur-[80px] mix-blend-screen will-change-transform"
        style={{ background: `radial-gradient(circle, ${rgba(b, 0.45)}, transparent 60%)` }}
      />
      <div
        className="animate-aurora-3 absolute bottom-[-8rem] left-[35%] h-[36rem] w-[36rem] rounded-full blur-[80px] mix-blend-screen will-change-transform"
        style={{ background: `radial-gradient(circle, ${rgba(c, 0.45)}, transparent 60%)` }}
      />
      {/* 软暗角 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.38) 100%)",
        }}
      />
      {/* 胶片颗粒 */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.04]">
        <filter id="cinematic-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#cinematic-grain)" />
      </svg>
    </div>
  )
}
