'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useI18n } from '@/lib/i18n/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertTriangle, Check, Loader2, RefreshCw, ShoppingBag, Trash2 } from 'lucide-react'

type Connection = { id: number; shop_domain: string; scopes: string; created_at: string }

const REQUIRED_SCOPES = ['write_products', 'read_products', 'read_orders', 'read_inventory', 'write_inventory']

function normalizeShop(input: string): string | null {
  let s = input.trim().toLowerCase()
  if (!s) return null
  s = s.replace(/^https?:\/\//, '').split('/')[0]
  if (s.includes('myshopify.com')) return s
  if (s.includes('.')) return s
  return `${s}.myshopify.com`
}

function scopeSet(scopes: string) {
  return new Set(String(scopes || '').split(',').map((scope) => scope.trim()).filter(Boolean))
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

  const reconnectCount = useMemo(() => connections.filter((connection) => {
    const granted = scopeSet(connection.scopes)
    return REQUIRED_SCOPES.some((scope) => !granted.has(scope))
  }).length, [connections])

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
    if (status === 'connected') setMessage(t('account.shopifyConnected'))
    else if (status === 'error') setError(t('account.shopifyError'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const startConnect = (shop: string) => {
    setConnecting(true)
    setError(null)
    const connectUrl = new URL('/api/shopify/connect', window.location.origin)
    connectUrl.searchParams.set('shop', shop)
    window.location.assign(connectUrl.toString())
  }

  const handleConnect = () => {
    const shop = normalizeShop(shopDomain)
    if (!shop) {
      setError(t('account.shopifyInvalid'))
      return
    }
    startConnect(shop)
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
      if (res.ok) setConnections((prev) => prev.filter((c) => c.id !== id))
      else {
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
            onKeyDown={(e) => { if (e.key === 'Enter') handleConnect() }}
          />
          <Button type="button" onClick={handleConnect} disabled={connecting}>
            {connecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingBag className="mr-2 h-4 w-4" />}
            {t('account.shopifyConnect')}
          </Button>
        </div>
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        {message && <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{message}</p>}
        {reconnectCount > 0 && <div className="flex gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" /><p>Some existing Shopify connections were authorized before Craftly added order and inventory features. Reconnect those stores once to grant the new scopes.</p></div>}
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />{t('dashboard.processing')}</div>
        ) : connections.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('account.shopifyNone')}</p>
        ) : (
          connections.map((c) => {
            const granted = scopeSet(c.scopes)
            const missing = REQUIRED_SCOPES.filter((scope) => !granted.has(scope))
            return (
              <div key={c.id} className="rounded-lg border border-border bg-secondary px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3"><Check className="h-4 w-4 shrink-0 text-emerald-500" /><span className="truncate text-sm font-medium text-foreground">{c.shop_domain}</span></div>
                  <div className="flex items-center gap-1">
                    {missing.length > 0 && <Button type="button" variant="outline" size="sm" onClick={() => startConnect(c.shop_domain)} disabled={connecting}><RefreshCw className="mr-1 h-3.5 w-3.5" />Reconnect</Button>}
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleDisconnect(c.id)} disabled={disconnectingId === c.id} className="text-muted-foreground hover:text-destructive">
                      {disconnectingId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      <span className="sr-only">{t('account.shopifyDisconnect')}</span>
                    </Button>
                  </div>
                </div>
                {missing.length > 0 && <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">Reconnect required for: {missing.join(', ')}</p>}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
