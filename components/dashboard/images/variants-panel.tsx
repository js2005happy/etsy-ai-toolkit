'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { STYLES, LANGUAGES, PLATFORMS, VARIANT_COUNTS, CATEGORIES, SCENES, SCENE_GROUP_LABELS } from './image-constants'
import { CAMPAIGN_SET_SCENES } from '@/lib/image-scenes'
import type { ProductImageInput, ProductImageOutput } from './use-image-generation'
import { useI18n } from '@/lib/i18n/client'

interface Props {
  onGenerate: (items: ProductImageInput[]) => Promise<ProductImageOutput[]>
  loading: boolean
}

const fmt = (s: string, v: Record<string, string | number>) =>
  Object.entries(v).reduce((acc, [k, val]) => acc.replaceAll(`{${k}}`, String(val)), s)

export default function VariantsPanel({ onGenerate, loading }: Props) {
  const { t } = useI18n()
  const [productName, setProductName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(CATEGORIES[CATEGORIES.length - 1].value)
  const [language, setLanguage] = useState(LANGUAGES[0])
  const [count, setCount] = useState(2)
  const [scene, setScene] = useState(SCENES[0].value)
  const [styleLock, setStyleLock] = useState(false)
  const [campaignSet, setCampaignSet] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const base = {
      product_name: productName,
      product_description: description,
      category,
      platform: PLATFORMS[0].label,
      size: PLATFORMS[0].size,
      language,
    }
    const items: ProductImageInput[] = campaignSet
      ? CAMPAIGN_SET_SCENES.map((s) => ({ ...base, scene: s, style: STYLES[0], style_lock: true }))
      : STYLES.slice(0, count).map((style) => ({ ...base, scene, style, style_lock: styleLock }))
    await onGenerate(items)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="v-product">{t('dashboardTools.common.productName')}</Label>
        <Input
          id="v-product"
          placeholder={t('dashboardTools.images.productNamePh')}
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="v-desc">{t('dashboardTools.common.productDescription')}</Label>
        <Textarea
          id="v-desc"
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

      <div className="flex items-start gap-2 rounded-lg border p-3">
        <input
          type="checkbox"
          id="v-set"
          checked={campaignSet}
          onChange={(e) => setCampaignSet(e.target.checked)}
          className="mt-0.5 h-4 w-4"
        />
        <div className="space-y-1">
          <Label htmlFor="v-set" className="font-medium">
            {t('dashboardTools.images.campaignSet')}
          </Label>
          <p className="text-xs text-muted-foreground">
            {fmt(t('dashboardTools.images.campaignSetHint'), { n: CAMPAIGN_SET_SCENES.length })}
          </p>
        </div>
      </div>

      {!campaignSet && (
        <>
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
            <Label>{t('dashboardTools.images.numberOfVariants')}</Label>
            <div className="flex gap-2">
              {VARIANT_COUNTS.map((c) => (
                <Button
                  key={c}
                  type="button"
                  variant={count === c ? 'default' : 'outline'}
                  onClick={() => setCount(c)}
                >
                  {c}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {fmt(t('dashboardTools.images.variantsCountHint'), {
                count,
                styles: STYLES.slice(0, count).map((s) => s.toLowerCase()).join(', '),
              })}
            </p>
          </div>

          <div className="flex items-start gap-2 rounded-lg border p-3">
            <input
              type="checkbox"
              id="v-lock"
              checked={styleLock}
              onChange={(e) => setStyleLock(e.target.checked)}
              className="mt-0.5 h-4 w-4"
            />
            <div className="space-y-1">
              <Label htmlFor="v-lock" className="font-medium">
                {t('dashboardTools.images.styleLock')}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t('dashboardTools.images.styleLockHint')}
              </p>
            </div>
          </div>
        </>
      )}

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
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('dashboardTools.images.generating')}
          </>
        ) : campaignSet ? (
          fmt(t('dashboardTools.images.generateCampaignSet'), { n: CAMPAIGN_SET_SCENES.length })
        ) : (
          fmt(t('dashboardTools.images.generateVariants'), { n: count })
        )}
      </Button>
    </form>
  )
}
