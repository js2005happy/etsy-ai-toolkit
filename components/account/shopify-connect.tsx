'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useI18n } from '@/lib/i18n/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, ShoppingBag, Check, Trash2 } from 'lucide-react'

type Connection = { id: number; shop_domain: string; scopes: string; created_at: string }

function normalizeShop(input: string): string | null {
  let s = input.trim().toLowerCase()
  if (!s) return null
  s = s.replace(/^https?:\/\//, '').split('/')[0]
  if (s.includes('myshopify.com')) return s
  if (s.includes('.')) return s
  return `${s}.myshopify.com`
}

export default function ShopifyConnect() {
  const { t } = useI18n()
  const searchParams = useSearchParams()

  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [shopDomain, setShopDomain] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [disconnectingId, setDisconnectingId] = useState<number | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadConnections = () => {
    fetch('/api/shopify/connections')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setConnections(data?.connections ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadConnections()
    const status = searchParams.get('shopify')
    if (status === 'connected') {
      setMessage(t('account.shopifyConnected'))
    } else if (status === 'error') {
      setError(t('account.shopifyError'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const handleConnect = () => {
    const shop = normalizeShop(shopDomain)
    if (!shop) {
      setError(t('account.shopifyInvalid'))
      return
    }
    setConnecting(true)
    setError(null)
    window.location.href = `/api/shopify/connect?shop=${encodeURIComponent(shop)}`
  }

  const handleDisconnect = async (id: number) => {
    setDisconnectingId(id)
    setError(null)
    try {
      const res = await fetch('/api/shopify/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        setConnections((prev) => prev.filter((c) => c.id !== id))
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data?.error || t('auth.unexpectedError'))
      }
    } catch {
      setError(t('auth.unexpectedError'))
    } finally {
      setDisconnectingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={shopDomain}
            onChange={(e) => setShopDomain(e.target.value)}
            placeholder={t('account.shopifyPlaceholder')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleConnect()
            }}
          />
          <Button type="button" onClick={handleConnect} disabled={connecting}>
            {connecting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ShoppingBag className="mr-2 h-4 w-4" />
            )}
            {t('account.shopifyConnect')}
          </Button>
        </div>
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        {message && <p className="text-sm font-medium text-emerald-400">{message}</p>}
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('dashboard.processing')}
          </div>
        ) : connections.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('account.shopifyNone')}</p>
        ) : (
          connections.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                <span className="truncate text-sm font-medium text-foreground">{c.shop_domain}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleDisconnect(c.id)}
                disabled={disconnectingId === c.id}
                className="text-muted-foreground hover:text-destructive"
              >
                {disconnectingId === c.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                <span className="sr-only">{t('account.shopifyDisconnect')}</span>
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
