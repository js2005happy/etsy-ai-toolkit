import { NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

function generateMcpKey(): string {
  return 'mcp_' + randomBytes(24).toString('hex')
}

// GET — return the caller's key, generating one on first use.
export async function GET() {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = createServiceClient()
    const { data: profile } = await service
      .from('profiles')
      .select('mcp_api_key')
      .eq('id', user.id)
      .maybeSingle()

    let key = profile?.mcp_api_key
    if (!key) {
      key = generateMcpKey()
      await service.from('profiles').update({ mcp_api_key: key }).eq('id', user.id)
    }

    return NextResponse.json({ mcp_api_key: key })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

// POST — reset the key (invalidates any previously-issued key).
export async function POST() {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const key = generateMcpKey()
    const service = createServiceClient()
    await service.from('profiles').update({ mcp_api_key: key }).eq('id', user.id)

    return NextResponse.json({ mcp_api_key: key })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
