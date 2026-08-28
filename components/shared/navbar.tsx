"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import LanguageSwitcher from "@/components/shared/language-switcher";

export default function Navbar() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);

  const links = [
    { label: t("nav.tools"), href: "/#tools" },
    { label: t("nav.howItWorks"), href: "/#how" },
    { label: t("nav.pricing"), href: "/pricing" },
    { label: t("nav.support"), href: "mailto:js2005happy@gmail.com" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full px-5 py-4">
      <nav
        className="mx-auto flex h-14 max-w-[1200px] items-center justify-between rounded-full border border-white/20 px-4 backdrop-blur-[20px] backdrop-saturate-[160%] transition-colors duration-300"
        style={{
          background: scrolled ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.08)",
          boxShadow:
            "0 24px 64px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
        }}
      >
        <Link href="/" className="font-display text-lg font-semibold italic text-white">
          {t("nav.brand")}
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link href="/login" className="hidden text-sm text-white/70 transition-colors hover:text-white sm:block">
            {t("nav.logIn")}
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition-transform duration-300 hover:scale-[1.04]"
          >
            {t("nav.signUp")}
          </Link>
        </div>
      </nav>
    </header>
  );
}
