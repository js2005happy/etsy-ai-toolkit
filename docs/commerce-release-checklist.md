# Craftly commerce batch release checklist

This checklist is intentionally release-gated. Completing development or CI does **not** authorize a production deployment.

## 1. Code gate

- [ ] PR #18 remains draft until the batch is explicitly approved for release.
- [ ] Latest Quality workflow passes lint and production build on the final head SHA.
- [ ] No unresolved merge conflicts or required review changes.
- [ ] Direct external publish remains create-once; an already-linked listing cannot be published again through the create route.
- [ ] Stock/price external mutations require preview plus explicit second confirmation.
- [ ] Unsupported channels remain local reviewed drafts rather than pretending to publish.

## 2. Database gate

Apply migrations in order and verify each succeeds exactly once:

1. `0016_product_hub.sql`
2. `0017_commerce_connections.sql`
3. `0018_commerce_operations.sql`
4. `0019_commerce_rls_hardening.sql`
5. `0020_security_advisor_hardening.sql`

Verify:

- [ ] RLS enabled on products, variants, platform listings, commerce connections, sync events, orders, order items, storefronts and storefront products.
- [ ] Child-row policies enforce ownership of referenced parent rows.
- [ ] `commerce_connections.credentials_encrypted` is not readable by authenticated clients.
- [ ] No anonymous write policy exists for commerce/storefront operational tables.
- [ ] Service-role key is server-only.
- [ ] `consume_credits` and `consume_image_credits` are executable by `service_role`, not `anon`/`authenticated`.
- [ ] `protect_profile_columns()` has a fixed `search_path`.
- [ ] Re-run Supabase Security Advisor after migrations and review every remaining warning.
- [ ] Enable Supabase Auth leaked-password protection if available for the production project.

## 3. Environment gate

Production secrets/variables required by the enabled connectors must be present before release:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `COMMERCE_CREDENTIALS_KEY`
- [ ] Shopify client id/secret/redirect URI
- [ ] eBay client id/secret/redirect URI name and environment
- [ ] Existing Etsy/Paddle/AI production variables remain intact

Never print or copy secret values into logs, issues or PR comments.

## 4. Connector gate

### Shopify

- [ ] New OAuth grant includes product, order and inventory scopes required by the enabled features.
- [ ] Existing accounts show reconnect guidance when a required scope is missing.
- [ ] Create product works only from an unlinked reviewed draft.
- [ ] Order import is read-only.
- [ ] Stock/price sync is explicit and audited.

### WooCommerce

- [ ] Store URL validation rejects local/non-HTTPS/non-standard credential URLs.
- [ ] REST credentials are encrypted at rest.
- [ ] Product draft publishing works against a test store.
- [ ] Order import is read-only.
- [ ] Stock/price sync is explicit and audited.

### eBay

- [ ] OAuth grant includes `sell.inventory`, `sell.account` and `sell.fulfillment`.
- [ ] Publishing stores the provider offer id/SKU metadata needed for later sync.
- [ ] Order import uses Fulfillment API read operations only.
- [ ] Stock/price sync requires saved offer metadata and explicit confirmation.
- [ ] Older eBay connections are prompted to reconnect when the fulfillment scope is absent.

## 5. Product/UX gate

- [ ] Product Hub create/edit/archive works.
- [ ] Images and variants persist correctly.
- [ ] Product readiness catches missing category-specific facts without inventing values.
- [ ] Multichannel preview renders all supported draft channels.
- [ ] Order Inbox filters and imports supported sources without exposing full provider payloads.
- [ ] Storefront public page displays only published storefronts and selected ready products.
- [ ] Storefront remains catalog-only until a separate checkout/payment design is explicitly approved.

## 6. Data minimization gate

- [ ] No complete provider order payload is persisted.
- [ ] No phone number is copied into Craftly Order Inbox storage.
- [ ] No full street address is copied into Craftly Order Inbox storage.
- [ ] Customer notes are not copied into Craftly storage.
- [ ] Only operational order fields needed for seller workflow are retained.

## 7. Single production deployment

Only after explicit release approval:

1. Record final PR head SHA and passing Quality run.
2. Merge PR #18 once.
3. Confirm the canonical Vercel project is the only production target.
4. Apply/verify production migrations and required environment variables.
5. Allow one production deployment from the merged release.
6. Verify `craftly.world` resolves to the merged SHA before calling the release live.

## 8. Post-deploy smoke test

- [ ] `/dashboard/products`
- [ ] `/dashboard/multichannel`
- [ ] `/dashboard/orders`
- [ ] `/dashboard/storefront`
- [ ] `/account` commerce connections
- [ ] `/shop/<published-slug>`
- [ ] Listing Generator and Optimizer readiness metadata
- [ ] Shopify connection/reconnect and guarded operations
- [ ] WooCommerce connection/import/sync
- [ ] eBay connection/import/sync using a safe test listing/account
- [ ] No duplicate Vercel fan-out

If any production-critical check fails, stop further marketplace mutations and fix forward with a reviewed commit rather than repeatedly redeploying speculative changes.
