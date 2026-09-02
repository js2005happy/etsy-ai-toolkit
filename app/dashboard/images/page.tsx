'use client'

import { Coins } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import CinematicBackground from '@/components/cinematic/cinematic-background'
import { useImageGeneration } from '@/components/dashboard/images/use-image-generation'
import VariantsPanel from '@/components/dashboard/images/variants-panel'
import PlatformsPanel from '@/components/dashboard/images/platforms-panel'
import BulkPanel from '@/components/dashboard/images/bulk-panel'
import ImageResultGrid from '@/components/dashboard/images/image-result-grid'
import { useI18n } from '@/lib/i18n/client'

export default function ImagesPage() {
  const { t } = useI18n()
  const { loading, images, error, creditError, credits, generate } = useImageGeneration()

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl">
      <CinematicBackground theme="social" />
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground">{t('dashboardTools.images.h1')}</h1>
          <p className="text-muted-foreground">{t('dashboardTools.images.sub')}</p>
        </div>
        {credits !== null && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
            <Coins className="h-4 w-4" />
            <span>{credits} {t('dashboardTools.common.imagesLeft')}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-display">{t('dashboardTools.images.posterDetails')}</CardTitle>
            <CardDescription>{t('dashboardTools.images.posterDetailsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="variants">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="variants">{t('dashboardTools.images.variants')}</TabsTrigger>
                <TabsTrigger value="platforms">{t('dashboardTools.images.multiPlatform')}</TabsTrigger>
                <TabsTrigger value="bulk">{t('dashboardTools.images.bulk')}</TabsTrigger>
              </TabsList>
              <TabsContent value="variants" className="mt-4">
                <VariantsPanel onGenerate={generate} loading={loading} />
              </TabsContent>
              <TabsContent value="platforms" className="mt-4">
                <PlatformsPanel onGenerate={generate} loading={loading} />
              </TabsContent>
              <TabsContent value="bulk" className="mt-4">
                <BulkPanel onGenerate={generate} loading={loading} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <ImageResultGrid images={images} loading={loading} error={error} creditError={creditError} />
        </div>
      </div>
    </div>
  )
}
