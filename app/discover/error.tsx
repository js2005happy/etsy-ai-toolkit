'use client'

import Link from 'next/link'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function DiscoverError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
      <div className="w-full max-w-lg rounded-3xl border bg-card p-8 text-center shadow-sm">
        <AlertTriangle className="mx-auto h-9 w-9 text-amber-500" />
        <h1 className="mt-4 font-display text-2xl font-bold">Marketplace could not load</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">The catalog is temporarily unavailable. No purchase or account action was performed.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"><RefreshCw className="mr-2 h-4 w-4" />Try again</button>
          <Link href="/" className="inline-flex h-10 items-center rounded-lg border px-4 text-sm font-medium">Back to Craftly</Link>
        </div>
      </div>
    </main>
  )
}
