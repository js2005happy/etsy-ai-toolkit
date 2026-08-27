'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function KeywordsPage() {
  const router = useRouter();
  const [productType, setProductType] = useState('');
  const [market, setMarket] = useState('');
  const [style, setStyle] = useState('');
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
        body: JSON.stringify({ product_type: productType, market, style }),
      });
      if (res.status === 401) { router.push('/login'); return; }
      if (res.status === 403) { setError('You have insufficient credits. Please upgrade.'); return; }
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Something went wrong.');
        return;
      }
      const data = await res.json();
      setKeywords(data.keywords || []);
      fetchCredits();
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const copyAll = () => {
    navigator.clipboard.writeText(keywords.join('\n'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-50 py-10">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-stone-900">Keyword Research Tool</h1>
          <p className="mt-2 text-stone-600">Find high-search-volume keywords for your products.</p>
          {credits !== null && (
            <p className="mt-2 text-sm text-stone-500">{credits} Credits Left</p>
          )}
        </div>

        <Card className="mb-8 rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
          <CardHeader className="p-0">
            <CardTitle>Product Details</CardTitle>
            <CardDescription>Describe your product to get relevant keywords.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="product_type">Product Type</Label>
                <Input
                  id="product_type"
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  placeholder="e.g. handmade soap, ceramic mug"
                  required
                />
              </div>
              <div>
                <Label htmlFor="market">Target Market (optional)</Label>
                <Input
                  id="market"
                  value={market}
                  onChange={(e) => setMarket(e.target.value)}
                  placeholder="e.g. US, Europe, gifts for women"
                />
              </div>
              <div>
                <Label htmlFor="style">Style (optional)</Label>
                <Input
                  id="style"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  placeholder="e.g. minimalist, boho, vintage"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full rounded-full bg-amber-600 text-white hover:bg-amber-700">
                {loading ? 'Generating...' : 'Generate Keywords'}
              </Button>
            </form>
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          </CardContent>
        </Card>

        {keywords.length > 0 && (
          <Card className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Suggested Keywords</h3>
              <Button variant="ghost" size="sm" onClick={copyAll}>Copy All</Button>
            </div>
            <ul className="space-y-2">
              {keywords.map((keyword, index) => (
                <li key={index} className="rounded-lg bg-stone-50 px-3 py-2 text-sm text-stone-700">{keyword}</li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}