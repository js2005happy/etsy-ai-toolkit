'use client'

import { useEffect, useState } from 'react'
import {
  BookOpen,
  Coins,
  Crosshair,
  DollarSign,
  FileText,
  Globe,
  ImageIcon,
  Languages,
  ListChecks,
  Loader2,
  Mail,
  Megaphone,
  MessageCircle,
  Search,
  Share2,
  Star,
  Target,
  Wand2,
} from 'lucide-react'
import TiltCard from '@/components/ui/tilt-card'
import { Button } from '@/components/ui/button'
import CinematicBackground from '@/components/cinematic/cinematic-background'
import SellerActionQueue from '@/components/dashboard/seller-action-queue'
import { useI18n } from '@/lib/i18n/client'

export default function DashboardPage() {
  const { t } = useI18n()
  const [credits, setCredits] = useState<number | null>(null)
  const [plan, setPlan] = useState<string | null>(null)
  const [quota, setQuota] = useState<number | null>(null)
  const [imageCredits, setImageCredits] = useState<number | null>(null)
  const [imageQuota, setImageQuota] = useState<number | null>(null)
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [isManaging, setIsManaging] = useState(false)

  const isPaid = plan !== 'free' && plan != null

  const groups = [
    {
      label: t('home.groupCreate'),
      benefit: t('home.groupCreateBenefit'),
      tools: [
        { icon: FileText, title: t('dashboard.toolListingTitle'), description: t('dashboard.toolListingDesc'), href: '/dashboard/listing' },
        { icon: ListChecks, title: t('dashboard.toolBulletsTitle'), description: t('dashboard.toolBulletsDesc'), href: '/dashboard/bullets' },
        { icon: BookOpen, title: t('dashboard.toolBrandStoryTitle'), description: t('dashboard.toolBrandStoryDesc'), href: '/dashboard/brand-story' },
        { icon: ImageIcon, title: t('dashboard.toolImagesTitle'), description: t('dashboard.toolImagesDesc'), href: '/dashboard/images' },
      ],
    },
    {
      label: t('home.groupOptimize'),
      benefit: t('home.groupOptimizeBenefit'),
      tools: [
        { icon: Wand2, title: t('dashboard.toolOptimizerTitle'), description: t('dashboard.toolOptimizerDesc'), href: '/dashboard/optimizer' },
        { icon: Search, title: t('dashboard.toolKeywordsTitle'), description: t('dashboard.toolKeywordsDesc'), href: '/dashboard/keywords' },
        { icon: Languages, title: t('dashboard.toolTranslateTitle'), description: t('dashboard.toolTranslateDesc'), href: '/dashboard/translate' },
        { icon: Crosshair, title: t('dashboard.toolCompetitorTitle'), description: t('dashboard.toolCompetitorDesc'), href: '/dashboard/competitor-analysis' },
      ],
    },
    {
      label: t('home.groupReply'),
      benefit: t('home.groupReplyBenefit'),
      tools: [
        { icon: MessageCircle, title: t('dashboard.toolMessagesTitle'), description: t('dashboard.toolMessagesDesc'), href: '/dashboard/messages' },
        { icon: Star, title: t('dashboard.toolReviewsTitle'), description: t('dashboard.toolReviewsDesc'), href: '/dashboard/reviews' },
        { icon: Mail, title: t('dashboard.toolEmailTitle'), description: t('dashboard.toolEmailDesc'), href: '/dashboard/email' },
        { icon: Megaphone, title: t('dashboard.toolAnnouncementTitle'), description: t('dashboard.toolAnnouncementDesc'), href: '/dashboard/announcement' },
      ],
    },
    {
      label: t('home.groupGrow'),
      benefit: t('home.groupGrowBenefit'),
      tools: [
        { icon: Share2, title: t('dashboard.toolSocialTitle'), description: t('dashboard.toolSocialDesc'), href: '/dashboard/social' },
        { icon: Target, title: t('dashboard.toolAdCopyTitle'), description: t('dashboard.toolAdCopyDesc'), href: '/dashboard/ad-copy' },
        { icon: DollarSign, title: t('dashboard.toolPricingTitle'), description: t('dashboard.toolPricingDesc'), href: '/dashboard/pricing' },
        { icon: Globe, title: t('dashboard.toolGlobalPricingTitle'), description: t('dashboard.toolGlobalPricingDesc'), href: '/dashboard/global-pricing' },
      ],
    },
  ]

  useEffect(() => {
    let cancelled = false
    fetch('/api/user/credits')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return
        setCredits(data.credits)
        setPlan(data.plan ?? null)
        setQuota(data.quota ?? null)
        setImageCredits(data.imageCredits ?? null)
        setImageQuota(data.imageQuota ?? null)
      })
      .catch((error) => console.error('Failed to fetch credits', error))
    return () => {
      cancelled = true
    }
  }, [])

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    try {
      const res = await fetch('/api/paddle/checkout', { method: 'POST' })
      if (!res.ok) throw new Error('checkout')
      const data = await res.json()
      window.location.href = data.url
    } catch {
      alert('Failed to initiate upgrade. Please try again.')
    } finally {
      setIsUpgrading(false)
    }
  }

  const handleManageBilling = async () => {
    setIsManaging(true)
    try {
      const res = await fetch('/api/paddle/portal', { method: 'POST' })
      if (!res.ok) throw new Error('portal')
      const data = await res.json()
      window.location.href = data.url
    } catch {
      alert('Failed to open billing portal. Please try again.')
    } finally {
      setIsManaging(false)
    }
  }

  const progressPercentage = credits !== null && quota ? Math.min((credits / quota) * 100, 100) : 0
  const imageProgressPercentage = imageCredits !== null && imageQuota ? Math.min((imageCredits / imageQuota) * 100, 100) : 0

  return (
    <div className="min-h-screen">
      <CinematicBackground theme="default" />
      <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
        <header className="mb-10">
          <p className="font-hand text-2xl text-primary">craftly</p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary">AI Seller Workspace</p>
          <h1 className="mt-2 font-display text-4xl tracking-tight text-foreground md:text-5xl">{t('dashboard.welcomeBack')}</h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Find what needs attention, review AI changes, and publish only when you are ready.
          </p>
        </header>

        <SellerActionQueue />

        <section className="relative mb-14 overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground md:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-black/15 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-primary-foreground/70">
                <Coins className="h-4 w-4" /> {t('dashboard.yourCredits')}
              </div>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="font-display text-5xl leading-none tracking-tight md:text-6xl">{credits !== null ? credits : '…'}</span>
                {quota !== null && <span className="text-lg text-primary-foreground/60">/ {quota}</span>}
              </div>
              <div className="mt-4 h-2 w-64 overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-white transition-all" style={{ width: `${progressPercentage}%` }} />
              </div>
              <div className="mt-6 flex items-center gap-3 text-primary-foreground">
                <ImageIcon className="h-4 w-4" />
                <span className="font-medium">Images</span>
                <span className="text-primary-foreground/70">{imageCredits ?? '…'} / {imageQuota ?? '…'}</span>
              </div>
              <div className="mt-2 h-2 w-64 overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-white transition-all" style={{ width: `${imageProgressPercentage}%` }} />
              </div>
            </div>

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
              <Button
                className="rounded-full bg-white px-6 py-3 font-semibold text-primary hover:bg-white/90"
                onClick={handleUpgrade}
                disabled={isUpgrading}
              >
                {isUpgrading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isUpgrading ? t('dashboard.processing') : t('dashboard.upgradeToPro')}
              </Button>
            )}
          </div>
        </section>

        <div className="mb-8 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Execution layer</p>
            <h2 className="mt-1 font-display text-2xl tracking-tight text-foreground">Workspace tools</h2>
          </div>
          <span className="max-w-md text-sm text-muted-foreground sm:text-right">
            Use these when an action needs deeper writing, optimization, communication or growth work.
          </span>
        </div>

        <div className="space-y-14">
          {groups.map((group) => (
            <section key={group.label}>
              <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-xl tracking-tight text-foreground">{group.label}</h3>
                <span className="text-sm text-muted-foreground">{group.benefit}</span>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {group.tools.map((tool) => (
                  <TiltCard
                    key={tool.href}
                    href={tool.href}
                    icon={<tool.icon className="h-6 w-6" />}
                    title={tool.title}
                    description={tool.description}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
