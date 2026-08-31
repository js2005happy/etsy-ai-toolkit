'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { STYLES, LANGUAGES, PLATFORMS, CATEGORIES } from './image-constants'
import type { ProductImageInput, ProductImageOutput } from './use-image-generation'

interface Props {
  onGenerate: (items: ProductImageInput[]) => Promise<ProductImageOutput[]>
  loading: boolean
}

export default function PlatformsPanel({ onGenerate, loading }: Props) {
  const [productName, setProductName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(CATEGORIES[CATEGORIES.length - 1].value)
  const [language, setLanguage] = useState(LANGUAGES[0])
  const [selected, setSelected] = useState<string[]>([PLATFORMS[0].label])

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
      })
    )
    await onGenerate(items)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="p-product">Product Name</Label>
        <Input
          id="p-product"
          placeholder="e.g. Handmade blue ceramic vase"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="p-desc">Product Description</Label>
        <Textarea
          id="p-desc"
          placeholder="e.g. A minimalist ceramic vase with floral patterns, glazed in deep blue..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="min-h-[110px]"
        />
      </div>
      <div className="space-y-2">
        <Label>Product Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
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
          Tunes lighting, composition and staging for this product type.
        </p>
      </div>
      <div className="space-y-2">
        <Label>Platforms</Label>
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
            ? 'Select at least one platform.'
            : `${selected.length} poster${selected.length > 1 ? 's' : ''} across selected platforms.`}
        </p>
      </div>
      <div className="space-y-2">
        <Label>Poster Text Language</Label>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger>
            <SelectValue placeholder="Select language" />
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
            Generating...
          </>
        ) : (
          `Generate ${selected.length} Platform Poster${selected.length === 1 ? '' : 's'}`
        )}
      </Button>
    </form>
  )
}
