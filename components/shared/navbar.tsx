"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/client";
import LanguageSwitcher from "@/components/shared/language-switcher";
import Logo from "@/components/shared/logo";
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
    { label: t("nav.support"), href: "/contact" },
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
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;

  return (
    <header className="sticky top-0 z-50 w-full px-5 py-4">
      <nav
        className="liquid-glass mx-auto flex h-14 max-w-[1200px] items-center justify-between rounded-full px-4 transition-colors duration-300"
        style={{
          background: scrolled ? "rgba(40, 43, 88, 0.72)" : "rgba(40, 43, 88, 0.35)",
        }}
      >
        <Logo brand={t("nav.brand")} />

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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
                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary text-sm font-semibold text-foreground transition-colors hover:bg-accent"
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  initial
                )}
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-xl">
                  <div className="truncate px-3 py-2 text-xs text-muted-foreground">
                    {user.email}
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    {t("nav.dashboard")}
                  </Link>
                  <Link
                    href="/account"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                  >
                    <UserRound className="h-4 w-4" />
                    {t("nav.account")}
                  </Link>
                  <div className="my-1 h-px bg-border" />
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("nav.signOut")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block">
                {t("nav.logIn")}
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
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
