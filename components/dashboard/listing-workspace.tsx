'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowRight, Check, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

type Listing = {
  id: number
  connection_id: number
  etsy_listing_id: number
  title: string
  description: string
  tags: string[]
  images: unknown[]
  state: string
  taxonomy_id: number | null
  price: number | null
  quantity: number | null
  health: { score: number; breakdown: Record<string, number>; issues: string[] }
}

type Version = {
  id: number
  source: string
  created_at: string
  snapshot?: Record<string, unknown>
}

type Suggestion = { title: string; description: string; tags: string[]; suggestions?: string }
type ReviewField = 'title' | 'description' | 'tags'
type ReviewFields = Record<ReviewField, boolean>
type SnapshotView = { title: string; description: string; tags: string[] }

const emptyAccepted: ReviewFields = { title: false, description: false, tags: false }

function snapshotView(snapshot?: Record<string, unknown>): SnapshotView {
  return {
    title: typeof snapshot?.title === 'string' ? snapshot.title : '',
    description: typeof snapshot?.description === 'string' ? snapshot.description : '',
    tags: Array.isArray(snapshot?.tags) ? snapshot.tags.filter((tag): tag is string => typeof tag === 'string') : [],
  }
}

function versionLabel(source: string) {
  if (source === 'import') return 'Imported from Etsy'
  if (source === 'ai') return 'Before AI suggestion'
  if (source === 'manual') return 'Before reviewed change'
  if (source === 'restore') return 'Before version restore'
  return 'Saved version'
}

function changedFields(snapshot: SnapshotView, current: Listing) {
  const changed: string[] = []
  if (snapshot.title !== current.title) changed.push('Title')
  if (snapshot.description !== current.description) changed.push('Description')
  if (JSON.stringify(snapshot.tags) !== JSON.stringify(current.tags)) changed.push('Tags')
  return changed
}

export default function ListingWorkspace({ listingId }: { listingId: string }) {
  const [listing, setListing] = useState<Listing | null>(null)
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null)
  const [accepted, setAccepted] = useState<ReviewFields>(emptyAccepted)
  const [versions, setVersions] = useState<Version[]>([])
  const [previewVersion, setPreviewVersion] = useState<Version | null>(null)
  const [loading, setLoading] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const load = useCallback(async () => {
    const [listingResponse, historyResponse] = await Promise.all([
      fetch(`/api/etsy/listings/${listingId}`),
      fetch(`/api/etsy/listings/${listingId}/versions`),
    ])
    const [listingData, history] = await Promise.all([
      listingResponse.json().catch(() => ({})),
      historyResponse.json().catch(() => ({})),
    ])
    setListing(listingData.listing ?? null)
    setVersions(Array.isArray(history.versions) ? history.versions : [])
  }, [listingId])

  useEffect(() => {
    load()
  }, [load])

  const optimize = async () => {
    if (!listing) return
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/optimize-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_title: listing.title,
          current_description: listing.description,
          current_tags: listing.tags.join(', '),
          platform: 'etsy',
          listing_id: listing.id,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMessage(data.error ?? 'Could not generate suggestions.')
        return
      }
      setSuggestion(data)
      setAccepted(emptyAccepted)
    } finally {
      setLoading(false)
      await load()
    }
  }

  const saveChangeSet = async () => {
    if (!listing || !suggestion) return
    if (!Object.values(accepted).some(Boolean)) {
      setMessage('Accept at least one changed field before saving this change set.')
      return
    }

    setLoading(true)
    setMessage(null)
    const reviewed = {
      title: accepted.title ? suggestion.title : listing.title,
      description: accepted.description ? suggestion.description : listing.description,
      tags: accepted.tags ? suggestion.tags : listing.tags,
    }

    try {
      const res = await fetch(`/api/etsy/listings/${listing.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewed),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setMessage('Accepted fields were saved to the Etsy draft. The listing is still a draft and has not been published.')
        setSuggestion(null)
        setAccepted(emptyAccepted)
        await load()
      } else {
        setMessage(data.error ?? 'Could not save this change set to the Etsy draft.')
      }
    } finally {
      setLoading(false)
    }
  }

  const restore = async (versionId: number) => {
    if (!listing) return
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/etsy/listings/${listing.id}/versions/${versionId}/restore`, { method: 'POST' })
      if (res.ok) {
        setMessage('Version restored inside Craftly. Sync it to the Etsy draft before publishing.')
        setPreviewVersion(null)
        setSuggestion(null)
        setAccepted(emptyAccepted)
        await load()
      } else {
        setMessage('Could not restore this version.')
      }
    } finally {
      setLoading(false)
    }
  }

  const syncRestoredDraft = async () => {
    if (!listing) return
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/etsy/listings/${listing.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: listing.title, description: listing.description, tags: listing.tags }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setMessage('Restored fields are now synced to the Etsy draft. Nothing has been published.')
        await load()
      } else {
        setMessage(data.error ?? 'Could not sync the restored version to the Etsy draft.')
      }
    } finally {
      setLoading(false)
    }
  }

  const publish = async () => {
    if (!listing || listing.state !== 'draft') return
    const confirmed = window.confirm(
      'Publish this Etsy draft now? Craftly will activate the current Etsy draft only after this confirmation. Make sure title, description, category, price, quantity, shipping and images are ready.'
    )
    if (!confirmed) return

    setPublishing(true)
    setMessage(null)
    try {
      const res = await fetch('/api/etsy/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connection_id: String(listing.connection_id),
          listing_id: listing.etsy_listing_id,
          confirm_publish: true,
        }),
      })
      const data = await res.json().catch(() => ({}))
      setMessage(res.ok ? 'Published to Etsy after your explicit confirmation.' : data.error ?? 'Could not publish this Etsy draft.')
      if (res.ok) await load()
    } catch {
      setMessage('Could not publish this Etsy draft. Please try again.')
    } finally {
      setPublishing(false)
    }
  }

  const acceptedCount = Object.values(accepted).filter(Boolean).length
  const restoreNeedsSync = listing?.state === 'draft' && versions[0]?.source === 'restore'
  const publishReady =
    listing?.state === 'draft' &&
    !!listing.taxonomy_id &&
    Number(listing.price) > 0 &&
    Number(listing.quantity) > 0 &&
    Array.isArray(listing.images) &&
    listing.images.length > 0

  const preview = useMemo(() => (previewVersion ? snapshotView(previewVersion.snapshot) : null), [previewVersion])

  if (!listing) {
    return <div className="mx-auto max-w-6xl p-8 text-muted-foreground">Loading listing…</div>
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow">AI Seller Workspace · Listing</p>
          <h1 className="mt-2 font-display text-4xl">Review changes before publishing</h1>
          <p className="mt-3 text-muted-foreground">
            Craftly Listing Health: {listing.health.score}/100 — a transparent checklist score, not an official Etsy ranking score.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide">Etsy state: {listing.state}</span>
          {listing.state === 'draft' && restoreNeedsSync && (
            <Button type="button" variant="outline" onClick={syncRestoredDraft} disabled={loading}>
              <RotateCcw className="mr-2 h-4 w-4" /> Sync restored version to Etsy draft
            </Button>
          )}
          {listing.state === 'draft' && (
            <Button type="button" onClick={publish} disabled={publishing || !publishReady || restoreNeedsSync}>
              {publishing ? 'Publishing…' : 'Publish reviewed draft to Etsy'}
            </Button>
          )}
          {listing.state === 'draft' && restoreNeedsSync && (
            <p className="max-w-md text-right text-xs text-amber-300">Publishing is blocked until the restored Craftly version is synced back to the Etsy draft.</p>
          )}
          {listing.state === 'draft' && !restoreNeedsSync && !publishReady && (
            <p className="max-w-md text-right text-xs text-muted-foreground">Confirm category, price, quantity and at least one image before publishing.</p>
          )}
        </div>
      </div>

      {message && <p role="status" className="mt-5 rounded-xl border bg-card p-3 text-sm">{message}</p>}

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-2xl border bg-card p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Change Set</p>
              <h2 className="mt-1 font-display text-2xl">AI suggests. You decide.</h2>
            </div>
            {suggestion ? (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setAccepted({ title: true, description: true, tags: true })}>Accept all</Button>
                <Button size="sm" variant="ghost" onClick={() => { setSuggestion(null); setAccepted(emptyAccepted) }}>Reject all</Button>
              </div>
            ) : (
              <Button onClick={optimize} disabled={loading}>
                <Sparkles className="mr-2 h-4 w-4" /> Generate change set
              </Button>
            )}
          </div>

          {!suggestion ? (
            <div className="mt-6 rounded-2xl border border-dashed p-8 text-center">
              <p className="font-medium text-foreground">No pending AI change set.</p>
              <p className="mt-2 text-sm text-muted-foreground">Generate suggestions to compare the current Etsy draft with Craftly&apos;s proposed title, description and tags.</p>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {suggestion.suggestions && (
                <p className="rounded-xl border bg-secondary/40 p-4 text-sm leading-relaxed text-muted-foreground">{suggestion.suggestions}</p>
              )}

              <ChangeField
                label="Title"
                before={listing.title}
                after={suggestion.title}
                accepted={accepted.title}
                onToggle={() => setAccepted((current) => ({ ...current, title: !current.title }))}
                onAfterChange={(value) => setSuggestion((current) => current ? { ...current, title: value } : current)}
              />
              <ChangeField
                label="Description"
                before={listing.description}
                after={suggestion.description}
                accepted={accepted.description}
                onToggle={() => setAccepted((current) => ({ ...current, description: !current.description }))}
                onAfterChange={(value) => setSuggestion((current) => current ? { ...current, description: value } : current)}
                tall
              />
              <ChangeField
                label="Tags"
                before={listing.tags.join(', ')}
                after={suggestion.tags.join(', ')}
                accepted={accepted.tags}
                onToggle={() => setAccepted((current) => ({ ...current, tags: !current.tags }))}
                onAfterChange={(value) => setSuggestion((current) => current ? { ...current, tags: value.split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 13) } : current)}
              />

              <div className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{acceptedCount} field{acceptedCount === 1 ? '' : 's'} selected</p>
                    <p className="mt-1 text-xs text-muted-foreground">Saving updates the Etsy draft only. It does not publish the listing.</p>
                  </div>
                </div>
                <Button onClick={saveChangeSet} disabled={loading || acceptedCount === 0}>
                  Save accepted fields to Etsy draft <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl border bg-card p-5 md:p-6">
          <h2 className="font-display text-xl">Listing Health</h2>
          <p className="mt-1 text-xs text-muted-foreground">Explainable completeness checks, not a marketplace ranking prediction.</p>
          {Object.entries(listing.health.breakdown).map(([label, score]) => (
            <div className="mt-4" key={label}>
              <div className="flex justify-between text-sm"><span className="capitalize">{label}</span><span>{score}/20</span></div>
              <div className="mt-2 h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${score * 5}%` }} /></div>
            </div>
          ))}
          <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            {listing.health.issues.length > 0 ? listing.health.issues.map((issue) => <li key={issue}>{issue}</li>) : <li>No checklist issues found.</li>}
          </ol>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border bg-card p-5 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Safety net</p>
            <h2 className="mt-1 font-display text-2xl">Version History</h2>
            <p className="mt-2 text-sm text-muted-foreground">Preview a snapshot before restoring it. A restore never publishes automatically.</p>
          </div>
          <span className="text-xs text-muted-foreground">{versions.length} saved snapshot{versions.length === 1 ? '' : 's'}</span>
        </div>

        {previewVersion && preview && (
          <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Restore preview</p>
                <p className="mt-1 font-medium text-foreground">{versionLabel(previewVersion.source)} · {new Date(previewVersion.created_at).toLocaleString()}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setPreviewVersion(null)}>Close preview</Button>
            </div>
            <VersionPreview current={listing} snapshot={preview} />
            <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">Restoring changes Craftly&apos;s local working copy first. For Etsy drafts, Craftly will block Publish until you explicitly sync the restored fields back to the Etsy draft.</p>
              <Button variant="outline" onClick={() => restore(previewVersion.id)} disabled={loading}>
                <RotateCcw className="mr-2 h-4 w-4" /> Restore this version
              </Button>
            </div>
          </div>
        )}

        {versions.length === 0 ? (
          <p className="mt-5 text-sm text-muted-foreground">No saved versions yet.</p>
        ) : (
          <div className="mt-5 divide-y">
            {versions.map((version) => {
              const snapshot = snapshotView(version.snapshot)
              const changes = changedFields(snapshot, listing)
              return (
                <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between" key={version.id}>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{versionLabel(version.source)}</p>
                      <span className="rounded-full border border-border px-2 py-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">{version.source}</span>
                    </div>
                    <time className="mt-1 block text-xs text-muted-foreground">{new Date(version.created_at).toLocaleString()}</time>
                    <p className="mt-2 text-xs text-muted-foreground">{changes.length ? `Differs in: ${changes.join(', ')}` : 'Matches the current title, description and tags.'}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setPreviewVersion(version)}>Preview</Button>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function ChangeField({
  label,
  before,
  after,
  accepted,
  onToggle,
  onAfterChange,
  tall = false,
}: {
  label: string
  before: string
  after: string
  accepted: boolean
  onToggle: () => void
  onAfterChange: (value: string) => void
  tall?: boolean
}) {
  const changed = before.trim() !== after.trim()
  return (
    <div className={`rounded-2xl border p-4 ${accepted ? 'border-primary/40 bg-primary/5' : 'border-border'}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
          <p className="mt-1 text-xs text-muted-foreground">{changed ? 'Craftly proposes a change.' : 'No material change proposed.'}</p>
        </div>
        <Button size="sm" type="button" variant={accepted ? 'default' : 'outline'} onClick={onToggle} disabled={!changed}>
          {accepted && <Check className="mr-1.5 h-4 w-4" />}{accepted ? 'Accepted' : 'Accept change'}
        </Button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Before</p>
          <div className={`${tall ? 'min-h-44' : 'min-h-20'} whitespace-pre-wrap rounded-xl border bg-background/50 p-3 text-sm text-muted-foreground`}>{before || 'Empty'}</div>
        </div>
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-primary">After · editable</p>
          <Textarea className={tall ? 'min-h-44' : 'min-h-20'} value={after} onChange={(event) => onAfterChange(event.target.value)} />
        </div>
      </div>
    </div>
  )
}

function VersionPreview({ current, snapshot }: { current: Listing; snapshot: SnapshotView }) {
  const rows = [
    { label: 'Title', current: current.title, snapshot: snapshot.title },
    { label: 'Description', current: current.description, snapshot: snapshot.description },
    { label: 'Tags', current: current.tags.join(', '), snapshot: snapshot.tags.join(', ') },
  ]
  return (
    <div className="mt-4 space-y-3">
      {rows.map((row) => (
        <div className="grid gap-3 md:grid-cols-2" key={row.label}>
          <div className="rounded-xl border bg-background/40 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Current · {row.label}</p>
            <p className="mt-2 max-h-36 overflow-auto whitespace-pre-wrap text-sm text-muted-foreground">{row.current || 'Empty'}</p>
          </div>
          <div className="rounded-xl border border-primary/20 bg-background/60 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">Restore · {row.label}</p>
            <p className="mt-2 max-h-36 overflow-auto whitespace-pre-wrap text-sm text-foreground">{row.snapshot || 'Empty'}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
