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
  ImageIcon,
  Coins,
  Loader2,
  ListChecks,
  Mail,
  Target,
  Crosshair,
  BookOpen,
  Globe,
} from 'lucide-react'

export default function DashboardPage() {
  const { t } = useI18n()
  const [credits, setCredits] = useState<number | null>(null)
  const [plan, setPlan] = useState<string | null>(null)
  const [quota, setQuota] = useState<number | null>(null)
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [isManaging, setIsManaging] = useState(false)

  const isPaid = plan !== 'free' && plan != null

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
    {
      icon: ImageIcon,
      title: t('dashboard.toolImagesTitle'),
      description: t('dashboard.toolImagesDesc'),
      href: '/dashboard/images',
    },
    {
      icon: ListChecks,
      title: t('dashboard.toolBulletsTitle'),
      description: t('dashboard.toolBulletsDesc'),
      href: '/dashboard/bullets',
    },
    {
      icon: Target,
      title: t('dashboard.toolAdCopyTitle'),
      description: t('dashboard.toolAdCopyDesc'),
      href: '/dashboard/ad-copy',
    },
    {
      icon: Mail,
      title: t('dashboard.toolEmailTitle'),
      description: t('dashboard.toolEmailDesc'),
      href: '/dashboard/email',
    },
    {
      icon: Crosshair,
      title: t('dashboard.toolCompetitorTitle'),
      description: t('dashboard.toolCompetitorDesc'),
      href: '/dashboard/competitor-analysis',
    },
    {
      icon: BookOpen,
      title: t('dashboard.toolBrandStoryTitle'),
      description: t('dashboard.toolBrandStoryDesc'),
      href: '/dashboard/brand-story',
    },
    {
      icon: Globe,
      title: t('dashboard.toolGlobalPricingTitle'),
      description: t('dashboard.toolGlobalPricingDesc'),
      href: '/dashboard/global-pricing',
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
          setQuota(data.quota ?? null)
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

  const progressPercentage = credits !== null && quota ? Math.min((credits / quota) * 100, 100) : 0

  return (
    <div className="min-h-screen">
      <CinematicBackground theme="default" />
      <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
        {/* Header */}
        <div className="mb-12">
          <p className="font-hand text-2xl text-primary">craftly</p>
          <h1 className="mt-1 font-display text-4xl tracking-tight text-foreground md:text-5xl">
            {t('dashboard.welcomeBack')}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">{t('dashboard.manageTools')}</p>
        </div>

        {/* Credits */}
        <div className="relative mb-14 overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground md:p-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-black/15 blur-3xl" />

          <div className="relative flex flex-col items-start justify-between gap-10 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-primary-foreground/70">
                <Coins className="h-4 w-4" />
                {t('dashboard.yourCredits')}
              </div>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="font-display text-6xl leading-none tracking-tight md:text-7xl">
                  {isPaid ? '∞' : credits !== null ? credits : '…'}
                </span>
                {!isPaid && quota !== null && (
                  <span className="text-xl text-primary-foreground/60">/ {quota}</span>
                )}
              </div>
              <p className="mt-3 text-sm text-primary-foreground/70">
                {isPaid ? t('dashboard.unlimitedGenerations') : t('dashboard.creditsRemaining')}
              </p>
            </div>

            <div className="flex w-full flex-col items-center gap-6 md:w-auto md:items-end">
              {isPaid ? (
                <Button
                  variant="outline"
                  className="rounded-full border-white/30 bg-white/10 px-6 py-3 font-medium text-primary-foreground hover:bg-white/20"
                  onClick={handleManageBilling}
                  disabled={isManaging}
                >
                  {isManaging && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('dashboard.manageBilling')}
                </Button>
              ) : (
                <>
                  <div className="relative h-28 w-28">
                    <svg viewBox="0 0 112 112" className="h-full w-full -rotate-90">
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        fill="none"
                        stroke="rgba(255,255,255,0.18)"
                        strokeWidth="8"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        fill="none"
                        stroke="rgba(255,255,255,0.95)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 48}
                        strokeDashoffset={2 * Math.PI * 48 * (1 - progressPercentage / 100)}
                        className="transition-[stroke-dashoffset] duration-700 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-display text-2xl">{Math.round(progressPercentage)}%</span>
                    </div>
                  </div>
                  <Button
                    className="w-full rounded-full bg-white px-6 py-3 font-semibold text-primary hover:bg-white/90 md:w-auto"
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
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tools */}
        <div className="mb-8 flex items-baseline justify-between">
          <h2 className="font-display text-2xl tracking-tight text-foreground">
            {t('dashboard.yourTools')}
          </h2>
          <span className="text-sm text-muted-foreground">{t('dashboard.nineToolsZero')}</span>
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
