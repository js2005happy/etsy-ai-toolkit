'use client'

import { useEffect } from 'react'

// Fire-and-forget: applies the ?ref= referral cookie to the signed-in user's
// profile once on dashboard mount. Idempotent server-side.
export default function ReferralApply() {
  useEffect(() => {
    fetch('/api/referral/apply', { method: 'POST' }).catch(() => {})
  }, [])

  return null
}
