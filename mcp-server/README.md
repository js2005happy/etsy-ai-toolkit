# etsy-ai-toolkit-mcp

Model Context Protocol (MCP) server for [Craftly](https://craftly.world) — an AI-powered seller workspace for creating, managing, and growing products across marketplaces. The MCP package exposes selected Craftly seller tools to compatible clients over **stdio** or **Streamable HTTP**.

## Tools

| Tool | Purpose |
| --- | --- |
| `generate_listing` | Create a marketplace listing draft (title / description / tags) |
| `generate_message_reply` | Draft buyer message replies |
| `generate_review_reply` | Respond to reviews |
| `generate_social_post` | Write social captions + hashtags |
| `generate_announcement` | Write shop announcements |
| `generate_keywords` | Generate listing and search keyword ideas |
| `translate_listing` | Translate listing text |
| `optimize_listing` | Improve an existing listing |
| `generate_pricing_advice` | Suggest pricing and margins |
| `get_credits` | Check remaining account credits |

## Install

```bash
npm install -g etsy-ai-toolkit-mcp
```

Or run without installing:

```bash
npx -y etsy-ai-toolkit-mcp
```

## Configure

The server calls the Craftly HTTP API. Each Craftly account can use its own MCP key so requests and usage remain associated with that account.

```bash
BASE_URL=https://craftly.world
MCP_API_KEY=mcp_your_personal_key
PORT=3001
```

The server sends `MCP_API_KEY` as the `x-mcp-key` header. Resetting the key in Craftly invalidates the previous value.

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

Example configuration:

```json
{
  "mcpServers": {
    "craftly": {
      "command": "npx",
      "args": ["-y", "etsy-ai-toolkit-mcp"],
      "env": {
        "BASE_URL": "https://craftly.world",
        "MCP_API_KEY": "mcp_your_personal_key"
      }
    }
  }
}
```

## Product scope

Craftly currently supports live commerce workflows around Etsy, Shopify, WooCommerce, and eBay. Marketplace V1 is a discovery/non-payment layer; it does not provide Craftly-operated checkout, escrow, payouts, refunds, chargebacks, or tax handling.

## License

MIT
