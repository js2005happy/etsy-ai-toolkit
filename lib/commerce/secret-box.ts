import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

const VERSION = 'v1'

function key(): Buffer {
  const raw = process.env.COMMERCE_CREDENTIALS_KEY
  if (!raw || raw.length < 24) {
    throw new Error('COMMERCE_CREDENTIALS_KEY must be configured with a strong server-only secret')
  }
  return createHash('sha256').update(raw).digest()
}

export function encryptCommerceSecret(value: unknown): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key(), iv)
  const plaintext = Buffer.from(JSON.stringify(value), 'utf8')
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()])
  const tag = cipher.getAuthTag()
  return [VERSION, iv.toString('base64url'), tag.toString('base64url'), ciphertext.toString('base64url')].join('.')
}

export function decryptCommerceSecret<T = any>(payload: string): T {
  const [version, ivRaw, tagRaw, cipherRaw] = String(payload || '').split('.')
  if (version !== VERSION || !ivRaw || !tagRaw || !cipherRaw) throw new Error('Invalid encrypted commerce credential')
  const decipher = createDecipheriv('aes-256-gcm', key(), Buffer.from(ivRaw, 'base64url'))
  decipher.setAuthTag(Buffer.from(tagRaw, 'base64url'))
  const plaintext = Buffer.concat([decipher.update(Buffer.from(cipherRaw, 'base64url')), decipher.final()])
  return JSON.parse(plaintext.toString('utf8')) as T
}
