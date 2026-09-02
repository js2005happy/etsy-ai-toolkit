'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CinematicBackground from '@/components/cinematic/cinematic-background';
import PlatformSelect from '@/components/dashboard/platform-select';
import { useI18n } from '@/lib/i18n/client';

export default function KeywordsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [productType, setProductType] = useState('');
  const [market, setMarket] = useState('');
  const [style, setStyle] = useState('');
  const [platform, setPlatform] = useState('etsy');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [credits, setCredits] = useState<number | null>(null);

  const fetchCredits = async () => {
    try {
      const res = await fetch('/api/user/credits');
      if (res.ok) {
        const data = await res.json();
        setCredits(data.credits_remaining);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setKeywords([]);
    try {
      const res = await fetch('/api/generate-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_type: productType, market, style, platform }),
      });
      if (res.status === 401) { router.push('/login'); return; }
      if (res.status === 403) { setError(t('dashboardTools.common.insufficientCredits')); return; }
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || t('dashboardTools.common.somethingWrong'));
        return;
      }
      const data = await res.json();
      setKeywords(data.keywords || []);
      fetchCredits();
    } catch (err: any) {
      setError(err.message || t('dashboardTools.common.networkError'));
    } finally {
      setLoading(false);
    }
  };

  const copyAll = () => {
    navigator.clipboard.writeText(keywords.join('\n'));
  };

  return (
    <div className="min-h-screen py-10">
      <CinematicBackground theme="keywords" />
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">{t('dashboardTools.keywords.h1')}</h1>
          <p className="mt-2 text-muted-foreground">{t('dashboardTools.keywords.sub')}</p>
          <p className="mt-2 text-sm text-muted-foreground/70">
            {t('dashboardTools.keywords.note')}
          </p>
          {credits !== null && (
            <p className="mt-2 text-sm text-muted-foreground">{credits} {t('dashboardTools.common.creditsLeft')}</p>
          )}
        </div>

        <Card className="mb-8 rounded-xl border-border bg-card p-6">
          <CardHeader className="p-0">
            <CardTitle>{t('dashboardTools.keywords.details')}</CardTitle>
            <CardDescription>{t('dashboardTools.keywords.detailsDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="product_type">{t('dashboardTools.common.productType')}</Label>
                <Input
                  id="product_type"
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  placeholder={t('dashboardTools.keywords.productTypePh')}
                  required
                />
              </div>
              <div>
                <Label htmlFor="market">{t('dashboardTools.keywords.targetMarket')}</Label>
                <Input
                  id="market"
                  value={market}
                  onChange={(e) => setMarket(e.target.value)}
                  placeholder={t('dashboardTools.keywords.targetMarketPh')}
                />
              </div>
              <div>
                <Label htmlFor="style">{t('dashboardTools.common.style')} {t('dashboardTools.common.optional')}</Label>
                <Input
                  id="style"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  placeholder={t('dashboardTools.keywords.stylePh')}
                />
              </div>
              <PlatformSelect value={platform} onChange={setPlatform} />
              <Button type="submit" disabled={loading} className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                {loading ? t('dashboardTools.keywords.generating') : t('dashboardTools.keywords.generate')}
              </Button>
            </form>
            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>

        {keywords.length > 0 && (
          <Card className="rounded-xl border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t('dashboardTools.keywords.suggested')}</h3>
              <Button variant="ghost" size="sm" onClick={copyAll}>{t('dashboardTools.keywords.copyAll')}</Button>
            </div>
            <ul className="space-y-2">
              {keywords.map((keyword, index) => (
                <li key={index} className="rounded-lg bg-secondary px-3 py-2 text-sm text-foreground">{keyword}</li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
