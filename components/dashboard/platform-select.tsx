'use client'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PLATFORMS } from '@/lib/platforms'
import { useI18n } from '@/lib/i18n/client'

interface PlatformSelectProps {
  value: string
  onChange: (value: string) => void
}

export default function PlatformSelect({ value, onChange }: PlatformSelectProps) {
  const { t } = useI18n()
  return (
    <div className="space-y-2">
      <Label htmlFor="platform">{t('dashboardTools.common.marketplace')}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="platform" className="w-full">
          <SelectValue placeholder={t('dashboardTools.common.selectMarketplace')} />
        </SelectTrigger>
        <SelectContent>
          {PLATFORMS.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
