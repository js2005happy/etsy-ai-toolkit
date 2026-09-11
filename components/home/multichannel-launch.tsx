import Link from 'next/link'
import { ArrowRight, CheckCircle2, Store } from 'lucide-react'

const CHANNELS = ['Etsy', 'Shopify', 'WooCommerce', 'eBay']

export default function MultichannelLaunch() {
  return (
    <section className="k-wrap pt-14 md:pt-20">
      <div className="overflow-hidden rounded-[2rem] border border-primary/20 bg-card/80 px-6 py-10 shadow-2xl backdrop-blur md:px-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <Store className="h-3.5 w-3.5" /> Craftly Multichannel Commerce
            </div>
            <h1 className="max-w-4xl font-display text-4xl font-bold tracking-tight text-foreground md:text-6xl">
              One seller workspace for Etsy, Shopify, WooCommerce and eBay.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Create product content once, adapt it for each marketplace, connect your stores, review changes and publish through one controlled workflow.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/signup" className="k-btn k-btn-primary whitespace-nowrap"><span>Start free</span><i className="k-shine" /></Link>
              <Link href="/dashboard/channels" className="k-btn whitespace-nowrap">Connect sales channels <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Human-reviewed publishing. Nothing is pushed to an external store until you approve it.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {CHANNELS.map((channel) => (
              <div key={channel} className="rounded-2xl border border-border bg-background/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-foreground">{channel}</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Production connector · reviewed publish workflow</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
