'use client'

import Link from 'next/link'

export default function SellersError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="min-h-screen bg-background text-foreground"><section className="mx-auto flex min-h-[70vh] max-w-2xl items-center px-5 py-16"><div className="w-full rounded-3xl border bg-card p-8 text-center"><p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Seller directory unavailable</p><h1 className="mt-3 font-display text-3xl font-bold">We could not load sellers.</h1><p className="mt-3 text-muted-foreground">No storefront data was changed. Retry the directory or return to Marketplace discovery.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><button type="button" onClick={reset} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Try again</button><Link href="/discover" className="rounded-lg border px-4 py-2 text-sm font-medium">Back to Discover</Link></div></div></section></main>
}
