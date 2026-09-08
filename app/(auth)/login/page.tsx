'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useI18n } from '@/lib/i18n/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import CinematicBackground from '@/components/cinematic/cinematic-background'
import GoogleAuthButton from '@/components/auth/google-auth-button'

type Mode = 'code' | 'password'

export default function LoginPage() {
  const router = useRouter()
  const { t } = useI18n()
  const [mode, setMode] = useState<Mode>('password')
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
        options: { shouldCreateUser: false },
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
    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) setError(authError.message)
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

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <CinematicBackground />
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold tracking-tight">Welcome back</CardTitle>
          <CardDescription>Sign in to continue to your Craftly workspace.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <GoogleAuthButton label="Continue with Google" />
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
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <a href="/forgot-password" className="text-xs font-medium text-primary underline-offset-4 hover:underline">Forgot password?</a>
                </div>
                <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
              <Button className="w-full" type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? t('auth.loggingIn') : t('auth.signIn')}
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
              <button type="button" onClick={() => handleSendCode()} disabled={loading} className="w-full text-center text-sm text-muted-foreground hover:text-foreground">{t('auth.resendCode')}</button>
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
                {loading ? t('auth.sendingCode') : 'Send sign-in code'}
              </Button>
            </form>
          )}

          {!codeSent && (
            <button type="button" onClick={() => switchMode(mode === 'password' ? 'code' : 'password')} className="w-full text-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
              {mode === 'password' ? 'Use an email code instead' : 'Use your password instead'}
            </button>
          )}
        </CardContent>

        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          {t('auth.noAccount')}{' '}
          <a href="/signup" className="ml-1 font-medium text-primary hover:underline">{t('auth.signUp')}</a>
        </CardFooter>
      </Card>
    </div>
  )
}
