import { config } from 'dotenv'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// Load mcp-server/.env regardless of the caller's CWD. Explicit env vars
// (e.g. set in the MCP client config) win — dotenv never overrides them.
config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env'), quiet: true })

export const BASE_URL = process.env.BASE_URL ?? 'https://etsy-ai-toolkit.vercel.app'

export const MCP_API_KEY = process.env.MCP_API_KEY ?? ''

export function assertConfigured(): void {
  if (!MCP_API_KEY) {
    throw new Error(
      'MCP_API_KEY is not set. Set it to the same value as the site\'s MCP_API_KEY env var.'
    )
  }
}
