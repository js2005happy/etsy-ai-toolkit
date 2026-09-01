export default function AnimatedBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      {/* 柔和暖色光晕，替代原来的冷色极光 */}
      <div className="absolute -top-32 left-[8%] h-[36rem] w-[36rem] rounded-full bg-[#e9e5df]/50 blur-3xl" />
      <div className="absolute top-[26%] -right-28 h-[34rem] w-[34rem] rounded-full bg-[#f0ece4]/60 blur-3xl" />
      <div className="absolute bottom-[-12rem] left-[26%] h-[32rem] w-[32rem] rounded-full bg-[#e9e5df]/40 blur-3xl" />

      {/* 胶片颗粒（极淡，保持通透） */}
      <div className="film-grain absolute inset-0 opacity-[0.02]" />
    </div>
  )
}
