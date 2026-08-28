'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CinematicBackground from '@/components/cinematic/cinematic-background';

export default function AnnouncementPage() {
  const router = useRouter();
  const [shopType, setShopType] = useState('');
  const [announcementType, setAnnouncementType] = useState('welcome');
  const [tone, setTone] = useState('friendly');
  const [announcement, setAnnouncement] = useState('');
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
    setAnnouncement('');
    try {
      const res = await fetch('/api/generate-announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_type: shopType, announcement_type: announcementType, tone }),
      });
      if (res.status === 401) { router.push('/login'); return; }
      if (res.status === 403) { setError('You have insufficient credits. Please upgrade.'); return; }
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Something went wrong.');
        return;
      }
      const data = await res.json();
      setAnnouncement(data.announcement || '');
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
      <CinematicBackground theme="announcement" />
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Announcement Generator</h1>
          <p className="mt-2 text-muted-foreground">Create welcome, promo, or about us text for your shop.</p>
          {credits !== null && (
            <p className="mt-2 text-sm text-muted-foreground">{credits} Credits Left</p>
          )}
        </div>

        <Card className="mb-8 rounded-2xl border-white/15 bg-white/[0.04] p-6 shadow-sm">
          <CardHeader className="p-0">
            <CardTitle>Announcement Details</CardTitle>
            <CardDescription>Describe your shop and choose the type.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="shop_type">Shop Type</Label>
                <Input
                  id="shop_type"
                  value={shopType}
                  onChange={(e) => setShopType(e.target.value)}
                  placeholder="e.g. Handmade jewelry, Home decor"
                  required
                />
              </div>
              <div>
                <Label htmlFor="announcement_type">Announcement Type</Label>
                <Select value={announcementType} onValueChange={setAnnouncementType}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Welcome</SelectItem>
                    <SelectItem value="promo">Promo / Sale</SelectItem>
                    <SelectItem value="about">About Us</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tone">Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger><SelectValue placeholder="Select tone" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="playful">Playful</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={loading} className="w-full rounded-full bg-primary text-primary-foreground hover:bg-[#d9560f]">
                {loading ? 'Generating...' : 'Generate Announcement'}
              </Button>
            </form>
            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
          </CardContent>
        </Card>

        {announcement && (
          <Card className="rounded-2xl border-white/15 bg-white/[0.04] p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <p className="text-sm text-foreground whitespace-pre-wrap">{announcement}</p>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(announcement)} className="ml-2">Copy</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}