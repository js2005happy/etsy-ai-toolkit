'use client'

import { useState, useEffect } from 'react'
import TiltCard from '@/components/ui/tilt-card'
import { Button } from '@/components/ui/button'
import CinematicBackground from '@/components/cinematic/cinematic-background'
import { useI18n } from '@/lib/i18n/client'
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

export default function DashboardPage() {
  const { t } = useI18n()
  const [credits, setCredits] = useState<number | null>(null)
  const [plan, setPlan] = useState<string | null>(null)
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [isManaging, setIsManaging] = useState(false)

  const isPro = plan === 'pro'

  const tools = [
    {
      icon: FileText,
      title: t('dashboard.toolListingTitle'),
      description: t('dashboard.toolListingDesc'),
      href: '/dashboard/listing',
    },
    {
      icon: MessageCircle,
      title: t('dashboard.toolMessagesTitle'),
      description: t('dashboard.toolMessagesDesc'),
      href: '/dashboard/messages',
    },
    {
      icon: Share2,
      title: t('dashboard.toolSocialTitle'),
      description: t('dashboard.toolSocialDesc'),
      href: '/dashboard/social',
    },
    {
      icon: Star,
      title: t('dashboard.toolReviewsTitle'),
      description: t('dashboard.toolReviewsDesc'),
      href: '/dashboard/reviews',
    },
    {
      icon: Megaphone,
      title: t('dashboard.toolAnnouncementTitle'),
      description: t('dashboard.toolAnnouncementDesc'),
      href: '/dashboard/announcement',
    },
    {
      icon: Search,
      title: t('dashboard.toolKeywordsTitle'),
      description: t('dashboard.toolKeywordsDesc'),
      href: '/dashboard/keywords',
    },
    {
      icon: Languages,
      title: t('dashboard.toolTranslateTitle'),
      description: t('dashboard.toolTranslateDesc'),
      href: '/dashboard/translate',
    },
    {
      icon: Wand2,
      title: t('dashboard.toolOptimizerTitle'),
      description: t('dashboard.toolOptimizerDesc'),
      href: '/dashboard/optimizer',
    },
    {
      icon: DollarSign,
      title: t('dashboard.toolPricingTitle'),
      description: t('dashboard.toolPricingDesc'),
      href: '/dashboard/pricing',
    },
  ]

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
      const res = await fetch('/api/paddle/checkout', { method: 'POST' })
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
      const res = await fetch('/api/paddle/portal', { method: 'POST' })
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
    <div className="min-h-screen">
      <CinematicBackground theme="default" />
      <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {t('dashboard.welcomeBack')}
          </h1>
          <p className="mt-2 text-lg text-white/60">
            {t('dashboard.manageTools')}
          </p>
        </div>

        {/* Credits */}
        <div className="mb-14 rounded-3xl border border-white/15 bg-white/[0.04] p-8 backdrop-blur-xl md:p-10">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] text-white">
                <Coins className="h-7 w-7" />
              </div>
              <div>
                <div className="text-sm font-normal text-white/60">
                  {isPro ? t('dashboard.yourPlan') : t('dashboard.yourCredits')}
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-4xl font-semibold tracking-tight text-white">
                    {isPro ? '∞' : credits !== null ? credits : '…'}
                  </span>
                  {!isPro && (
                    <span className="text-lg text-white/60">/ 10</span>
                  )}
                </div>
                <p className="mt-1 text-sm text-white/60">
                  {isPro ? t('dashboard.unlimitedGenerations') : t('dashboard.creditsRemaining')}
                </p>
              </div>
            </div>

            {isPro ? (
              <Button
                variant="outline"
                className="rounded-full px-6 py-3 font-medium"
                onClick={handleManageBilling}
                disabled={isManaging}
              >
                {isManaging && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('dashboard.manageBilling')}
              </Button>
            ) : (
              <div className="w-full max-w-xs">
                <div className="mb-2 flex justify-between text-xs font-medium text-white/60">
                  <span>{t('dashboard.usageThisMonth')}</span>
                  <span>
                    {credits !== null ? credits : 0} {t('dashboard.of10Used')}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#ff8a52] transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <Button
                  className="mt-5 w-full rounded-full px-6 py-3 font-medium"
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                >
                  {isUpgrading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('dashboard.processing')}
                    </>
                  ) : (
                    t('dashboard.upgradeToPro')
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Tools */}
        <div className="mb-8 flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            {t('dashboard.yourTools')}
          </h2>
          <span className="text-sm text-white/60">{t('dashboard.nineToolsZero')}</span>
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
