"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check, Loader2, Sparkles, Tag } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";

// Anonymous free-tool widget. The daily counter is mirrored in localStorage
// (UX) while the API route enforces the real limit server-side (3/day per IP).
const DAILY_LIMIT = 3;
const STORAGE_KEY = "craftly_free_title_uses";

interface Result {
  title: string;
  tags: string[];
  description_preview: string;
  truncated: boolean;
}

function usesToday(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const { day, count } = JSON.parse(raw);
    if (day !== new Date().toISOString().slice(0, 10)) return 0;
    return count;
  } catch {
    return 0;
  }
}

function bumpUses() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ day: new Date().toISOString().slice(0, 10), count: usesToday() + 1 })
    );
  } catch {
    // private mode etc. — the server-side limit still applies
  }
}

export default function FreeTitleGenerator() {
  const { t } = useI18n();
  const [productName, setProductName] = useState("");
  const [productType, setProductType] = useState("");
  const [material, setMaterial] = useState("");
  const [style, setStyle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState<"title" | "tags" | null>(null);
  const [used, setUsed] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productName.trim() || !productType.trim() || !material.trim()) {
      setError(t("marketing.titleGen.errorFill"));
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/tools/free-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_name: productName,
          product_type: productType,
          material,
          style,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("marketing.titleGen.errorGeneric"));
        if (data.limitReached) {
          setLimitReached(true);
          setUsed(DAILY_LIMIT);
        }
        return;
      }
      setResult(data);
      bumpUses();
      setUsed(usesToday());
    } catch {
      setError(t("marketing.titleGen.errorNetwork"));
    } finally {
      setLoading(false);
    }
  }

  async function copy(text: string, what: "title" | "tags") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // clipboard unavailable — user can select manually
    }
  }

  const remaining = Math.max(0, DAILY_LIMIT - (used || usesToday()));

  return (
    <section className="px-5 pb-24">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-xl border border-border bg-card p-6 md:p-10">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {t("marketing.titleGen.noSignup")} · {limitReached ? 0 : remaining} {t("marketing.titleGen.freeToday")}
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-medium text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              {t("marketing.titleGen.freeForever")}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  {t("marketing.titleGen.madeLabel")} <span className="text-destructive">*</span>
                </label>
                <input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder={t("marketing.titleGen.madePh")}
                  maxLength={120}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  {t("marketing.titleGen.typeLabel")} <span className="text-destructive">*</span>
                </label>
                <input
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  placeholder={t("marketing.titleGen.typePh")}
                  maxLength={80}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  {t("marketing.titleGen.materialLabel")} <span className="text-destructive">*</span>
                </label>
                <input
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder={t("marketing.titleGen.materialPh")}
                  maxLength={80}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  {t("marketing.titleGen.styleLabel")} <span className="text-muted-foreground">{t("marketing.titleGen.optional")}</span>
                </label>
                <input
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  placeholder={t("marketing.titleGen.stylePh")}
                  maxLength={80}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || limitReached}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-center font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("marketing.titleGen.writing")}
                </>
              ) : (
                t("marketing.titleGen.generate")
              )}
            </button>
          </form>

          {error && (
            <p className="mt-4 text-sm text-destructive">{error}</p>
          )}

          {limitReached && !loading && (
            <div className="mt-6 rounded-lg border border-primary/40 bg-primary/5 p-5 text-center">
              <p className="text-[15px] font-medium text-foreground">
                {t("marketing.titleGen.limitTitle")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("marketing.titleGen.limitBody")}
              </p>
              <Link
                href="/signup"
                className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                {t("marketing.titleGen.limitCta")}
              </Link>
            </div>
          )}

          {result && (
            <div className="mt-8 space-y-6">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("marketing.titleGen.seoTitle")}
                  </h3>
                  <button
                    onClick={() => copy(result.title, "title")}
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    {copied === "title" ? (
                      <>
                        <Check className="h-4 w-4" /> {t("marketing.titleGen.copied")}
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" /> {t("marketing.titleGen.copy")}
                      </>
                    )}
                  </button>
                </div>
                <div className="rounded-lg border border-border bg-background p-4 text-[15px] leading-relaxed text-foreground">
                  {result.title}
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {result.title.length}{t("marketing.titleGen.charCount")}
                </p>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("marketing.titleGen.tags")}
                  </h3>
                  <button
                    onClick={() => copy(result.tags.join(", "), "tags")}
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    {copied === "tags" ? (
                      <>
                        <Check className="h-4 w-4" /> {t("marketing.titleGen.copied")}
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" /> {t("marketing.titleGen.copyAll")}
                      </>
                    )}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground"
                    >
                      <Tag className="h-3 w-3 text-primary" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("marketing.titleGen.descPreview")}
                </h3>
                <div className="rounded-lg border border-border bg-background p-4 text-[15px] leading-relaxed text-muted-foreground">
                  {result.description_preview}
                </div>
              </div>

              <div className="rounded-xl border-2 border-primary/60 bg-primary/5 p-6 text-center">
                <p className="text-[15px] font-medium text-foreground">
                  {result.truncated
                    ? t("marketing.titleGen.unlockFull")
                    : t("marketing.titleGen.refine")}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("marketing.titleGen.freeAccount")}
                </p>
                <Link
                  href="/signup"
                  className="mt-4 inline-block rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  {t("marketing.titleGen.getFull")}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
