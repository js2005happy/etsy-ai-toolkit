"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PackageSearch, ArrowLeft } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { useI18n } from "@/lib/i18n/client";

// Sourcing is a distinct sub-brand (per the audit: separate it from the core
// listing tools). This header drops the shared Craftly nav in favor of a
// sourcing-only wordmark + "Back to Craftly" escape hatch.
export default function SourcingHeader() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const links = [
    { label: t("marketing.sourcing.how"), href: "#how" },
    { label: t("marketing.sourcing.pricing"), href: "#pricing" },
    { label: t("marketing.sourcing.trust"), href: "#trust" },
    { label: t("marketing.sourcing.quoteTitle"), href: "#quote" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full px-5 py-4">
      <nav
        className="liquid-glass mx-auto flex h-14 max-w-[1200px] items-center justify-between rounded-full px-4 transition-colors duration-300"
        style={{
          background: scrolled ? "rgba(10, 9, 8, 0.72)" : "rgba(10, 9, 8, 0)",
        }}
      >
        <Link href="/sourcing" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <PackageSearch className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-sans text-lg font-extrabold text-foreground">
              Craftly Sourcing
            </span>
            <span className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {t("marketing.sourcing.byline")}
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:flex"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("marketing.sourcing.back")}
          </Link>
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              {t("marketing.sourcing.dashboard")}
            </Link>
          ) : (
            <Link
              href="/signup"
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              {t("marketing.sourcing.signup")}
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
