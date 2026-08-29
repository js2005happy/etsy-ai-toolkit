import express from 'express'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { createServer } from './server.js'

const app = express()
app.use(express.json())

const server = createServer()

app.post('/mcp', async (req, res) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  })
  res.on('close', () => {
    transport.close()
  })
  await server.connect(transport)
  await transport.handleRequest(req, res, req.body)
})

const PORT = Number(process.env.PORT ?? 3001)
app.listen(PORT, () => {
  console.error(`[etsy-ai-toolkit-mcp] Streamable HTTP server on http://localhost:${PORT}/mcp`)
})
