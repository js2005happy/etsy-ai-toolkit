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

type Mode = 'code' | 'password'

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

  const switchMode = (m: Mode) => {
    setMode(m)
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
        options: {
          shouldCreateUser: true,
        },
      })

      if (otpError) {
        setError(otpError.message)
      } else {
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
    setNotice(null)

    try {
      const supabase = createClient()
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
      })

      if (verifyError) {
        setError(verifyError.message)
      } else {
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
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      })

      if (authError) {
        setError(authError.message)
      } else {
        setNotice(t('auth.registrationSuccess'))
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
          <CardTitle className="text-2xl font-semibold tracking-tight">{t('auth.createAccount')}</CardTitle>
          <CardDescription>
            {mode === 'code' ? t('auth.emailCodeSub') : t('auth.signupSub')}
          </CardDescription>
        </CardHeader>

        <div className="mx-6 mb-2 flex rounded-lg border border-border p-1">
          <button
            type="button"
            onClick={() => switchMode('code')}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
              mode === 'code'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('auth.emailCode')}
          </button>
          <button
            type="button"
            onClick={() => switchMode('password')}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
              mode === 'password'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('auth.password')}
          </button>
        </div>

        <CardContent>
          {mode === 'password' ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {notice && <p className="text-sm font-medium text-primary">{notice}</p>}
              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('auth.creatingAccount')}
                  </>
                ) : (
                  t('auth.createAccountBtn')
                )}
              </Button>
            </form>
          ) : codeSent ? (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">{t('auth.enterCode')}</Label>
                <Input
                  id="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder={t('auth.codePlaceholder')}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-lg tracking-[0.5em]"
                  required
                />
              </div>
              {notice && <p className="text-sm font-medium text-primary">{notice}</p>}
              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
              <Button className="w-full" type="submit" disabled={loading || code.length !== 6}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('auth.verifying')}
                  </>
                ) : (
                  t('auth.verifyCode')
                )}
              </Button>
              <button
                type="button"
                onClick={() => handleSendCode()}
                disabled={loading}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
              >
                {t('auth.resendCode')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('auth.sendingCode')}
                  </>
                ) : (
                  t('auth.sendCode')
                )}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          {t('auth.alreadyHave')}{' '}
          <a href="/login" className="ml-1 text-primary hover:underline">
            {t('auth.logIn')}
          </a>
        </CardFooter>
      </Card>
    </div>
  )
}
