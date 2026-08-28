export default function AnimatedBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-32 -left-32 h-[42rem] w-[42rem] rounded-full bg-amber-200/30 blur-3xl animate-aurora-1" />
      <div className="absolute top-1/3 -right-40 h-[38rem] w-[38rem] rounded-full bg-orange-200/30 blur-3xl animate-aurora-2" />
      <div className="absolute bottom-[-8rem] left-1/4 h-[34rem] w-[34rem] rounded-full bg-sky-200/30 blur-3xl animate-aurora-3" />
    </div>
  )
}
