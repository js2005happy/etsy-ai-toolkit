import type { Metadata } from "next";
import CinematicBackground from "@/components/cinematic/cinematic-background";
import CinematicNavbar from "@/components/cinematic/cinematic-navbar";
import ScrollReveal from "@/components/cinematic/scroll-reveal";
import BlurText from "@/components/liquid-glass/blur-text";

export const metadata: Metadata = {
  title: "Lumen — Cinematic Web Design",
  description:
    "Websites that unfold like a film. Dramatic type, cinematic color, motion that feels like a dissolve.",
};

const features = [
  {
    index: "01",
    title: "Direction",
    desc: "Every frame is composed with intent. Nothing on the page is accidental.",
  },
  {
    index: "02",
    title: "Color",
    desc: "Graded like 35mm footage. Deep, moody, unmistakably cinematic.",
  },
  {
    index: "03",
    title: "Motion",
    desc: "Dissolves, not glitches. Motion that settles like film grain.",
  },
];

const showcases = [
  {
    title: "A new kind of opening",
    italic: "opening",
    tag: "Opening Titles",
    text: "We treat every landing page like a title sequence — establishing tone in the first frame, then letting the story breathe.",
  },
  {
    title: "Motion with gravity",
    italic: "gravity",
    tag: "Scene 02",
    text: "Transitions that settle, never bounce. Every scroll feels like a cut in a well-edited reel.",
  },
];

export default function CinematicPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden text-white">
      <CinematicBackground />
      <CinematicNavbar />

      {/* HERO */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p
          className="animate-fade-up font-mono text-[13px] uppercase tracking-[0.2em] text-white/60"
          style={{ animationDelay: "0ms" }}
        >
          A film-first design studio
        </p>
        <h1 className="mt-8 font-display font-semibold text-[clamp(48px,9vw,110px)] leading-[1.05] tracking-[-0.01em]">
          <span className="mask-line">
            <span style={{ animationDelay: "80ms" }}>Design beyond</span>
          </span>
          <span className="mask-line">
            <span style={{ animationDelay: "200ms" }}>
              <em className="italic">limits</em>
            </span>
          </span>
        </h1>
        <p
          className="animate-fade-up mt-8 max-w-xl text-lg leading-relaxed text-white/60 md:text-xl"
          style={{ animationDelay: "320ms" }}
        >
          We craft websites that unfold like a film — dramatic type, cinematic
          color, motion that feels like a dissolve.
        </p>
        <a
          href="#"
          className="animate-fade-up mt-10 rounded-full bg-white px-8 py-4 text-lg font-semibold text-black transition-transform duration-300 hover:scale-[1.04]"
          style={{ animationDelay: "440ms" }}
        >
          Start the film
        </a>
      </section>

      {/* FEATURE CARDS */}
      <section className="mx-auto max-w-6xl px-6 py-28">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map((f, i) => (
            <ScrollReveal key={f.index} delay={i * 120} className="h-full">
              <div className="glass-cinematic flex h-full flex-col rounded-3xl p-8">
                <span className="font-mono text-sm text-white/50">{f.index}</span>
                <h3 className="mt-6 text-[28px] font-semibold">{f.title}</h3>
                <p className="mt-3 text-lg leading-relaxed text-white/70">{f.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* SHOWCASE */}
      <section className="mx-auto max-w-6xl space-y-24 px-6 py-28">
        {showcases.map((s, i) => (
          <div
            key={s.title}
            className={`grid items-center gap-12 md:grid-cols-2 ${
              i % 2 === 1 ? "md:[direction:rtl]" : ""
            }`}
          >
            <ScrollReveal className="md:[direction:ltr]">
              <h2 className="font-display font-semibold text-[clamp(36px,5vw,64px)] leading-[1.05]">
                {s.title.split(" ").map((word) =>
                  word === s.italic ? (
                    <em key={word} className="italic">
                      {word}{" "}
                    </em>
                  ) : (
                    <span key={word}>{word} </span>
                  )
                )}
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-white/60">{s.text}</p>
            </ScrollReveal>
            <ScrollReveal image delay={100} className="md:[direction:ltr]">
              <div className="glass-cinematic flex aspect-[4/3] items-center justify-center rounded-3xl">
                <span className="font-mono text-sm uppercase tracking-[0.2em] text-white/50">
                  {s.tag}
                </span>
              </div>
            </ScrollReveal>
          </div>
        ))}
      </section>

      {/* BIG STATEMENT */}
      <section className="relative flex min-h-[60vh] items-center justify-center px-6 py-32 text-center">
        <h2 className="max-w-5xl font-display font-semibold text-[clamp(40px,6vw,72px)] leading-[1.1]">
          <BlurText text="Every scroll is a scene change." />
        </h2>
      </section>

      {/* FOOTER */}
      <footer className="mx-auto max-w-6xl px-6 pb-12">
        <ScrollReveal>
          <div className="glass-cinematic flex flex-col items-center justify-between gap-4 rounded-3xl px-8 py-6 md:flex-row">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">
              © 2026 Lumen
            </span>
            <div className="flex gap-8 font-mono text-xs uppercase tracking-[0.2em] text-white/60">
              <a href="#" className="transition-colors hover:text-white">Direction</a>
              <a href="#" className="transition-colors hover:text-white">Color</a>
              <a href="#" className="transition-colors hover:text-white">Motion</a>
              <a href="#" className="transition-colors hover:text-white">Contact</a>
            </div>
          </div>
        </ScrollReveal>
      </footer>
    </div>
  );
}
