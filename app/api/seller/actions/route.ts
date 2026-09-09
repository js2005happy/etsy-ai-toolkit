import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { scoreListing } from '@/lib/listing-health'

type Priority = 'high' | 'medium' | 'low'
type ActionKind = 'sync' | 'restore-sync' | 'publish' | 'draft' | 'health'

type SellerAction = {
  id: string
  kind: ActionKind
  priority: Priority
  title: string
  reason: string
  href: string
  listingId?: number
  healthScore?: number
}

const priorityRank: Record<Priority, number> = { high: 0, medium: 1, low: 2 }

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [listingsResult, jobsResult, versionsResult] = await Promise.all([
    supabase
      .from('etsy_listings')
      .select('id, title, description, tags, images, attributes, state, price, quantity, taxonomy_id, synced_at')
      .eq('user_id', user.id)
      .order('synced_at', { ascending: false })
      .limit(150),
    supabase
      .from('etsy_sync_jobs')
      .select('id, status, error_summary, created_at, completed_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('etsy_listing_versions')
      .select('listing_id, source, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(300),
  ])

  if (listingsResult.error) {
    return NextResponse.json({ error: 'Unable to build your seller action queue.' }, { status: 500 })
  }

  const listings = listingsResult.data ?? []
  const syncJobs = jobsResult.error ? [] : jobsResult.data ?? []
  const versions = versionsResult.error ? [] : versionsResult.data ?? []

  const latestVersionSource = new Map<number, string>()
  for (const version of versions) {
    const listingId = Number(version.listing_id)
    if (Number.isSafeInteger(listingId) && !latestVersionSource.has(listingId)) {
      latestVersionSource.set(listingId, version.source)
    }
  }

  const actions: SellerAction[] = []
  const latestProblemJob = syncJobs.find((job) => job.status === 'failed' || job.status === 'partial')
  if (latestProblemJob) {
    actions.push({
      id: `sync-${latestProblemJob.id}`,
      kind: 'sync',
      priority: 'high',
      title: latestProblemJob.status === 'failed' ? 'Etsy sync needs attention' : 'Etsy sync completed partially',
      reason: latestProblemJob.error_summary || 'Some shop data may be out of date. Review the sync before making listing decisions.',
      href: '/dashboard/shop',
    })
  }

  let lowHealthCount = 0
  let draftCount = 0

  for (const listing of listings) {
    const listingId = Number(listing.id)
    if (!Number.isSafeInteger(listingId)) continue

    const title = typeof listing.title === 'string' && listing.title.trim() ? listing.title.trim() : 'Untitled listing'
    const health = scoreListing(listing)
    const isDraft = listing.state === 'draft'
    const hasImages = Array.isArray(listing.images) && listing.images.length > 0
    const publishReady =
      isDraft &&
      !!listing.taxonomy_id &&
      Number(listing.price) > 0 &&
      Number(listing.quantity) > 0 &&
      hasImages
    const latestSource = latestVersionSource.get(listingId)

    if (health.score < 70) lowHealthCount += 1
    if (isDraft) draftCount += 1

    if (isDraft && latestSource === 'restore') {
      actions.push({
        id: `restore-${listingId}`,
        kind: 'restore-sync',
        priority: 'high',
        title: `Sync restored version: ${title}`,
        reason: 'A previous Craftly version was restored locally. Sync the restored fields to the Etsy draft before publishing.',
        href: `/dashboard/listings/${listingId}`,
        listingId,
        healthScore: health.score,
      })
      continue
    }

    if (publishReady && latestSource === 'manual') {
      actions.push({
        id: `publish-${listingId}`,
        kind: 'publish',
        priority: 'high',
        title: `Reviewed draft is ready: ${title}`,
        reason: 'Reviewed fields are already saved to the Etsy draft and the required publish fields are present. Publishing still requires your confirmation.',
        href: `/dashboard/listings/${listingId}`,
        listingId,
        healthScore: health.score,
      })
      continue
    }

    if (isDraft && !publishReady) {
      const missing: string[] = []
      if (!listing.taxonomy_id) missing.push('category')
      if (!(Number(listing.price) > 0)) missing.push('price')
      if (!(Number(listing.quantity) > 0)) missing.push('quantity')
      if (!hasImages) missing.push('image')
      actions.push({
        id: `draft-${listingId}`,
        kind: 'draft',
        priority: 'medium',
        title: `Finish draft: ${title}`,
        reason: `Missing ${missing.join(', ')}. Complete these fields before Craftly will allow publishing.`,
        href: `/dashboard/listings/${listingId}`,
        listingId,
        healthScore: health.score,
      })
      continue
    }

    if (health.score < 70 || health.issues.length >= 3) {
      actions.push({
        id: `health-${listingId}`,
        kind: 'health',
        priority: health.score < 55 ? 'medium' : 'low',
        title: `Review listing: ${title}`,
        reason: `${health.issues.slice(0, 2).join(' ')} Craftly Health ${health.score}/100 is a transparent checklist score, not an Etsy ranking score.`,
        href: `/dashboard/listings/${listingId}`,
        listingId,
        healthScore: health.score,
      })
    }
  }

  actions.sort((a, b) => {
    const byPriority = priorityRank[a.priority] - priorityRank[b.priority]
    if (byPriority !== 0) return byPriority
    return (a.healthScore ?? 101) - (b.healthScore ?? 101)
  })

  return NextResponse.json({
    actions: actions.slice(0, 8),
    summary: {
      totalListings: listings.length,
      drafts: draftCount,
      lowHealth: lowHealthCount,
      needsAttention: actions.length,
    },
  })
}
