import { Paddle, Environment } from '@paddle/paddle-node-sdk'

let paddleClient: Paddle | null = null

type PaddleEnvironmentName = 'production' | 'sandbox'

function getConfiguredEnvironment(): PaddleEnvironmentName {
  const env = process.env.PADDLE_ENV
  if (env !== 'production' && env !== 'sandbox') {
    throw new Error('PADDLE_ENV must be set to "production" or "sandbox"')
  }

  const publicEnv = process.env.NEXT_PUBLIC_PADDLE_ENV
  if (publicEnv && publicEnv !== env) {
    throw new Error(
      `Paddle environment mismatch: PADDLE_ENV=${env}, NEXT_PUBLIC_PADDLE_ENV=${publicEnv}`
    )
  }

  return env
}

export function getPaddle(): Paddle {
  if (!paddleClient) {
    const apiKey = process.env.PADDLE_API_KEY
    if (!apiKey) throw new Error('PADDLE_API_KEY is not configured')

    const env = getConfiguredEnvironment()
    paddleClient = new Paddle(apiKey, {
      environment:
        env === 'sandbox' ? Environment.sandbox : Environment.production,
    })
  }
  return paddleClient
}

export function getPaddleWebhookSecret(): string {
  const secret = process.env.PADDLE_WEBHOOK_SECRET
  if (!secret) throw new Error('PADDLE_WEBHOOK_SECRET is not configured')
  return secret
}
