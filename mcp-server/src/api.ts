import { BASE_URL, MCP_API_KEY, assertConfigured } from './config.js'

export async function callApi(
  path: string,
  method: 'GET' | 'POST' = 'POST',
  body?: unknown
): Promise<unknown> {
  assertConfigured()

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-mcp-key': MCP_API_KEY,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message =
      (data as { error?: string }).error ?? JSON.stringify(data) ?? res.statusText
    throw new Error(`API ${path} failed (${res.status}): ${message}`)
  }
  return data
}
