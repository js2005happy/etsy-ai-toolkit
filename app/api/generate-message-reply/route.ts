import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateMessageReply, type MessageReplyInput } from '@/lib/openai'

export async function POST(request: Request) {
  try {
    const supabase = createClient()

    // 1. Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Input Validation
    const body: MessageReplyInput = await request.json()
    if (!body.customer_message || !body.tone) {
      return NextResponse.json({ error: 'Missing required fields: customer_message and tone are required' }, { status: 400 })
    }

    // 3. Credit Check
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits_remaining, plan')
      .eq('id', user.id)
      .single()

    const isPro = profile?.plan === 'pro'

    if (profileError || !profile || (!isPro && profile.credits_remaining <= 0)) {
      return NextResponse.json({ error: 'Insufficient credits. Please upgrade your plan.' }, { status: 403 })
    }

    // 4. Generate Content
    const result = await generateMessageReply(body)

    // 5. Persistence & Credit Deduction (Pro 用户不限次数，跳过扣减)
    if (!isPro) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ credits_remaining: profile.credits_remaining - 1 })
        .eq('id', user.id)

      if (updateError) {
        console.error('Failed to update credits:', updateError)
      }
    }

    await supabase.from('generations').insert({
      user_id: user.id,
      tool_type: 'message',
      input_data: body,
      output_data: result,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
