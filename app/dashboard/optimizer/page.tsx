'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CinematicBackground from '@/components/cinematic/cinematic-background';
import PlatformSelect from '@/components/dashboard/platform-select';
import { useI18n } from '@/lib/i18n/client';

export default function OptimizerPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentDescription, setCurrentDescription] = useState('');
  const [currentTags, setCurrentTags] = useState('');
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
      const res = await fetch('/api/optimize-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_title: currentTitle, current_description: currentDescription, current_tags: currentTags, platform }),
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen py-10">
      <CinematicBackground theme="optimizer" />
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">{t('dashboardTools.optimizer.h1')}</h1>
          <p className="mt-2 text-muted-foreground">{t('dashboardTools.optimizer.sub')}</p>
          {credits !== null && (
            <p className="mt-2 text-sm text-muted-foreground">{credits} {t('dashboardTools.common.creditsLeft')}</p>
          )}
        </div>

        <Card className="mb-8 rounded-xl border-border bg-card p-6">
          <CardHeader className="p-0">
            <CardTitle>{t('dashboardTools.optimizer.currentListing')}</CardTitle>
            <CardDescription>{t('dashboardTools.optimizer.currentListingDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="current_title">{t('dashboardTools.optimizer.currentTitle')}</Label>
                <Input
                  id="current_title"
                  value={currentTitle}
                  onChange={(e) => setCurrentTitle(e.target.value)}
                  placeholder={t('dashboardTools.optimizer.currentTitlePh')}
                />
              </div>
              <div>
                <Label htmlFor="current_description">{t('dashboardTools.optimizer.currentDesc')}</Label>
                <Textarea
                  id="current_description"
                  value={currentDescription}
                  onChange={(e) => setCurrentDescription(e.target.value)}
                  placeholder={t('dashboardTools.optimizer.currentDescPh')}
                />
              </div>
              <div>
                <Label htmlFor="current_tags">{t('dashboardTools.optimizer.currentTags')}</Label>
                <Input
                  id="current_tags"
                  value={currentTags}
                  onChange={(e) => setCurrentTags(e.target.value)}
                  placeholder={t('dashboardTools.optimizer.currentTagsPh')}
                />
              </div>
              <PlatformSelect value={platform} onChange={setPlatform} />
              <Button type="submit" disabled={loading} className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                {loading ? t('dashboardTools.optimizer.optimizing') : t('dashboardTools.optimizer.optimize')}
              </Button>
            </form>
            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>

        {result && (
          <div className="space-y-4">
            {result.title && (
              <Card className="rounded-xl border-border bg-card p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">{t('dashboardTools.optimizer.optTitle')}</h4>
                    <p className="text-sm text-foreground">{result.title}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(result.title)} className="ml-2">{t('dashboardTools.common.copy')}</Button>
                </div>
              </Card>
            )}
            {result.description && (
              <Card className="rounded-xl border-border bg-card p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">{t('dashboardTools.optimizer.optDesc')}</h4>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{result.description}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(result.description)} className="ml-2">{t('dashboardTools.common.copy')}</Button>
                </div>
              </Card>
            )}
            {result.tags && result.tags.length > 0 && (
              <Card className="rounded-xl border-border bg-card p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">{t('dashboardTools.optimizer.optTags')}</h4>
                    <p className="text-sm text-foreground">{result.tags.join(', ')}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(result.tags.join(', '))} className="ml-2">{t('dashboardTools.common.copy')}</Button>
                </div>
              </Card>
            )}
            {result.suggestions && (
              <Card className="rounded-xl border-border bg-card p-4">
                <h4 className="font-semibold text-sm text-secondary-foreground mb-1">{t('dashboardTools.optimizer.suggestions')}</h4>
                <p className="text-sm text-foreground">{result.suggestions}</p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
