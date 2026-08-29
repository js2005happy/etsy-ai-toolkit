'use client'

import { Globe } from 'lucide-react'
import { useI18n } from '@/lib/i18n/client'
import { locales, type Locale } from '@/lib/i18n/locales'

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()

  return (
    <div className="relative flex items-center">
      <Globe className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        aria-label="Language"
        className="h-9 cursor-pointer appearance-none rounded-full border border-border bg-secondary pl-9 pr-8 text-sm text-foreground outline-none transition-colors hover:bg-accent focus:border-primary"
      >
        {locales.map((l) => (
          <option key={l.code} value={l.code} className="bg-card text-foreground">
            {l.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 text-[10px] text-muted-foreground">
        ▾
      </span>
    </div>
  )
}
