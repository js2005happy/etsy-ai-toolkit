import Link from 'next/link'
import ModerationQueue from '@/components/marketplace/moderation-queue'

export const dynamic = 'force-dynamic'

export default function MarketplaceModerationPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <div><p className="text-xs uppercase tracking-[0.18em] text-primary">Marketplace operations</p><h1 className="font-display text-xl font-bold">Moderation queue</h1></div>
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Seller workspace</Link>
        </div>
      </header>
      <section className="mx-auto max-w-5xl px-5 py-10">
        <div className="mb-8 max-w-3xl">
          <h2 className="font-display text-3xl font-bold">Human review only</h2>
          <p className="mt-3 leading-7 text-muted-foreground">This queue is available only to authenticated user IDs listed in the server-side MARKETPLACE_MODERATOR_USER_IDS environment variable. Reviewing a report changes moderation metadata only; it does not automatically take down a listing or penalize a seller.</p>
        </div>
        <ModerationQueue />
      </section>
    </main>
  )
}
