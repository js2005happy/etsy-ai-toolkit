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

interface PlatformSelectProps {
  value: string
  onChange: (value: string) => void
}

export default function PlatformSelect({ value, onChange }: PlatformSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="platform">Marketplace</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="platform" className="w-full">
          <SelectValue placeholder="Select marketplace" />
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
