'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export default function GoogleAuthButton({ label = 'Continue with Google' }: { label?: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogle = async () => {
    setLoading(true)
    setError(null)
    try {
      const diagnosticResponse = await fetch('/api/auth/google/diagnostics', { cache: 'no-store' })
      const diagnostic = await diagnosticResponse.json().catch(() => null)
      if (!diagnosticResponse.ok || !diagnostic?.ok) {
        console.error('Google OAuth configuration preflight failed:', diagnostic)
        setError('Google 登录配置暂时不可用。我们已经检测到 OAuth 配置异常，请稍后重试或先使用邮箱登录。')
        setLoading(false)
        return
      }

      const supabase = createClient()
      const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      })

      if (oauthError || !data?.url) {
        console.error('Google OAuth start failed:', oauthError)
        setError('Google 登录暂时不可用，请稍后重试或先使用邮箱登录。')
        setLoading(false)
        return
      }

      window.location.assign(data.url)
    } catch (oauthError) {
      console.error('Google OAuth start failed:', oauthError)
      setError('Google 登录暂时不可用，请稍后重试或先使用邮箱登录。')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" className="w-full" onClick={handleGoogle} disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {label}
      </Button>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
