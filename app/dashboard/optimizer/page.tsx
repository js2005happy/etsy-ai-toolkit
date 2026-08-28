'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function OptimizerPage() {
  const router = useRouter();
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentDescription, setCurrentDescription] = useState('');
  const [currentTags, setCurrentTags] = useState('');
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
      const res = await fetch('/api/optimize-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_title: currentTitle, current_description: currentDescription, current_tags: currentTags }),
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen py-10">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Listing Optimizer</h1>
          <p className="mt-2 text-muted-foreground">Improve your existing Etsy listing for better SEO.</p>
          {credits !== null && (
            <p className="mt-2 text-sm text-muted-foreground">{credits} Credits Left</p>
          )}
        </div>

        <Card className="mb-8 rounded-2xl border border-[#d2d2d7] bg-white p-6 shadow-sm">
          <CardHeader className="p-0">
            <CardTitle>Current Listing</CardTitle>
            <CardDescription>Paste any part of your listing. Leave blank if not available.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="current_title">Current Title (optional)</Label>
                <Input
                  id="current_title"
                  value={currentTitle}
                  onChange={(e) => setCurrentTitle(e.target.value)}
                  placeholder="e.g. Blue ceramic mug, handmade coffee cup"
                />
              </div>
              <div>
                <Label htmlFor="current_description">Current Description (optional)</Label>
                <Textarea
                  id="current_description"
                  value={currentDescription}
                  onChange={(e) => setCurrentDescription(e.target.value)}
                  placeholder="Paste your current description..."
                />
              </div>
              <div>
                <Label htmlFor="current_tags">Current Tags (optional)</Label>
                <Input
                  id="current_tags"
                  value={currentTags}
                  onChange={(e) => setCurrentTags(e.target.value)}
                  placeholder="e.g. handmade, mug, ceramic, coffee, gift"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full rounded-full bg-primary text-primary-foreground hover:bg-[#0077ed]">
                {loading ? 'Optimizing...' : 'Optimize Listing'}
              </Button>
            </form>
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          </CardContent>
        </Card>

        {result && (
          <div className="space-y-4">
            {result.title && (
              <Card className="rounded-2xl border border-[#d2d2d7] bg-white p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Optimized Title</h4>
                    <p className="text-sm text-foreground">{result.title}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(result.title)} className="ml-2">Copy</Button>
                </div>
              </Card>
            )}
            {result.description && (
              <Card className="rounded-2xl border border-[#d2d2d7] bg-white p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Optimized Description</h4>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{result.description}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(result.description)} className="ml-2">Copy</Button>
                </div>
              </Card>
            )}
            {result.tags && result.tags.length > 0 && (
              <Card className="rounded-2xl border border-[#d2d2d7] bg-white p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Optimized Tags</h4>
                    <p className="text-sm text-foreground">{result.tags.join(', ')}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(result.tags.join(', '))} className="ml-2">Copy</Button>
                </div>
              </Card>
            )}
            {result.suggestions && (
              <Card className="rounded-2xl border border-[#d2d2d7] bg-[#f5f5f7] p-4 shadow-sm">
                <h4 className="font-semibold text-sm text-secondary-foreground mb-1">Improvement Suggestions</h4>
                <p className="text-sm text-foreground">{result.suggestions}</p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}