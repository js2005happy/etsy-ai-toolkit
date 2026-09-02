'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { STYLES, LANGUAGES, PLATFORMS, CATEGORIES } from './image-constants'
import type { ProductImageInput, ProductImageOutput } from './use-image-generation'
import { useI18n } from '@/lib/i18n/client'

interface Props {
  onGenerate: (items: ProductImageInput[]) => Promise<ProductImageOutput[]>
  loading: boolean
}

interface ParsedProduct {
  name: string
  description: string
}

const fmt = (s: string, v: Record<string, string | number>) =>
  Object.entries(v).reduce((acc, [k, val]) => acc.replaceAll(`{${k}}`, String(val)), s)

function parseProducts(raw: string): ParsedProduct[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const idx = line.indexOf('|')
      if (idx === -1) {
        return { name: line, description: line }
      }
      return {
        name: line.slice(0, idx).trim(),
        description: line.slice(idx + 1).trim() || line.slice(0, idx).trim(),
      }
    })
}

export default function BulkPanel({ onGenerate, loading }: Props) {
  const { t } = useI18n()
  const [raw, setRaw] = useState('')
  const [style, setStyle] = useState(STYLES[0])
  const [platform, setPlatform] = useState(PLATFORMS[0].label)
  const [category, setCategory] = useState(CATEGORIES[CATEGORIES.length - 1].value)

  const products = parseProducts(raw)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const platformObj = PLATFORMS.find((p) => p.label === platform)
    const items: ProductImageInput[] = products.map((p) => ({
      product_name: p.name,
      product_description: p.description,
      category,
      style,
      platform,
      size: platformObj?.size ?? '1024x1024',
      language: LANGUAGES[LANGUAGES.length - 1],
    }))
    await onGenerate(items)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="b-list">{t('dashboardTools.images.productList')}</Label>
        <Textarea
          id="b-list"
          placeholder={t('dashboardTools.images.productListPh')}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          required
          className="min-h-[200px] font-mono text-xs"
        />
        <p className="text-xs text-muted-foreground">
          {products.length === 0
            ? t('dashboardTools.images.pasteProductHint')
            : fmt(t('dashboardTools.images.productsDetected'), { n: products.length })}
        </p>
      </div>
      <div className="space-y-2">
        <Label>{t('dashboardTools.images.productCategory')}</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder={t('dashboardTools.images.selectCategory')} />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {t('dashboardTools.images.bulkCategoryHint')}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('dashboardTools.images.visualStyle')}</Label>
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger>
              <SelectValue placeholder={t('dashboardTools.images.selectStyle')} />
            </SelectTrigger>
            <SelectContent>
              {STYLES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t('dashboardTools.images.platform')}</Label>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger>
              <SelectValue placeholder={t('dashboardTools.images.selectPlatform')} />
            </SelectTrigger>
            <SelectContent>
              {PLATFORMS.map((p) => (
                <SelectItem key={p.label} value={p.label}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={loading || products.length === 0}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('dashboardTools.images.generating')}
          </>
        ) : (
          fmt(t('dashboardTools.images.generatePosters'), {
            n: products.length,
            s: products.length === 1 ? '' : 's',
          })
        )}
      </Button>
    </form>
  )
}
