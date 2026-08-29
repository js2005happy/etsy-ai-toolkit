import { Resend } from 'resend'

const FROM = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  return new Resend(apiKey)
}

async function send(to: string, subject: string, html: string): Promise<void> {
  const resend = getResend()
  if (!resend) {
    console.warn('RESEND_API_KEY not set — skipping email to', to)
    return
  }
  try {
    const { error } = await resend.emails.send({ from: FROM, to, subject, html })
    if (error) console.error('Resend send error:', error.message)
  } catch (err: any) {
    console.error('Resend send failed:', err?.message)
  }
}

function shell(inner: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0a0a0f;color:#e5e5e5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#14141c;border:1px solid #26262f;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:32px;">
                <div style="font-size:20px;font-weight:700;color:#ffffff;margin-bottom:20px;">Etsy AI Toolkit</div>
                ${inner}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid #26262f;color:#6b6b76;font-size:12px;line-height:1.6;">
                You're receiving this because you signed up for Etsy AI Toolkit.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;margin:24px 0 8px;padding:12px 24px;background:#ff8a52;color:#1a1a1a;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">${label}</a>`
}

export async function sendWelcomeEmail(to: string): Promise<void> {
  const html = shell(`
    <p style="margin:0 0 16px;font-size:15px;color:#e5e5e5;">Welcome aboard — your free account is ready with <strong style="color:#ffffff;">10 credits</strong> to try every tool.</p>
    <p style="margin:0;font-size:14px;color:#9a9aa5;line-height:1.6;">Generate listings, replies, keywords, translations and more. When you're ready for more volume and image generation, upgrade to Pro or Scale.</p>
    ${button('https://etsy-ai-toolkit.vercel.app/dashboard', 'Open your dashboard')}
  `)
  await send(to, 'Welcome to Etsy AI Toolkit', html)
}

export async function sendSubscriptionActiveEmail(to: string, tier: string): Promise<void> {
  const label = tier.charAt(0).toUpperCase() + tier.slice(1)
  const html = shell(`
    <p style="margin:0 0 16px;font-size:15px;color:#e5e5e5;">Your <strong style="color:#ffffff;">${label}</strong> plan is now active. 🎉</p>
    <p style="margin:0;font-size:14px;color:#9a9aa5;line-height:1.6;">Your credits and image quota have been loaded to your account and are ready to use.</p>
    ${button('https://etsy-ai-toolkit.vercel.app/dashboard', 'Start generating')}
  `)
  await send(to, `Your ${label} plan is active`, html)
}

export async function sendSubscriptionCanceledEmail(to: string): Promise<void> {
  const html = shell(`
    <p style="margin:0 0 16px;font-size:15px;color:#e5e5e5;">Your subscription has been <strong style="color:#ffffff;">canceled</strong>.</p>
    <p style="margin:0;font-size:14px;color:#9a9aa5;line-height:1.6;">Your account is back on the free tier. You can resubscribe at any time — your settings and history are safe.</p>
    ${button('https://etsy-ai-toolkit.vercel.app/pricing', 'View plans')}
  `)
  await send(to, 'Your subscription was canceled', html)
}
