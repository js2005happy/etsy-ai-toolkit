import { NextResponse } from 'next/server'
import { generateListing } from '@/lib/openai'

const DAILY_LIMIT = 3
const DESCRIPTION_PREVIEW_CHARS = 260
const MAX_DESCRIPTION = 500
const hits = new Map<string, { day: string; count: number }>()

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function allowRequest(ip: string): boolean {
  const day = today()
  const record = hits.get(ip)
  if (!record || record.day !== day) {
    hits.set(ip, { day, count: 1 })
    return true
  }
  if (record.count >= DAILY_LIMIT) return false
  record.count += 1
  return true
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
    if (!allowRequest(ip)) {
      return NextResponse.json(
        {
          error: "You've used all 3 free generations for today. Create a free account for 10 credits — no card needed.",
          limitReached: true,
        },
        { status: 429 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const description = String(body.description || '').trim().slice(0, MAX_DESCRIPTION)
    const material = String(body.material || '').trim().slice(0, 80)
    const style = String(body.style || '').trim().slice(0, 80)
    const targetBuyer = String(body.target_buyer || '').trim().slice(0, 100)
    const occasion = String(body.occasion || '').trim().slice(0, 100)

    if (description.length < 3) {
      return NextResponse.json({ error: 'Describe your product in a few words.' }, { status: 400 })
    }

    const context = [
      targetBuyer && `for ${targetBuyer}`,
      occasion && `for ${occasion}`,
    ].filter(Boolean).join(', ')

    const result = await generateListing({
      product_name: description.slice(0, 120),
      product_type: context ? `handmade product ${context}`.slice(0, 160) : 'handmade product',
      material: material || 'not specified',
      style: style || 'handmade',
      platform: 'etsy',
    })

    const truncated = result.description.length > DESCRIPTION_PREVIEW_CHARS
    const descriptionPreview = truncated
      ? `${result.description.slice(0, DESCRIPTION_PREVIEW_CHARS).trimEnd()}…`
      : result.description

    return NextResponse.json({
      title: result.title,
      tags: result.tags,
      description_preview: descriptionPreview,
      truncated,
    })
  } catch (error) {
    console.error('free-title API error:', error)
    return NextResponse.json({ error: "We couldn't generate Etsy titles right now. Please try again." }, { status: 500 })
  }
}
