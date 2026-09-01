"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check, Loader2, Sparkles, Tag } from "lucide-react";

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
      setError("Please fill in the product name, product type, and material.");
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
        setError(data.error || "Something went wrong. Please try again.");
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
      setError("Network error. Please check your connection and try again.");
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
              No signup needed · {limitReached ? 0 : remaining} of {DAILY_LIMIT} free today
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-medium text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              Free forever
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  What did you make? <span className="text-destructive">*</span>
                </label>
                <input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Speckled stoneware mug"
                  maxLength={120}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Product type <span className="text-destructive">*</span>
                </label>
                <input
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  placeholder="Coffee mug"
                  maxLength={80}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Material <span className="text-destructive">*</span>
                </label>
                <input
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="Speckled stoneware, matte sage glaze"
                  maxLength={80}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Style <span className="text-muted-foreground">(optional)</span>
                </label>
                <input
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  placeholder="Minimalist, boho, cottagecore…"
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
                  Writing your listing…
                </>
              ) : (
                "Generate my Etsy title + tags"
              )}
            </button>
          </form>

          {error && (
            <p className="mt-4 text-sm text-destructive">{error}</p>
          )}

          {limitReached && !loading && (
            <div className="mt-6 rounded-lg border border-primary/40 bg-primary/5 p-5 text-center">
              <p className="text-[15px] font-medium text-foreground">
                Today&apos;s 3 free generations are used up.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                A free account gets 10 credits every month — no card required.
              </p>
              <Link
                href="/signup"
                className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Create free account
              </Link>
            </div>
          )}

          {result && (
            <div className="mt-8 space-y-6">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    SEO Title
                  </h3>
                  <button
                    onClick={() => copy(result.title, "title")}
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    {copied === "title" ? (
                      <>
                        <Check className="h-4 w-4" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" /> Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="rounded-lg border border-border bg-background p-4 text-[15px] leading-relaxed text-foreground">
                  {result.title}
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {result.title.length}/140 characters — Etsy reads the first 40 most closely.
                </p>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    13 Tags
                  </h3>
                  <button
                    onClick={() => copy(result.tags.join(", "), "tags")}
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    {copied === "tags" ? (
                      <>
                        <Check className="h-4 w-4" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" /> Copy all
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
                  Description preview
                </h3>
                <div className="rounded-lg border border-border bg-background p-4 text-[15px] leading-relaxed text-muted-foreground">
                  {result.description_preview}
                </div>
              </div>

              <div className="rounded-xl border-2 border-primary/60 bg-primary/5 p-6 text-center">
                <p className="text-[15px] font-medium text-foreground">
                  {result.truncated
                    ? "Unlock the full description + save & edit"
                    : "Want to refine it and generate more?"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Free account: 10 credits/month, all 15 tools, no card required.
                </p>
                <Link
                  href="/signup"
                  className="mt-4 inline-block rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Get the full listing — free
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
