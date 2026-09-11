'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle2, Store } from 'lucide-react'
import EtsyConnect from '@/components/account/etsy-connect'
import ShopifyConnect from '@/components/account/shopify-connect'
import CommerceConnections from '@/components/account/commerce-connections'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const channels = [
  { name: 'Etsy', mode: 'OAuth', detail: 'Connect your Etsy shop and review approved listing changes before publishing.' },
  { name: 'Shopify', mode: 'OAuth', detail: 'Connect a Shopify store for product publishing, order import and inventory workflows.' },
  { name: 'WooCommerce', mode: 'REST API', detail: 'Connect your own WooCommerce store with read/write REST API credentials.' },
  { name: 'eBay', mode: 'OAuth', detail: 'Connect eBay for inventory, account, fulfillment and reviewed publishing workflows.' },
]

export default function SalesChannelsPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Sales Channels</p>
          <h1 className="mt-1 font-display text-3xl font-bold">Connect Etsy, Shopify, WooCommerce and eBay</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            These four channels form Craftly&apos;s first production connector batch. Connect stores here, then use Product Hub and Multichannel Commerce to generate, review and publish channel-specific work.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/multichannel">Open Multichannel Commerce <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {channels.map((channel) => (
          <Card key={channel.name} className="border-primary/15">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-lg"><Store className="h-4 w-4 text-primary" />{channel.name}</CardTitle>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">Production connector</span>
              </div>
              <CardDescription>{channel.mode}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>{channel.detail}</p>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-foreground"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />Human-reviewed publishing flow</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Etsy</CardTitle>
            <CardDescription>Connect or reconnect your Etsy seller account.</CardDescription>
          </CardHeader>
          <CardContent><EtsyConnect /></CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shopify</CardTitle>
            <CardDescription>Enter your shop domain and authorize Craftly through Shopify OAuth.</CardDescription>
          </CardHeader>
          <CardContent><ShopifyConnect /></CardContent>
        </Card>
      </div>

      <div id="additional-commerce-channels" className="mt-8">
        <CommerceConnections />
      </div>
    </div>
  )
}
