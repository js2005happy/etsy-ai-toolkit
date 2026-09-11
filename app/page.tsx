import type { Metadata } from 'next'
import Navbar from '@/components/shared/navbar'
import SiteFooter from '@/components/shared/site-footer'
import HomeClient from '@/components/home/home-client'
import MultichannelLaunch from '@/components/home/multichannel-launch'

export const metadata: Metadata = {
  title: 'Craftly — AI seller workspace for Etsy, Shopify, WooCommerce & eBay',
  description:
    'Connect Etsy, Shopify, WooCommerce and eBay. Create marketplace-ready content, review AI improvements, and publish approved changes from one seller workspace.',
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <MultichannelLaunch />
        <div className="[&_.k-hero]:hidden">
          <HomeClient />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
