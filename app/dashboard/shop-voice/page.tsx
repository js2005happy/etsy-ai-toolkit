'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Loader2, Save, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import CinematicBackground from '@/components/cinematic/cinematic-background'
import { createClient } from '@/lib/supabase/client'
import {
  EMPTY_SHOP_VOICE,
  parseShopVoice,
  serializeShopVoice,
  shopVoiceCompletion,
  type ShopVoiceProfile,
} from '@/lib/shop-voice'

export default function ShopVoicePage() {
  const [profile, setProfile] = useState<ShopVoiceProfile>({ ...EMPTY_SHOP_VOICE })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const completion = useMemo(() => shopVoiceCompletion(profile), [profile])

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()
    ;(async () => {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) {
        if (!cancelled) {
          setError('Sign in to manage your Shop Voice.')
          setLoading(false)
        }
        return
      }
      const { data, error: loadError } = await supabase
        .from('profiles')
        .select('brand_tone, brand_keywords')
        .eq('id', auth.user.id)
        .maybeSingle()
      if (cancelled) return
      if (loadError) setError(loadError.message)
      else setProfile(parseShopVoice(data?.brand_tone, data?.brand_keywords))
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const setField = (field: keyof ShopVoiceProfile, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }))
  }

  const save = async () => {
    setSaving(true)
    setMessage(null)
    setError(null)
    const supabase = createClient()
    try {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) throw new Error('Sign in to save your Shop Voice.')
      const stored = serializeShopVoice(profile)
      const { error: saveError } = await supabase
        .from('profiles')
        .update({ brand_tone: stored.brandTone, brand_keywords: stored.brandKeywords })
        .eq('id', auth.user.id)
      if (saveError) throw saveError
      setMessage('Shop Voice saved. Craftly will apply it to supported generation tools.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save Shop Voice.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-4xl px-5 py-16 text-muted-foreground">Loading Shop Voice…</div>
  }

  return (
    <div className="min-h-screen">
      <CinematicBackground theme="default" />
      <main className="mx-auto max-w-5xl px-5 py-12 md:py-16">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to workspace
        </Link>

        <div className="mt-6 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Shop Voice Profile</p>
            <h1 className="mt-2 font-display text-4xl tracking-tight md:text-5xl">Teach Craftly how your shop sounds.</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Save the tone, vocabulary, rules and story that should stay consistent across listings, buyer replies, social posts, ads and email.
            </p>
          </div>
          <div className="min-w-48 rounded-2xl border bg-card p-4">
            <div className="flex items-center justify-between text-sm"><span>Profile completeness</span><strong>{completion}%</strong></div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${completion}%` }} /></div>
          </div>
        </div>

        <Card className="mt-8 border-primary/20 bg-primary/5">
          <CardContent className="flex gap-3 pt-6">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-medium">One voice across the workspace</p>
              <p className="mt-1 text-sm text-muted-foreground">Existing Craftly generation routes already read your saved brand preferences. This profile makes those instructions richer without changing how you work.</p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Tone & audience</CardTitle>
              <CardDescription>Define how the shop should sound and who the writing is for.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="toneTraits">Tone traits</Label>
                <Input id="toneTraits" value={profile.toneTraits} onChange={(e) => setField('toneTraits', e.target.value)} placeholder="Warm, confident, handmade, concise" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="audience">Audience</Label>
                <Textarea id="audience" value={profile.audience} onChange={(e) => setField('audience', e.target.value)} placeholder="Gift buyers who value small-batch, thoughtful products" rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredVocabulary">Preferred vocabulary / phrases</Label>
                <Textarea id="preferredVocabulary" value={profile.preferredVocabulary} onChange={(e) => setField('preferredVocabulary', e.target.value)} placeholder="small-batch, made to order, carefully packed" rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wordsToAvoid">Words to avoid</Label>
                <Textarea id="wordsToAvoid" value={profile.wordsToAvoid} onChange={(e) => setField('wordsToAvoid', e.target.value)} placeholder="cheap, perfect, guaranteed, luxury" rows={3} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product & formatting rules</CardTitle>
              <CardDescription>Capture conventions that should not drift between different AI tools.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="productConventions">Product conventions</Label>
                <Textarea id="productConventions" value={profile.productConventions} onChange={(e) => setField('productConventions', e.target.value)} placeholder="Always list materials before dimensions. Use inches and centimeters. Never invent care instructions." rows={5} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="formattingPreferences">Formatting preferences</Label>
                <Textarea id="formattingPreferences" value={profile.formattingPreferences} onChange={(e) => setField('formattingPreferences', e.target.value)} placeholder="Short paragraphs. No emoji in listings. Bullets for dimensions and care." rows={5} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Brand story</CardTitle>
              <CardDescription>Give Craftly the context behind the shop so outputs feel specific rather than generic.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea value={profile.brandStory} onChange={(e) => setField('brandStory', e.target.value)} placeholder="Why the shop exists, where products are made, what matters to the brand…" rows={9} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reference sample</CardTitle>
              <CardDescription>Paste a paragraph that already sounds exactly like your brand. Craftly should imitate the style, not copy the wording.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea value={profile.sampleCopy} onChange={(e) => setField('sampleCopy', e.target.value)} placeholder="Paste a listing paragraph, about-section excerpt or customer note…" rows={9} />
            </CardContent>
          </Card>
        </div>

        {error && <p className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</p>}
        {message && <p className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300"><CheckCircle2 className="h-4 w-4" />{message}</p>}

        <div className="mt-8 flex flex-col gap-3 rounded-2xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm text-muted-foreground">You stay in control. Shop Voice is editable at any time and never publishes anything to Etsy by itself.</p>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Shop Voice
          </Button>
        </div>
      </main>
    </div>
  )
}
