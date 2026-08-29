import Reveal from "@/components/shared/reveal";

export default function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
}) {
  return (
    <section className="px-5 pb-16 pt-32 text-center md:pb-24 md:pt-44">
      <div className="mx-auto max-w-4xl">
        {eyebrow && (
          <Reveal>
            <p className="mb-5 text-[13px] uppercase tracking-[0.2em] text-primary">
              {eyebrow}
            </p>
          </Reveal>
        )}
        <Reveal delay={80}>
          <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-7xl">
            {title}
          </h1>
        </Reveal>
        {subtitle && (
          <Reveal delay={160}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              {subtitle}
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
