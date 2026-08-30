'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Download, ExternalLink, Image as ImageIcon } from 'lucide-react'
import type { ProductImageOutput } from './use-image-generation'

interface Props {
  images: ProductImageOutput[]
  loading: boolean
  error: string | null
}

export default function ImageResultGrid({ images, loading, error }: Props) {
  return (
    <div className="space-y-6">
      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="pt-6">
            <p className="text-destructive font-medium">{error}</p>
            {error.toLowerCase().includes('credit') && (
              <Button variant="link" className="p-0 h-auto text-destructive mt-2" asChild>
                <Link href="/pricing">Upgrade Plan &rarr;</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center p-12 text-center text-foreground">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium">AI is painting your posters...</p>
        </div>
      )}

      {!loading && !error && images.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-border rounded-xl text-muted-foreground">
          <ImageIcon className="h-12 w-12 mb-4" />
          <p>Describe your product and click generate to get marketing posters.</p>
        </div>
      )}

      {!loading && images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {images.map((img, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-3 space-y-3">
                <div className="rounded-xl overflow-hidden border border-border bg-secondary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.imageUrl}
                    alt={`Generated poster ${i + 1}`}
                    className="w-full h-auto"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">#{i + 1}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(img.imageUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const a = document.createElement('a')
                        a.href = img.imageUrl
                        a.download = `product-poster-${i + 1}.png`
                        a.target = '_blank'
                        a.rel = 'noopener'
                        a.click()
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {img.revised_prompt && (
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                    {img.revised_prompt}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
