import { NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { tierQuota } from '@/lib/pricing'

export async function GET(request: Request) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { credits: quota, images: imageQuota } = tierQuota(auth.tier)

    return NextResponse.json({
      credits: auth.credits,
      plan: auth.plan,
      quota,
      imageCredits: auth.imageCredits,
      imageQuota,
      hasImageAccess: auth.hasImageAccess,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
