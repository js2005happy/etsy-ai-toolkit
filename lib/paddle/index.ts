import { Paddle, Environment } from '@paddle/paddle-node-sdk'

let paddleClient: Paddle | null = null

export function getPaddle(): Paddle {
  if (!paddleClient) {
    paddleClient = new Paddle(process.env.PADDLE_API_KEY!, {
      environment:
        process.env.PADDLE_ENV === 'sandbox'
          ? Environment.sandbox
          : Environment.production,
    })
  }
  return paddleClient
}

export function getPaddleWebhookSecret(): string {
  return process.env.PADDLE_WEBHOOK_SECRET || ''
}
