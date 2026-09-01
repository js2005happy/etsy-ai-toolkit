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
    <section className="k-wrap k-page-head">
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h1 className="k-h1" style={{ marginTop: eyebrow ? 16 : 0 }}>
        {title}
      </h1>
      {subtitle && <p className="k-lead">{subtitle}</p>}
    </section>
  );
}
