import Link from "next/link";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`k-logo${className ? " " + className : ""}`}>
      craftly<span className="k-dot">.</span>
    </Link>
  );
}
