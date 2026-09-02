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

export default function PricingPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [materialCost, setMaterialCost] = useState('');
  const [laborCost, setLaborCost] = useState('');
  const [shippingCost, setShippingCost] = useState('');
  const [competitorMin, setCompetitorMin] = useState('');
  const [competitorMax, setCompetitorMax] = useState('');
  const [profitMargin, setProfitMargin] = useState('');
  const [platform, setPlatform] = useState('etsy');
  const [result, setResult] = useState<any>(null);
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
    setResult(null);
    try {
      const res = await fetch('/api/generate-pricing-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          material_cost: materialCost,
          labor_cost: laborCost,
          shipping_cost: shippingCost,
          competitor_price_min: competitorMin,
          competitor_price_max: competitorMax,
          desired_profit_margin: profitMargin,
          platform,
        }),
      });
      if (res.status === 401) { router.push('/login'); return; }
      if (res.status === 403) { setError(t('dashboardTools.common.insufficientCredits')); return; }
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || t('dashboardTools.common.somethingWrong'));
        return;
      }
      const data = await res.json();
      setResult(data);
      fetchCredits();
    } catch (err: any) {
      setError(err.message || t('dashboardTools.common.networkError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10">
      <CinematicBackground theme="pricing" />
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">{t('dashboardTools.pricing.h1')}</h1>
          <p className="mt-2 text-muted-foreground">{t('dashboardTools.pricing.sub')}</p>
          {credits !== null && (
            <p className="mt-2 text-sm text-muted-foreground">{credits} {t('dashboardTools.common.creditsLeft')}</p>
          )}
        </div>

        <Card className="mb-8 rounded-xl border-border bg-card p-6">
          <CardHeader className="p-0">
            <CardTitle>{t('dashboardTools.pricing.details')}</CardTitle>
            <CardDescription>{t('dashboardTools.pricing.detailsDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="material_cost">{t('dashboardTools.pricing.materialCost')}</Label>
                <Input
                  id="material_cost"
                  type="number"
                  step="0.01"
                  value={materialCost}
                  onChange={(e) => setMaterialCost(e.target.value)}
                  placeholder="e.g. 5.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="labor_cost">{t('dashboardTools.pricing.laborCost')}</Label>
                <Input
                  id="labor_cost"
                  type="number"
                  step="0.01"
                  value={laborCost}
                  onChange={(e) => setLaborCost(e.target.value)}
                  placeholder="e.g. 10.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="shipping_cost">{t('dashboardTools.pricing.shippingCost')}</Label>
                <Input
                  id="shipping_cost"
                  type="number"
                  step="0.01"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(e.target.value)}
                  placeholder="e.g. 3.50"
                  required
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="competitor_min">{t('dashboardTools.pricing.competitorMin')}</Label>
                  <Input
                    id="competitor_min"
                    type="number"
                    step="0.01"
                    value={competitorMin}
                    onChange={(e) => setCompetitorMin(e.target.value)}
                    placeholder="e.g. 15.00"
                  />
                </div>
                <div>
                  <Label htmlFor="competitor_max">{t('dashboardTools.pricing.competitorMax')}</Label>
                  <Input
                    id="competitor_max"
                    type="number"
                    step="0.01"
                    value={competitorMax}
                    onChange={(e) => setCompetitorMax(e.target.value)}
                    placeholder="e.g. 25.00"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="profit_margin">{t('dashboardTools.pricing.profitMargin')}</Label>
                <Input
                  id="profit_margin"
                  type="number"
                  step="1"
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(e.target.value)}
                  placeholder="e.g. 40"
                />
              </div>
              <PlatformSelect value={platform} onChange={setPlatform} />
              <Button type="submit" disabled={loading} className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                {loading ? t('dashboardTools.pricing.calculating') : t('dashboardTools.pricing.generate')}
              </Button>
            </form>
            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>

        {result && (
          <Card className="rounded-xl border-border bg-card p-6 space-y-3">
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground">{t('dashboardTools.pricing.suggestedPrice')}</h4>
              <p className="text-2xl font-bold text-secondary-foreground">${Number(result.suggested_price).toFixed(2)}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground">{t('dashboardTools.pricing.estimatedProfit')}</h4>
              <p className="text-xl font-semibold text-foreground">${Number(result.estimated_profit).toFixed(2)}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground">{t('dashboardTools.pricing.pricingStrategy')}</h4>
              <p className="text-sm text-foreground">{result.pricing_strategy}</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
