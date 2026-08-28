const ACCESS_GRANTING_STATUSES: ReadonlySet<string> = new Set(['active', 'trialing'])

/**
 * Whether a Paddle subscription status currently grants paid access.
 *
 * Only `active` and `trialing` grant access. A `scheduled_change` to `cancel`
 * or `pause` does NOT revoke access — revocation happens only once `status`
 * actually becomes `canceled`, `paused`, or `past_due`.
 */
export function hasPaidAccess(status: string | null | undefined): boolean {
  return status != null && ACCESS_GRANTING_STATUSES.has(status)
}
