'use client'

import { AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export type ProductReadinessPayload = {
  product_profile?: string
  readiness_score?: number
  missing_critical_facts?: string[]
  readiness_issues?: Array<{ field: string; severity: 'error' | 'warning'; message: string }>
}

export default function ProductReadinessPanel({ data }: { data: ProductReadinessPayload }) {
  if (typeof data.readiness_score !== 'number') return null

  const score = Math.max(0, Math.min(100, data.readiness_score))
  const missing = data.missing_critical_facts ?? []
  const issues = data.readiness_issues ?? []
  const ready = score >= 80 && missing.length === 0

  return (
    <Card className="border-primary/20 bg-primary/[0.03]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Product readiness
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {data.product_profile || 'General Product'} · fact completeness before publishing
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold tabular-nums">{score}%</div>
            <div className="text-xs text-muted-foreground">readiness score</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${score}%` }} />
        </div>

        {ready ? (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Core category facts are present. Review the copy before publishing.
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Add missing facts instead of letting AI guess.
            </div>
            {missing.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {missing.map((fact) => (
                  <span key={fact} className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-700 dark:text-amber-300">
                    {fact}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {issues.length > 0 && (
          <div className="space-y-2 border-t border-border/60 pt-3">
            {issues.slice(0, 5).map((issue, index) => (
              <p key={`${issue.field}-${index}`} className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{issue.field}:</span> {issue.message}
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
