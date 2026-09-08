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
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      })
      if (oauthError) {
        console.error('Google OAuth start failed:', oauthError)
        setError('Google sign-in is unavailable right now. You can continue with email instead.')
        setLoading(false)
      }
    } catch (oauthError) {
      console.error('Google OAuth start failed:', oauthError)
      setError('Google sign-in is unavailable right now. You can continue with email instead.')
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
