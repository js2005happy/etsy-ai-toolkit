'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CinematicBackground from '@/components/cinematic/cinematic-background';
import PlatformSelect from '@/components/dashboard/platform-select';
import { useI18n } from '@/lib/i18n/client';

export default function ReviewReplyPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState('5');
  const [tone, setTone] = useState('friendly');
  const [platform, setPlatform] = useState('etsy');
  const [replies, setReplies] = useState<string[]>([]);
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
    setReplies([]);
    try {
      const res = await fetch('/api/generate-review-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_text: reviewText, rating: parseInt(rating), tone, platform }),
      });
      if (res.status === 401) { router.push('/login'); return; }
      if (res.status === 403) { setError(t('dashboardTools.common.insufficientCredits')); return; }
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || t('dashboardTools.common.somethingWrong'));
        return;
      }
      const data = await res.json();
      setReplies(data.replies || []);
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
      <CinematicBackground theme="reviews" />
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">{t('dashboardTools.reviews.h1')}</h1>
          <p className="mt-2 text-muted-foreground">{t('dashboardTools.reviews.sub')}</p>
          {credits !== null && (
            <p className="mt-2 text-sm text-muted-foreground">{credits} {t('dashboardTools.common.creditsLeft')}</p>
          )}
        </div>

        <Card className="mb-8 rounded-xl border-border bg-card p-6">
          <CardHeader className="p-0">
            <CardTitle>{t('dashboardTools.reviews.details')}</CardTitle>
            <CardDescription>{t('dashboardTools.reviews.detailsDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="review_text">{t('dashboardTools.reviews.reviewText')}</Label>
                <Textarea
                  id="review_text"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder={t('dashboardTools.reviews.reviewTextPh')}
                  required
                />
              </div>
              <div>
                <Label htmlFor="rating">{t('dashboardTools.reviews.rating')}</Label>
                <Select value={rating} onValueChange={setRating}>
                  <SelectTrigger><SelectValue placeholder={t('dashboardTools.reviews.selectRating')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">{t('dashboardTools.reviews.r5')}</SelectItem>
                    <SelectItem value="4">{t('dashboardTools.reviews.r4')}</SelectItem>
                    <SelectItem value="3">{t('dashboardTools.reviews.r3')}</SelectItem>
                    <SelectItem value="2">{t('dashboardTools.reviews.r2')}</SelectItem>
                    <SelectItem value="1">{t('dashboardTools.reviews.r1')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tone">{t('dashboardTools.common.tone')}</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger><SelectValue placeholder={t('dashboardTools.reviews.selectTone')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">{t('dashboardTools.common.friendly')}</SelectItem>
                    <SelectItem value="professional">{t('dashboardTools.common.professional')}</SelectItem>
                    <SelectItem value="apologetic">{t('dashboardTools.common.apologetic')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <PlatformSelect value={platform} onChange={setPlatform} />
              <Button type="submit" disabled={loading} className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                {loading ? t('dashboardTools.reviews.generating') : t('dashboardTools.reviews.generate')}
              </Button>
            </form>
            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>

        {replies.length > 0 && (
          <div className="space-y-4">
            {replies.map((reply, index) => (
              <Card key={index} className="rounded-xl border-border bg-card p-4">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{reply}</p>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(reply)} className="ml-2">{t('dashboardTools.common.copy')}</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
