'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PricingPage() {
  const router = useRouter();
  const [materialCost, setMaterialCost] = useState('');
  const [laborCost, setLaborCost] = useState('');
  const [shippingCost, setShippingCost] = useState('');
  const [competitorMin, setCompetitorMin] = useState('');
  const [competitorMax, setCompetitorMax] = useState('');
  const [profitMargin, setProfitMargin] = useState('');
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
        }),
      });
      if (res.status === 401) { router.push('/login'); return; }
      if (res.status === 403) { setError('You have insufficient credits. Please upgrade.'); return; }
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Something went wrong.');
        return;
      }
      const data = await res.json();
      setResult(data);
      fetchCredits();
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Pricing Advisor</h1>
          <p className="mt-2 text-muted-foreground">Get a suggested price and profit analysis for your product.</p>
          {credits !== null && (
            <p className="mt-2 text-sm text-muted-foreground">{credits} Credits Left</p>
          )}
        </div>

        <Card className="mb-8 rounded-2xl border border-[#d2d2d7] bg-white p-6 shadow-sm">
          <CardHeader className="p-0">
            <CardTitle>Cost Details</CardTitle>
            <CardDescription>Enter your costs to calculate pricing.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="material_cost">Material Cost</Label>
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
                <Label htmlFor="labor_cost">Labor Cost</Label>
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
                <Label htmlFor="shipping_cost">Shipping Cost</Label>
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
                  <Label htmlFor="competitor_min">Competitor Price Min (optional)</Label>
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
                  <Label htmlFor="competitor_max">Competitor Price Max (optional)</Label>
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
                <Label htmlFor="profit_margin">Desired Profit Margin % (optional)</Label>
                <Input
                  id="profit_margin"
                  type="number"
                  step="1"
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(e.target.value)}
                  placeholder="e.g. 40"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full rounded-full bg-primary text-primary-foreground hover:bg-[#0077ed]">
                {loading ? 'Calculating...' : 'Get Pricing Advice'}
              </Button>
            </form>
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          </CardContent>
        </Card>

        {result && (
          <Card className="rounded-2xl border border-[#d2d2d7] bg-white p-6 shadow-sm space-y-3">
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground">Suggested Price</h4>
              <p className="text-2xl font-bold text-secondary-foreground">${Number(result.suggested_price).toFixed(2)}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground">Estimated Profit</h4>
              <p className="text-xl font-semibold text-foreground">${Number(result.estimated_profit).toFixed(2)}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground">Pricing Strategy</h4>
              <p className="text-sm text-foreground">{result.pricing_strategy}</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}