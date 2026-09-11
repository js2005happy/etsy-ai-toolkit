# Marketplace V1 Release Checklist

Marketplace V1 is a buyer-discovery and seller-catalog release. It intentionally excludes Craftly-hosted checkout, payments, escrow, payouts, refunds, tax handling, buyer-protection guarantees, and automated moderation enforcement.

## 1. Base and branch

- Confirm Commerce RC PR #18 has been released first.
- Confirm PR #20 is retargeted to the released main branch only after the Commerce RC merge.
- Confirm PR #20 final head is unchanged from the reviewed/validated head.
- Confirm there are no unresolved review threads.

## 2. Quality validation

Run on the final Marketplace head:

- dependency install
- lint
- production build
- relevant automated tests
- public-route smoke checks
- authenticated wishlist/report/moderation API checks

Do not treat a blocked Vercel deployment quota as a successful build. Wait for a real successful preview/build before release.

## 3. Database migrations

Marketplace migrations are applied only after Commerce migrations `0016` through `0020` are present.

Apply in order:

1. `0021_marketplace_wishlist.sql`
2. `0022_marketplace_reports.sql`
3. `0023_marketplace_moderation_audit.sql`
4. `0024_marketplace_seller_policies.sql`

Verify:

- wishlist rows are private to their authenticated owner
- report intake is private and does not expose reports publicly
- moderation audit columns exist
- storefront policy fields exist
- existing Commerce RLS remains enabled
- no anonymous write policy was introduced

## 4. Environment

- Configure `MARKETPLACE_MODERATOR_USER_IDS` only with explicitly approved Craftly account UUIDs.
- Test a configured moderator account.
- Test a signed-in non-moderator account receives 403 from moderator APIs.
- Do not expose service-role credentials to the browser.

## 5. Public Marketplace smoke test

Validate:

- `/discover`
- `/discover/sellers`
- `/wishlist`
- `/compare`
- `/recently-viewed`
- `/shop/<published-slug>`
- `/shop/<published-slug>/products/<public-ready-product-id>`

Confirm:

- unpublished storefronts are absent
- hidden storefront products are absent
- non-ready products are absent
- products cannot appear under another seller's storefront
- empty/loading/error states render correctly
- mobile navigation works with keyboard and touch
- comparison is informational and makes no ranking/winner claim
- Recently Viewed is local-browser only and clearable
- seller policies are explicitly labeled seller-authored

## 6. Buyer account flows

- Save a public product.
- Remove a saved product.
- Confirm stale/private/unready saved products are hidden.
- Select 2–4 saved products for comparison.
- Submit a report as an authenticated user.
- Confirm duplicate reports do not trigger automatic enforcement.

## 7. Moderation

- Open `/dashboard/marketplace/moderation` as an approved moderator.
- Filter by status, seller/product text, and grouping mode.
- Open direct listing/store links.
- Move a report through reviewing/resolved/dismissed states.
- Confirm changes update moderation metadata only.
- Confirm no listing is automatically hidden/deleted and no seller is automatically suspended.

## 8. Seller Storefront

- Edit identity, SEO, catalog selection, and seller-authored policies.
- Verify policy character limits and live preview.
- Publish only selected ready products.
- Confirm policy text is shown publicly as seller-authored information and not a Craftly guarantee.

## 9. Release guardrails

Stop release if any of the following occurs:

- final lint/build fails
- Vercel deploy quota still blocks a real production/preview validation
- Marketplace RLS/privacy validation fails
- moderator allowlist is missing or permits unauthorized access
- public catalog leaks unpublished/hidden/unready/cross-seller products
- a report causes automatic punitive marketplace action
- any UI claims Craftly checkout/payment/escrow/buyer protection is active

## 10. Post-deploy

After one deliberate production deployment:

- verify `craftly.world` points to the intended merged SHA
- run public and authenticated smoke tests once
- inspect production logs for Marketplace route errors
- rerun security checks after migrations
- do not add checkout/payment/payout until a separate transaction architecture is approved
