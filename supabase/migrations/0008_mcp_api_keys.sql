-- Etsy AI Toolkit — per-user MCP API keys
-- Each user gets their own `mcp_api_key` so the MCP server can authenticate
-- the `x-mcp-key` header straight back to the owning user (lib/auth.ts) and
-- deduct quota per-person instead of against one shared service account.
-- Idempotent — safe to re-run.

alter table public.profiles
  add column if not exists mcp_api_key text;

create unique index if not exists profiles_mcp_api_key_idx
  on public.profiles (mcp_api_key)
  where mcp_api_key is not null;
