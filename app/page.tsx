import type { Metadata } from 'next'
import Navbar from '@/components/shared/navbar'
import SiteFooter from '@/components/shared/site-footer'
import HomeClient from '@/components/home/home-client'

export const metadata: Metadata = {
  title: 'Craftly — Words that sell your craft',
  description:
    'Craftly turns rough notes and phone photos into listings, posts, and buyer replies that sound like you — for Etsy, Shopify, Instagram and more. Free for ten listings a month.',
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HomeClient />
      </main>
      <SiteFooter />
    </div>
  )
}
