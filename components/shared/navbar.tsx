"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/client";
import LanguageSwitcher from "@/components/shared/language-switcher";
import type { User } from "@supabase/supabase-js";
import { LayoutDashboard, UserRound, LogOut } from "lucide-react";

export default function Navbar() {
  const { t } = useI18n();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const initial = user?.email?.[0]?.toUpperCase() ?? "U";

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

        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          {user ? (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={t("nav.account")}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm font-semibold text-white transition-colors hover:bg-white/20"
              >
                {initial}
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-white/15 bg-neutral-900/95 p-1.5 shadow-2xl backdrop-blur-xl">
                  <div className="truncate px-3 py-2 text-xs text-white/50">
                    {user.email}
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    {t("nav.dashboard")}
                  </Link>
                  <Link
                    href="/account"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <UserRound className="h-4 w-4" />
                    {t("nav.account")}
                  </Link>
                  <div className="my-1 h-px bg-white/10" />
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("nav.signOut")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="hidden text-sm text-white/70 transition-colors hover:text-white sm:block">
                {t("nav.logIn")}
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition-transform duration-300 hover:scale-[1.04]"
              >
                {t("nav.signUp")}
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
