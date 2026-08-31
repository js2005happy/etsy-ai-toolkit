'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CinematicBackground from '@/components/cinematic/cinematic-background';
import PlatformSelect from '@/components/dashboard/platform-select';

const LANGUAGES = ['German', 'French', 'Spanish', 'Italian', 'Japanese', 'Dutch', 'Portuguese'];

function compressImage(file: File, maxDim = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > height && width > maxDim) {
        height = Math.round((height * maxDim) / width);
        width = maxDim;
      } else if (height >= width && height > maxDim) {
        width = Math.round((width * maxDim) / height);
        height = maxDim;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { URL.revokeObjectURL(url); reject(new Error('Canvas not supported')); return; }
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
    img.src = url;
  });
}

export default function TranslatePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [text, setText] = useState('');
  const [image, setImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('German');
  const [platform, setPlatform] = useState('etsy');
  const [translatedText, setTranslatedText] = useState('');
  const [extractedText, setExtractedText] = useState('');
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImage(file);
      setImage(dataUrl);
      setImagePreview(dataUrl);
      setError('');
    } catch {
      setError('Failed to process image.');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTranslatedText('');
    setExtractedText('');
    try {
      const payload = mode === 'image'
        ? { image, target_language: targetLanguage }
        : { text, target_language: targetLanguage, platform };
      const endpoint = mode === 'image' ? '/api/translate-image' : '/api/translate-listing';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) { router.push('/login'); return; }
      if (res.status === 403) { setError('You have insufficient credits. Please upgrade.'); return; }
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Something went wrong.');
        return;
      }
      const data = await res.json();
      setTranslatedText(data.translated_text || '');
      if (data.extracted_text) setExtractedText(data.extracted_text);
      fetchCredits();
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (t: string) => {
    navigator.clipboard.writeText(t);
  };

  return (
    <div className="min-h-screen py-10">
      <CinematicBackground theme="translate" />
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Listing Translator</h1>
          <p className="mt-2 text-muted-foreground">Translate your listing text or an image poster into multiple languages.</p>
          {credits !== null && (
            <p className="mt-2 text-sm text-muted-foreground">{credits} Credits Left</p>
          )}
        </div>

        <Card className="mb-8 rounded-xl border-border bg-card p-6">
          <CardHeader className="p-0">
            <CardTitle>Translation Details</CardTitle>
            <CardDescription>Enter text or upload an image, then choose a target language.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <div className="mb-5 flex gap-2">
              <button
                type="button"
                onClick={() => setMode('text')}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${mode === 'text' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
              >
                Text
              </button>
              <button
                type="button"
                onClick={() => setMode('image')}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${mode === 'image' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
              >
                Image poster
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === 'text' ? (
                <div>
                  <Label htmlFor="text">Text to Translate</Label>
                  <Textarea
                    id="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste your listing title, description, or tags..."
                    required
                  />
                </div>
              ) : (
                <div>
                  <Label>Poster image</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-2 block w-full text-sm text-muted-foreground file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:opacity-90"
                  />
                  {imagePreview && (
                    <div className="mt-3 overflow-hidden rounded-lg border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imagePreview} alt="Poster preview" className="max-h-64 w-full bg-secondary/50 object-contain" />
                    </div>
                  )}
                </div>
              )}

              {mode === 'text' && <PlatformSelect value={platform} onChange={setPlatform} />}
              <div>
                <Label htmlFor="target_language">Target Language</Label>
                <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                disabled={loading || (mode === 'image' && !image)}
                className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? 'Translating...' : 'Translate'}
              </Button>
            </form>
            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>

        {extractedText && (
          <Card className="mb-4 rounded-xl border-border bg-card p-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Extracted text</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{extractedText}</p>
          </Card>
        )}

        {translatedText && (
          <Card className="rounded-xl border-border bg-card p-6">
            <div className="flex justify-between items-start">
              <p className="text-sm text-foreground whitespace-pre-wrap">{translatedText}</p>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(translatedText)} className="ml-2">Copy</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
