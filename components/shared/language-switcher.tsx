'use client'

import { Globe } from 'lucide-react'
import { useI18n } from '@/lib/i18n/client'
import { locales, type Locale } from '@/lib/i18n/locales'

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()

  return (
    <div className="relative flex items-center">
      <Globe className="pointer-events-none absolute left-3 h-4 w-4 text-white/60" />
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        aria-label="Language"
        className="h-9 cursor-pointer appearance-none rounded-full border border-white/20 bg-white/[0.06] pl-9 pr-8 text-sm text-white/80 outline-none transition-colors hover:bg-white/10 focus:border-white/40"
      >
        {locales.map((l) => (
          <option key={l.code} value={l.code} className="bg-neutral-900 text-white">
            {l.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 text-[10px] text-white/50">
        ▾
      </span>
    </div>
  )
}
