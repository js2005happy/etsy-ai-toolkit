'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { useI18n } from '@/lib/i18n/client'

export default function ContactForm() {
  const { t } = useI18n()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, website }),
      })
      if (!res.ok) {
        setStatus('error')
        return
      }
      setStatus('sent')
      setName('')
      setEmail('')
      setMessage('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
      {/* Honeypot field — hidden from humans */}
      <div className="hidden" aria-hidden="true">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">{t("marketing.contact.name")}</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("marketing.contact.namePh")}
          required
          autoComplete="name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{t("marketing.contact.email")}</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("marketing.contact.emailPh")}
          required
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">{t("marketing.contact.message")}</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("marketing.contact.messagePh")}
          rows={5}
          required
        />
      </div>

      {status === 'error' && (
        <p className="text-sm font-medium text-destructive">
          {t("marketing.contact.error")}
        </p>
      )}
      {status === 'sent' && (
        <p className="text-sm font-medium text-emerald-400">
          {t("marketing.contact.sent")}
        </p>
      )}

      <Button type="submit" disabled={status === 'sending'} className="w-full sm:w-auto">
        {status === 'sending' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("marketing.contact.sending")}
          </>
        ) : (
          t("marketing.contact.send")
        )}
      </Button>
    </form>
  )
}
