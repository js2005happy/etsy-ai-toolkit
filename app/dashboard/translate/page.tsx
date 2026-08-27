'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TranslatePage() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('German');
  const [translatedText, setTranslatedText] = useState('');
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
    setTranslatedText('');
    try {
      const res = await fetch('/api/translate-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, target_language: targetLanguage }),
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
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-stone-50 py-10">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-stone-900">Listing Translator</h1>
          <p className="mt-2 text-stone-600">Translate your listing into multiple languages.</p>
          {credits !== null && (
            <p className="mt-2 text-sm text-stone-500">{credits} Credits Left</p>
          )}
        </div>

        <Card className="mb-8 rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
          <CardHeader className="p-0">
            <CardTitle>Translation Details</CardTitle>
            <CardDescription>Enter text and choose target language.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
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
              <div>
                <Label htmlFor="target_language">Target Language</Label>
                <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="German">German</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="Italian">Italian</SelectItem>
                    <SelectItem value="Japanese">Japanese</SelectItem>
                    <SelectItem value="Dutch">Dutch</SelectItem>
                    <SelectItem value="Portuguese">Portuguese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={loading} className="w-full rounded-full bg-amber-600 text-white hover:bg-amber-700">
                {loading ? 'Translating...' : 'Translate'}
              </Button>
            </form>
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          </CardContent>
        </Card>

        {translatedText && (
          <Card className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <p className="text-sm text-stone-700 whitespace-pre-wrap">{translatedText}</p>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(translatedText)} className="ml-2">Copy</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}