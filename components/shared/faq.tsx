'use client'

import { useState } from 'react'

export default function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="k-faq">
      {items.map((it, i) => {
        const isOpen = open === i
        return (
          <div key={i} className={`k-item${isOpen ? ' open' : ''}`}>
            <button
              type="button"
              className="k-q"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              {it.q}
              <i>+</i>
            </button>
            <div
              className="k-a"
              ref={(el) => {
                if (el) el.style.maxHeight = isOpen ? `${el.scrollHeight}px` : '0px'
              }}
            >
              <p>{it.a}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
