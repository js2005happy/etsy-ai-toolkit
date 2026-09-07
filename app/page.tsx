import type { Metadata } from 'next'
import Navbar from '@/components/shared/navbar'
import SiteFooter from '@/components/shared/site-footer'
import HomeClient from '@/components/home/home-client'

export const metadata: Metadata = {
  title: 'Craftly — The AI workspace for your Etsy shop',
  description:
    'Connect your Etsy shop, find listing issues, review AI improvements, and publish approved changes from one workspace.',
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
