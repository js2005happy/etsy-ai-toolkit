import { NextResponse } from 'next/server'
import { EventName } from '@paddle/paddle-node-sdk'
import { getPaddle, getPaddleWebhookSecret } from '@/lib/paddle'
import {
  handleCustomer,
  handleSubscription,
  handleTransactionCompleted,
} from '@/lib/billing/webhook-handlers'

export async function POST(request: Request) {
  const paddle = getPaddle()

  // Read the RAW body — a JSON-parsed body fails HMAC verification.
  const rawBody = await request.text()
  const signature = request.headers.get('Paddle-Signature') || ''

  let event
  try {
    event = await paddle.webhooks.unmarshal(
      rawBody,
      getPaddleWebhookSecret(),
      signature
    )
  } catch (err: any) {
    // Never return 2xx on a failed verification — that would tell Paddle the
    // delivery succeeded and stop its retries.
    console.error('Paddle webhook signature verification failed:', err?.message)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  try {
    switch (event.eventType) {
      case EventName.CustomerCreated:
      case EventName.CustomerUpdated:
        await handleCustomer(event.data)
        break

      case EventName.SubscriptionCreated:
      case EventName.SubscriptionActivated:
      case EventName.SubscriptionUpdated:
      case EventName.SubscriptionCanceled:
      case EventName.SubscriptionPastDue:
      case EventName.SubscriptionPaused:
      case EventName.SubscriptionResumed:
      case EventName.SubscriptionTrialing:
        await handleSubscription(event.data)
        break

      case EventName.TransactionCompleted:
        await handleTransactionCompleted(event.data)
        break

      default:
        // Unhandled event type — safely ignore.
        break
    }
  } catch (err: any) {
    // Return 500 so Paddle retries the delivery; handlers are idempotent.
    console.error('Paddle webhook handler error:', err)
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
