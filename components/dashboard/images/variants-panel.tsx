'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { STYLES, LANGUAGES, PLATFORMS, VARIANT_COUNTS } from './image-constants'
import type { ProductImageInput, ProductImageOutput } from './use-image-generation'

interface Props {
  onGenerate: (items: ProductImageInput[]) => Promise<ProductImageOutput[]>
  loading: boolean
}

export default function VariantsPanel({ onGenerate, loading }: Props) {
  const [productName, setProductName] = useState('')
  const [description, setDescription] = useState('')
  const [language, setLanguage] = useState(LANGUAGES[0])
  const [count, setCount] = useState(2)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const items: ProductImageInput[] = STYLES.slice(0, count).map((style) => ({
      product_name: productName,
      product_description: description,
      style,
      platform: PLATFORMS[0].label,
      size: PLATFORMS[0].size,
      language,
    }))
    await onGenerate(items)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="v-product">Product Name</Label>
        <Input
          id="v-product"
          placeholder="e.g. Handmade blue ceramic vase"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="v-desc">Product Description</Label>
        <Textarea
          id="v-desc"
          placeholder="e.g. A minimalist ceramic vase with floral patterns, glazed in deep blue..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="min-h-[110px]"
        />
      </div>
      <div className="space-y-2">
        <Label>Number of Variants</Label>
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
          {count} posters in {STYLES.slice(0, count).map((s) => s.toLowerCase()).join(', ')} styles.
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
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          `Generate ${count} Variants`
        )}
      </Button>
    </form>
  )
}
