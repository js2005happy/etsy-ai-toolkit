'use client'

import { useState, useEffect } from 'react'
import TiltCard from '@/components/ui/tilt-card'
import { Button } from '@/components/ui/button'
import {
  FileText,
  MessageCircle,
  Share2,
  Star,
  Megaphone,
  Search,
  Languages,
  Wand2,
  DollarSign,
  Coins,
  Loader2,
} from 'lucide-react'

const tools = [
  {
    icon: FileText,
    title: 'Listing Generator',
    description: 'Turn product notes into SEO titles and descriptions that rank.',
    href: '/dashboard/listing',
  },
  {
    icon: MessageCircle,
    title: 'Message Assistant',
    description: 'Reply to customers with friendly, on-brand answers in seconds.',
    href: '/dashboard/messages',
  },
  {
    icon: Share2,
    title: 'Social Media Posts',
    description: 'Captions and hashtags for Instagram, Pinterest, and TikTok.',
    href: '/dashboard/social',
  },
  {
    icon: Star,
    title: 'Review Reply Assistant',
    description: 'Respond to reviews professionally and keep your rating high.',
    href: '/dashboard/reviews',
  },
  {
    icon: Megaphone,
    title: 'Announcement Generator',
    description: 'Welcome, promo, and about-us copy written for you.',
    href: '/dashboard/announcement',
  },
  {
    icon: Search,
    title: 'Keyword Research',
    description: 'Find high-volume keywords buyers actually search for.',
    href: '/dashboard/keywords',
  },
  {
    icon: Languages,
    title: 'Listing Translator',
    description: 'Localize your listings into multiple languages in one click.',
    href: '/dashboard/translate',
  },
  {
    icon: Wand2,
    title: 'Listing Optimizer',
    description: 'Improve an existing listing for better SEO and conversions.',
    href: '/dashboard/optimizer',
  },
  {
    icon: DollarSign,
    title: 'Pricing Advisor',
    description: 'Get a suggested price and profit breakdown for any product.',
    href: '/dashboard/pricing',
  },
]

export default function DashboardPage() {
  const [credits, setCredits] = useState<number | null>(null)
  const [plan, setPlan] = useState<string | null>(null)
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [isManaging, setIsManaging] = useState(false)

  const isPro = plan === 'pro'

  useEffect(() => {
    async function fetchCredits() {
      try {
        const res = await fetch('/api/user/credits')
        if (res.ok) {
          const data = await res.json()
          setCredits(data.credits)
          setPlan(data.plan ?? null)
        }
      } catch (e) {
        console.error('Failed to fetch credits', e)
      }
    }
    fetchCredits()
  }, [])

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        window.location.href = data.url
      } else {
        alert('Failed to initiate upgrade. Please try again.')
      }
    } catch (e) {
      alert('An error occurred. Please try again later.')
    } finally {
      setIsUpgrading(false)
    }
  }

  const handleManageBilling = async () => {
    setIsManaging(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        window.location.href = data.url
      } else {
        alert('Failed to open billing portal. Please try again.')
      }
    } catch (e) {
      alert('An error occurred. Please try again later.')
    } finally {
      setIsManaging(false)
    }
  }

  const progressPercentage = credits !== null ? Math.min((credits / 10) * 100, 100) : 0

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f] md:text-4xl">
            Welcome back!
          </h1>
          <p className="mt-2 text-lg text-[#6e6e73]">
            Manage your AI-powered Etsy tools and credits.
          </p>
        </div>

        {/* Credits */}
        <div className="mb-14 rounded-3xl border border-[#d2d2d7] bg-white p-8 shadow-sm md:p-10">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5f5f7] text-[#1d1d1f]">
                <Coins className="h-7 w-7" />
              </div>
              <div>
                <div className="text-sm font-normal text-[#6e6e73]">
                  {isPro ? 'Your plan' : 'Your credits'}
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-4xl font-semibold tracking-tight text-[#1d1d1f]">
                    {isPro ? '∞' : credits !== null ? credits : '…'}
                  </span>
                  {!isPro && (
                    <span className="text-lg text-[#6e6e73]">/ 10</span>
                  )}
                </div>
                <p className="mt-1 text-sm text-[#6e6e73]">
                  {isPro ? 'unlimited generations · Pro plan active' : 'credits remaining this month'}
                </p>
              </div>
            </div>

            {isPro ? (
              <Button
                variant="outline"
                className="rounded-full border-[#d2d2d7] px-6 py-3 font-medium text-[#1d1d1f] hover:bg-[#f5f5f7]"
                onClick={handleManageBilling}
                disabled={isManaging}
              >
                {isManaging && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Manage Billing
              </Button>
            ) : (
              <div className="w-full max-w-xs">
                <div className="mb-2 flex justify-between text-xs font-medium text-[#6e6e73]">
                  <span>Usage this month</span>
                  <span>
                    {credits !== null ? credits : 0} of 10 used
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#e8e8ed]">
                  <div
                    className="h-full rounded-full bg-[#0071e3] transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <Button
                  className="mt-5 w-full rounded-full bg-[#0071e3] px-6 py-3 font-medium text-white hover:bg-[#0077ed]"
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                >
                  {isUpgrading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Upgrade to Pro'
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Tools */}
        <div className="mb-8 flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-[#1d1d1f]">
            Your tools
          </h2>
          <span className="text-sm text-[#6e6e73]">Nine tools, zero busywork</span>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <TiltCard
              key={tool.href}
              href={tool.href}
              icon={<tool.icon className="h-6 w-6" />}
              title={tool.title}
              description={tool.description}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
