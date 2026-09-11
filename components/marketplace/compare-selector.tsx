'use client'

import { useMemo, useState } from 'react'
import { Scale } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Item = { id: string; title: string; seller: string }

export default function CompareSelector({ items }: { items: Item[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<string[]>(items.slice(0, Math.min(2, items.length)).map((item) => item.id))
  const canCompare = selected.length >= 2
  const label = useMemo(() => `${selected.length}/4 selected`, [selected.length])

  const toggle = (id: string) => {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((value) => value !== id)
      if (current.length >= 4) return current
      return [...current, id]
    })
  }

  const compare = () => {
    if (!canCompare) return
    router.push(`/compare?ids=${encodeURIComponent(selected.join(','))}`)
  }

  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Choose products to compare</p>
          <p className="mt-1 text-xs text-muted-foreground">Select 2–4 currently public saved products. {label}.</p>
        </div>
        <button type="button" disabled={!canCompare} onClick={compare} className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"><Scale className="mr-2 h-4 w-4" />Compare selected</button>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const active = selected.includes(item.id)
          const disabled = !active && selected.length >= 4
          return (
            <button key={item.id} type="button" disabled={disabled} onClick={() => toggle(item.id)} className={`rounded-xl border p-3 text-left transition ${active ? 'border-primary bg-primary/5' : 'bg-background hover:bg-muted/50'} disabled:cursor-not-allowed disabled:opacity-40`}>
              <p className="line-clamp-2 text-sm font-medium">{item.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.seller}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
