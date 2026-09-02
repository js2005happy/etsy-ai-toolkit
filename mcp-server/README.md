# etsy-ai-toolkit-mcp

Model Context Protocol (MCP) server for [Craftly](https://craftly.world) — the AI copilot for Etsy sellers. Exposes the toolkit's 10 AI tools to any MCP client (Claude Code, Claude Desktop, Cursor, etc.) over **stdio** or **Streamable HTTP**.

## Tools

| Tool | Purpose |
| --- | --- |
| `generate_listing` | Create a listing (title / description / tags) |
| `generate_message_reply` | Draft buyer message replies |
| `generate_review_reply` | Respond to reviews |
| `generate_social_post` | Write social captions + hashtags |
| `generate_announcement` | Write shop announcements |
| `generate_keywords` | Generate SEO keywords |
| `translate_listing` | Translate listing text |
| `optimize_listing` | Improve an existing listing |
| `generate_pricing_advice` | Suggest pricing and margins |
| `get_credits` | Check remaining credits |

## Install

```bash
npm install -g etsy-ai-toolkit-mcp
```

Or run without installing:

```bash
npx -y etsy-ai-toolkit-mcp
```

## Configure

The server calls the Craftly HTTP API, so it needs a base URL and a service-account key. Set them via a `.env` file next to the binary, or as env vars in your MCP client config:

```bash
BASE_URL=https://craftly.world     # omit to use the default
MCP_API_KEY=your-service-account-key
PORT=3001                          # Streamable HTTP transport only
```

`MCP_API_KEY` must match the site's `MCP_API_KEY`. The server sends it as the `x-mcp-key` header on every request. Without it, requests are rejected.

## Run

**stdio** (default):

```bash
etsy-ai-toolkit-mcp
```

**Streamable HTTP**:

```bash
etsy-ai-toolkit-mcp-http
# POST endpoint: http://localhost:3001/mcp
```

## MCP client config

Claude Code:

```bash
claude mcp add etsy-ai-toolkit -- npx -y etsy-ai-toolkit-mcp
```

Claude Desktop (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "etsy-ai-toolkit": {
      "command": "etsy-ai-toolkit-mcp",
      "env": {
        "BASE_URL": "https://craftly.world",
        "MCP_API_KEY": "your-service-account-key"
      }
    }
  }
}
```

## License

MIT
