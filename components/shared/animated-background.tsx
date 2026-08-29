export default function AnimatedBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      {/* 顶部电影光带：青蓝 → 紫 → 暖橙，宽银幕镜头光 */}
      <div className="absolute inset-x-0 top-0 h-[36rem] bg-gradient-to-b from-blue-500/40 via-violet-500/30 to-transparent" />

      {/* 多彩极光光斑 */}
      <div className="absolute -top-40 left-[12%] h-[44rem] w-[44rem] rounded-full bg-violet-500/48 blur-3xl animate-aurora-1" />
      <div className="absolute top-[16%] -right-32 h-[40rem] w-[40rem] rounded-full bg-blue-400/48 blur-3xl animate-aurora-2" />
      <div className="absolute bottom-[-12rem] left-[28%] h-[38rem] w-[38rem] rounded-full bg-fuchsia-500/44 blur-3xl animate-aurora-3" />
      <div className="absolute top-[40%] left-[45%] h-[32rem] w-[32rem] rounded-full bg-cyan-400/38 blur-3xl animate-aurora-2" />
      <div className="absolute -bottom-32 right-[20%] h-[30rem] w-[30rem] rounded-full bg-amber-400/32 blur-3xl animate-aurora-1" />

      {/* 胶片颗粒 */}
      <div className="film-grain absolute inset-0 opacity-[0.03]" />

      {/* 暗角 vignette（大幅减淡，保持通透） */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_72%,rgba(0,0,0,0.12)_100%)]" />
    </div>
  )
}
