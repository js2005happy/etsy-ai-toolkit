import Link from "next/link";

export default function Logo({
  brand,
  className = "",
}: {
  brand: string;
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2.5 ${className}`}
      aria-label={brand}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt={brand}
        width={32}
        height={32}
        className="h-8 w-8 shrink-0 object-contain"
      />
      <span className="font-display text-xl text-foreground">{brand}</span>
    </Link>
  );
}
