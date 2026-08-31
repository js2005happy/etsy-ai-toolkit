'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
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

interface ParsedProduct {
  name: string
  description: string
}

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
        <Label htmlFor="b-list">Product List</Label>
        <Textarea
          id="b-list"
          placeholder={'One product per line. Use "Name | Description" or just the name.\n\ne.g.\nHandmade blue ceramic vase | Minimalist vase with floral patterns, deep blue glaze\nWalnut cutting board | Organic edge serving board, food-safe oil finish\nLinen throw pillow | Stone-washed linen cover, earthy tones'}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          required
          className="min-h-[200px] font-mono text-xs"
        />
        <p className="text-xs text-muted-foreground">
          {products.length === 0
            ? 'Paste one product per line.'
            : `${products.length} product${products.length > 1 ? 's' : ''} detected.`}
        </p>
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
          Applies the same category tuning to every product in the list.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Visual Style</Label>
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger>
              <SelectValue placeholder="Select style" />
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
          <Label>Platform</Label>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger>
              <SelectValue placeholder="Select platform" />
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
            Generating...
          </>
        ) : (
          `Generate ${products.length} Poster${products.length === 1 ? '' : 's'}`
        )}
      </Button>
    </form>
  )
}
