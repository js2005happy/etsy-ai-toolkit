'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import LegacyAccountPage from './legacy'
import CommerceConnections from '@/components/account/commerce-connections'

export default function AccountPage() {
  return (
    <>
      <style>{`.mb-6:has(#brandTone) { display: none !important; }`}</style>
      <LegacyAccountPage />
      <CommerceConnections />
      <div className="fixed bottom-5 right-5 z-[100] max-w-xs rounded-2xl border border-primary/20 bg-background/95 p-4 shadow-2xl backdrop-blur">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">Shop Voice moved to your Seller Workspace</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Use one structured profile for tone, audience, words to avoid, product rules and brand story.</p>
            <Link href="/dashboard/shop-voice" className="mt-3 inline-flex text-sm font-medium text-primary hover:underline">Open Shop Voice →</Link>
          </div>
        </div>
      </div>
    </>
  )
}
