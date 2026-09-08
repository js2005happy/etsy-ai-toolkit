'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useI18n } from '@/lib/i18n/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Loader2, Sparkles } from 'lucide-react'
import CinematicBackground from '@/components/cinematic/cinematic-background'
import GoogleAuthButton from '@/components/auth/google-auth-button'

type Mode = 'code' | 'password'

const benefits = [
  '10 free AI credits to explore the workspace',
  '3 image credits included on the free plan',
  'Review AI changes before anything is published',
  'Connect Etsy when you are ready — no card required',
]

export default function SignupPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [mode, setMode] = useState<Mode>('code')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const switchMode = (next: Mode) => {
    setMode(next)
    setError(null)
    setNotice(null)
    setCodeSent(false)
    setCode('')
  }

  const handleSendCode = async (e?: { preventDefault: () => void }) => {
    e?.preventDefault()
    setLoading(true)
    setError(null)
    setNotice(null)
    try {
      const supabase = createClient()
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      })
      if (otpError) setError(otpError.message)
      else {
        setCodeSent(true)
        setNotice(t('auth.codeSent'))
      }
    } catch {
      setError(t('auth.unexpectedError'))
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error: verifyError } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' })
      if (verifyError) setError(verifyError.message)
      else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError(t('auth.unexpectedError'))
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setNotice(null)
    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
      })
      if (authError) setError(authError.message)
      else setNotice(t('auth.registrationSuccess'))
    } catch {
      setError(t('auth.unexpectedError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <CinematicBackground />
      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <section className="hidden lg:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Craftly for Etsy sellers
          </div>
          <h1 className="mt-7 max-w-2xl text-5xl font-extrabold leading-[0.98] tracking-[-0.04em] text-foreground xl:text-6xl">
            Start selling.<br />
            <span className="text-primary">Spend less time rewriting.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Create your free workspace, review AI improvements to your listings and connect Etsy only when you are ready.
          </p>

          <div className="mt-8 space-y-4">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-400">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <p className="text-sm leading-relaxed text-foreground/90">{benefit}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 max-w-xl rounded-3xl border border-border bg-card/60 p-5 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Your workflow</p>
                <p className="mt-1 text-sm font-semibold text-foreground">Find issues → Review AI changes → Publish when ready</p>
              </div>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-400">You stay in control</span>
            </div>
          </div>
        </section>

        <div className="mx-auto w-full max-w-md">
          <div className="mb-5 text-center lg:hidden">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Craftly
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">Start selling, not rewriting.</h1>
            <p className="mt-2 text-sm text-muted-foreground">Free workspace · No card required</p>
          </div>

          <Card className="w-full border-border/80 bg-card/90 shadow-2xl backdrop-blur">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-semibold tracking-tight">{t('auth.createAccount')}</CardTitle>
              <CardDescription>Start free. No card required.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <GoogleAuthButton />
              <div className="flex items-center gap-3" aria-hidden="true">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">or email</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              {mode === 'password' ? (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('auth.email')}</Label>
                    <Input id="email" type="email" autoComplete="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('auth.password')}</Label>
                    <Input id="password" type="password" autoComplete="new-password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  {notice && <p className="text-sm font-medium text-primary">{notice}</p>}
                  {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
                  <Button className="w-full" type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? t('auth.creatingAccount') : t('auth.createAccountBtn')}
                  </Button>
                </form>
              ) : codeSent ? (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">{t('auth.enterCode')}</Label>
                    <Input id="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder={t('auth.codePlaceholder')} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} className="text-center text-lg tracking-[0.5em]" required />
                  </div>
                  {notice && <p className="text-sm font-medium text-primary">{notice}</p>}
                  {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
                  <Button className="w-full" type="submit" disabled={loading || code.length !== 6}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? t('auth.verifying') : t('auth.verifyCode')}
                  </Button>
                  <button type="button" onClick={() => handleSendCode()} disabled={loading} className="w-full text-center text-sm text-muted-foreground hover:text-foreground">
                    {t('auth.resendCode')}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSendCode} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('auth.email')}</Label>
                    <Input id="email" type="email" autoComplete="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
                  <Button className="w-full" type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? t('auth.sendingCode') : 'Continue with email'}
                  </Button>
                </form>
              )}

              {!codeSent && (
                <button type="button" onClick={() => switchMode(mode === 'code' ? 'password' : 'code')} className="w-full text-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                  {mode === 'code' ? 'Use a password instead' : 'Use an email code instead'}
                </button>
              )}

              <p className="text-center text-xs leading-relaxed text-muted-foreground">
                By continuing, you agree to Craftly&apos;s <a className="underline underline-offset-4 hover:text-foreground" href="/terms">Terms of Service</a> and <a className="underline underline-offset-4 hover:text-foreground" href="/privacy">Privacy Policy</a>.
              </p>
            </CardContent>

            <CardFooter className="flex justify-center text-sm text-muted-foreground">
              {t('auth.alreadyHave')}{' '}
              <a href="/login" className="ml-1 font-medium text-primary hover:underline">{t('auth.logIn')}</a>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
