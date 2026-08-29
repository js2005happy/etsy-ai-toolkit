'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useI18n } from '@/lib/i18n/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Mail, Coins, Crown, ArrowLeft, LogOut, KeyRound, Sparkles } from 'lucide-react'
import CinematicBackground from '@/components/cinematic/cinematic-background'
import Navbar from '@/components/shared/navbar'
import type { User } from '@supabase/supabase-js'

export default function AccountPage() {
  const router = useRouter()
  const { t } = useI18n()

  const [user, setUser] = useState<User | null>(null)
  const [credits, setCredits] = useState<number | null>(null)
  const [plan, setPlan] = useState<string | null>(null)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwMessage, setPwMessage] = useState<string | null>(null)
  const [pwError, setPwError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const [brandTone, setBrandTone] = useState('')
  const [brandKeywords, setBrandKeywords] = useState('')
  const [brandMessage, setBrandMessage] = useState<string | null>(null)
  const [brandError, setBrandError] = useState<string | null>(null)
  const [savingBrand, setSavingBrand] = useState(false)

  const isPaid = plan !== 'free' && plan != null
  const planLabel =
    plan === 'free'
      ? t('account.free')
      : plan === 'pro'
        ? t('account.pro')
        : plan
          ? plan.charAt(0).toUpperCase() + plan.slice(1)
          : '…'

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null))

    fetch('/api/user/credits')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setCredits(data.credits ?? null)
          setPlan(data.plan ?? null)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    const supabase = createClient()
    ;(async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('brand_tone, brand_keywords')
          .eq('id', user.id)
          .maybeSingle()
        if (!cancelled && data) {
          setBrandTone(data.brand_tone ?? '')
          setBrandKeywords(data.brand_keywords ?? '')
        }
      } catch {
        // ignore — column may not exist before the migration is applied
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwMessage(null)
    setPwError(null)

    if (newPassword.length < 6) {
      setPwError(t('account.passwordTooShort'))
      return
    }
    if (newPassword !== confirmPassword) {
      setPwError(t('account.passwordMismatch'))
      return
    }

    setUpdating(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) {
        setPwError(error.message)
      } else {
        setPwMessage(t('account.passwordUpdated'))
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch {
      setPwError(t('auth.unexpectedError'))
    } finally {
      setUpdating(false)
    }
  }

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault()
    setBrandMessage(null)
    setBrandError(null)
    if (!user) return
    setSavingBrand(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({ brand_tone: brandTone.trim() || null, brand_keywords: brandKeywords.trim() || null })
        .eq('id', user.id)
      if (error) setBrandError(error.message)
      else setBrandMessage(t('account.brandSaved'))
    } catch {
      setBrandError(t('auth.unexpectedError'))
    } finally {
      setSavingBrand(false)
    }
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : null

  return (
    <div className="min-h-screen">
      <CinematicBackground theme="default" />
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 py-14 md:py-16">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('account.backToDashboard')}
        </Link>

        <h1 className="mb-8 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          {t('account.title')}
        </h1>

        {/* Account info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('account.accountInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 rounded-lg border border-border bg-secondary p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-foreground">
                <Mail className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">{t('account.email')}</div>
                <div className="truncate text-sm font-medium text-foreground">
                  {user?.email ?? '…'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-secondary p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Crown className="h-4 w-4" />
                  {t('account.plan')}
                </div>
                <div className="mt-1 text-lg font-semibold text-foreground">
                  {planLabel}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-secondary p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Coins className="h-4 w-4" />
                  {t('account.credits')}
                </div>
                <div className="mt-1 text-lg font-semibold text-foreground">
                  {credits !== null ? credits : '…'}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-secondary p-4">
                <div className="text-xs text-muted-foreground">{t('account.memberSince')}</div>
                <div className="mt-1 text-lg font-semibold text-foreground">{memberSince ?? '…'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Brand preferences */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              {t('account.brandTitle')}
            </CardTitle>
            <CardDescription>{t('account.brandDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveBrand} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brandTone">{t('account.brandTone')}</Label>
                <Input
                  id="brandTone"
                  value={brandTone}
                  onChange={(e) => setBrandTone(e.target.value)}
                  placeholder={t('account.brandTonePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brandKeywords">{t('account.brandKeywords')}</Label>
                <Textarea
                  id="brandKeywords"
                  value={brandKeywords}
                  onChange={(e) => setBrandKeywords(e.target.value)}
                  placeholder={t('account.brandKeywordsPlaceholder')}
                  rows={3}
                />
              </div>
              {brandError && <p className="text-sm font-medium text-destructive">{brandError}</p>}
              {brandMessage && <p className="text-sm font-medium text-emerald-400">{brandMessage}</p>}
              <Button type="submit" disabled={savingBrand}>
                {savingBrand ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('dashboard.processing')}
                  </>
                ) : (
                  t('account.saveBrand')
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security / password */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              {t('account.security')}
            </CardTitle>
            <CardDescription>
              {t('account.changePasswordDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">
                  {t('account.newPassword')}
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {t('account.confirmPassword')}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              {pwError && <p className="text-sm font-medium text-destructive">{pwError}</p>}
              {pwMessage && <p className="text-sm font-medium text-emerald-400">{pwMessage}</p>}
              <Button type="submit" disabled={updating}>
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('dashboard.processing')}
                  </>
                ) : (
                  t('account.updatePassword')
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sign out */}
        <Card>
          <CardContent className="flex flex-col items-start justify-between gap-4 py-5 sm:flex-row sm:items-center">
            <div>
              <div className="text-sm font-medium text-foreground">{t('account.signOut')}</div>
              <div className="text-xs text-muted-foreground">{t('account.signOutDesc')}</div>
            </div>
            <Button variant="outline" onClick={handleSignOut} disabled={signingOut}>
              {signingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
              {t('account.signOut')}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
