'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { STYLES, LANGUAGES, PLATFORMS, CATEGORIES, SCENES, SCENE_GROUP_LABELS } from './image-constants'
import type { ProductImageInput, ProductImageOutput } from './use-image-generation'
import { useI18n } from '@/lib/i18n/client'

interface Props {
  onGenerate: (items: ProductImageInput[]) => Promise<ProductImageOutput[]>
  loading: boolean
}

const fmt = (s: string, v: Record<string, string | number>) =>
  Object.entries(v).reduce((acc, [k, val]) => acc.replaceAll(`{${k}}`, String(val)), s)

export default function PlatformsPanel({ onGenerate, loading }: Props) {
  const { t } = useI18n()
  const [productName, setProductName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(CATEGORIES[CATEGORIES.length - 1].value)
  const [language, setLanguage] = useState(LANGUAGES[0])
  const [selected, setSelected] = useState<string[]>([PLATFORMS[0].label])
  const [scene, setScene] = useState(SCENES[0].value)
  const [styleLock, setStyleLock] = useState(false)

  const toggle = (label: string) => {
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const items: ProductImageInput[] = PLATFORMS.filter((p) => selected.includes(p.label)).map(
      (p) => ({
        product_name: productName,
        product_description: description,
        category,
        style: STYLES[0],
        platform: p.label,
        size: p.size,
        language,
        scene,
        style_lock: styleLock,
      })
    )
    await onGenerate(items)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="p-product">{t('dashboardTools.common.productName')}</Label>
        <Input
          id="p-product"
          placeholder={t('dashboardTools.images.productNamePh')}
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="p-desc">{t('dashboardTools.common.productDescription')}</Label>
        <Textarea
          id="p-desc"
          placeholder={t('dashboardTools.images.productDescPh')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="min-h-[110px]"
        />
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
          {t('dashboardTools.images.categoryHint')}
        </p>
      </div>
      <div className="space-y-2">
        <Label>{t('dashboardTools.images.imageFormat')}</Label>
        <Select value={scene} onValueChange={setScene}>
          <SelectTrigger>
            <SelectValue placeholder={t('dashboardTools.images.selectFormat')} />
          </SelectTrigger>
          <SelectContent>
            {SCENES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {SCENE_GROUP_LABELS[SCENES.find((s) => s.value === scene)?.group || 'main']} — {t('dashboardTools.images.formatHintSuffix')}
        </p>
      </div>
      <div className="space-y-2">
        <Label>{t('dashboardTools.images.platforms')}</Label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <Button
              key={p.label}
              type="button"
              variant={selected.includes(p.label) ? 'default' : 'outline'}
              onClick={() => toggle(p.label)}
            >
              {p.label}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {selected.length === 0
            ? t('dashboardTools.images.selectAtLeastOne')
            : fmt(t('dashboardTools.images.platformsCountHint'), { n: selected.length })}
        </p>
      </div>
      <div className="flex items-start gap-2 rounded-lg border p-3">
        <input
          type="checkbox"
          id="p-lock"
          checked={styleLock}
          onChange={(e) => setStyleLock(e.target.checked)}
          className="mt-0.5 h-4 w-4"
        />
        <div className="space-y-1">
          <Label htmlFor="p-lock" className="font-medium">
            {t('dashboardTools.images.styleLock')}
          </Label>
          <p className="text-xs text-muted-foreground">
            {t('dashboardTools.images.styleLockHint')}
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <Label>{t('dashboardTools.images.posterTextLanguage')}</Label>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger>
            <SelectValue placeholder={t('dashboardTools.images.selectLanguage')} />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={loading || selected.length === 0}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('dashboardTools.images.generating')}
          </>
        ) : (
          fmt(t('dashboardTools.images.generatePlatformImage'), {
            n: selected.length,
            s: selected.length === 1 ? '' : 's',
          })
        )}
      </Button>
    </form>
  )
}
