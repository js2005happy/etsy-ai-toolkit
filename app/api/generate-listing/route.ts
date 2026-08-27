import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateListing, type ListingInput } from '@/lib/openai'

export async function POST(request: Request) {
  try {
    const supabase = createClient()

    // 1. Auth Check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Input Validation
    const body: ListingInput = await request.json()
    if (!body.product_name || !body.product_type || !body.material || !body.style) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 3. Credit Check
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits_remaining')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.credits_remaining <= 0) {
      return NextResponse.json({ error: 'Insufficient credits. Please upgrade your plan.' }, { status: 403 })
    }

    // 4. Generate Content
    const result = await generateListing(body)

    // 5. Persistence & Credit Deduction
    // Wrap in a transaction-like sequence (though Supabase is REST)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits_remaining: profile.credits_remaining - 1 })
      .eq('id', user.id)

    if (updateError) {
      console.error('Failed to update credits:', updateError)
      // We continue because the content is already generated, but log it.
    }

    await supabase.from('generations').insert({
      user_id: user.id,
      tool_type: 'listing',
      input_data: body,
      output_data: result,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
