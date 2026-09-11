'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Loader2, Plug, RefreshCw, Save, Store, Unplug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useI18n } from '@/lib/i18n/client'
import type { Locale } from '@/lib/i18n/locales'

const EBAY_REQUIRED_SCOPES = ['sell.inventory', 'sell.account', 'sell.fulfillment']

const copy: Record<Locale, Record<string, string>> = {
  en:{more:'More sales channels',moreDesc:'Connect stores here. WooCommerce/eBay credentials are encrypted server-side and never returned to the browser.',connected:'Connected channels',managed:'WooCommerce and eBay connections managed by the multichannel layer.',refresh:'Refresh',none:'No additional commerce channels connected yet.',disconnect:'Disconnect',wooDesc:'Use REST API read/write keys from your WooCommerce store. The connection is verified before saving.',storeUrl:'Store URL',label:'Label (optional)',consumerKey:'Consumer key',consumerSecret:'Consumer secret',connectWoo:'Connect WooCommerce',ebayDesc:'Connect through eBay OAuth, then provide the selling policies eBay requires before publishing.',ebayOAuth:'OAuth gives Craftly inventory, account and fulfillment access without sharing your eBay password.',connectEbay:'Connect eBay',connectedAs:'Connected as',reconnectNeed:'This eBay connection needs updated permissions. Reconnect once to grant:',reconnect:'Reconnect eBay',marketplace:'Marketplace',location:'Merchant location key',fulfillment:'Fulfillment policy ID',payment:'Payment policy ID',returns:'Return policy ID',category:'Default category ID (optional)',save:'Save eBay publishing settings',wooSaved:'WooCommerce connection verified and saved.',ebaySaved:'eBay publishing settings saved.'},
  zh:{more:'更多销售渠道',moreDesc:'在这里连接店铺。WooCommerce/eBay 凭据会在服务器端加密保存，不会返回到浏览器。',connected:'已连接渠道',managed:'WooCommerce 和 eBay 由多渠道连接层统一管理。',refresh:'刷新',none:'暂未连接其他电商渠道。',disconnect:'断开连接',wooDesc:'使用 WooCommerce 店铺的读写 REST API 密钥。保存前会先验证连接。',storeUrl:'店铺网址',label:'店铺备注（可选）',consumerKey:'Consumer Key',consumerSecret:'Consumer Secret',connectWoo:'连接 WooCommerce',ebayDesc:'通过 eBay OAuth 连接，然后填写发布商品所需的销售政策。',ebayOAuth:'OAuth 可让 Craftly 访问库存、账户和履约信息，无需共享你的 eBay 密码。',connectEbay:'连接 eBay',connectedAs:'当前连接',reconnectNeed:'该 eBay 连接需要更新权限，请重新授权一次：',reconnect:'重新连接 eBay',marketplace:'Marketplace',location:'商家位置 Key',fulfillment:'履约政策 ID',payment:'付款政策 ID',returns:'退货政策 ID',category:'默认分类 ID（可选）',save:'保存 eBay 发布设置',wooSaved:'WooCommerce 连接已验证并保存。',ebaySaved:'eBay 发布设置已保存。'},
  de:{more:'Weitere Vertriebskanäle',moreDesc:'Shops hier verbinden. WooCommerce/eBay-Zugangsdaten werden serverseitig verschlüsselt.',connected:'Verbundene Kanäle',managed:'WooCommerce- und eBay-Verbindungen werden zentral verwaltet.',refresh:'Aktualisieren',none:'Noch keine weiteren Kanäle verbunden.',disconnect:'Trennen',wooDesc:'REST-API-Schlüssel mit Lese-/Schreibzugriff verwenden. Verbindung wird vor dem Speichern geprüft.',storeUrl:'Shop-URL',label:'Bezeichnung (optional)',consumerKey:'Consumer Key',consumerSecret:'Consumer Secret',connectWoo:'WooCommerce verbinden',ebayDesc:'eBay per OAuth verbinden und anschließend erforderliche Verkaufsrichtlinien angeben.',ebayOAuth:'OAuth gewährt Craftly Zugriff auf Bestand, Konto und Fulfillment ohne Passwortfreigabe.',connectEbay:'eBay verbinden',connectedAs:'Verbunden als',reconnectNeed:'Diese eBay-Verbindung benötigt aktualisierte Berechtigungen:',reconnect:'eBay neu verbinden',marketplace:'Marketplace',location:'Merchant Location Key',fulfillment:'Fulfillment Policy ID',payment:'Payment Policy ID',returns:'Return Policy ID',category:'Standard-Kategorie-ID (optional)',save:'eBay-Einstellungen speichern',wooSaved:'WooCommerce-Verbindung geprüft und gespeichert.',ebaySaved:'eBay-Einstellungen gespeichert.'},
  fr:{more:'Autres canaux de vente',moreDesc:'Connectez vos boutiques ici. Les identifiants WooCommerce/eBay sont chiffrés côté serveur.',connected:'Canaux connectés',managed:'Connexions WooCommerce et eBay gérées par la couche multicanal.',refresh:'Actualiser',none:'Aucun autre canal connecté.',disconnect:'Déconnecter',wooDesc:'Utilisez des clés REST API lecture/écriture. La connexion est vérifiée avant enregistrement.',storeUrl:'URL de la boutique',label:'Libellé (facultatif)',consumerKey:'Consumer key',consumerSecret:'Consumer secret',connectWoo:'Connecter WooCommerce',ebayDesc:'Connectez eBay via OAuth puis renseignez les politiques de vente nécessaires.',ebayOAuth:'OAuth donne accès au stock, au compte et à l’exécution sans partager votre mot de passe eBay.',connectEbay:'Connecter eBay',connectedAs:'Connecté en tant que',reconnectNeed:'Cette connexion eBay nécessite de nouvelles autorisations :',reconnect:'Reconnecter eBay',marketplace:'Marketplace',location:'Clé de localisation vendeur',fulfillment:'ID de politique d’expédition',payment:'ID de politique de paiement',returns:'ID de politique de retour',category:'ID catégorie par défaut (facultatif)',save:'Enregistrer les paramètres eBay',wooSaved:'Connexion WooCommerce vérifiée et enregistrée.',ebaySaved:'Paramètres eBay enregistrés.'},
  es:{more:'Más canales de venta',moreDesc:'Conecta tiendas aquí. Las credenciales de WooCommerce/eBay se cifran en el servidor.',connected:'Canales conectados',managed:'WooCommerce y eBay se gestionan desde la capa multicanal.',refresh:'Actualizar',none:'Aún no hay canales adicionales conectados.',disconnect:'Desconectar',wooDesc:'Usa claves REST API de lectura/escritura. La conexión se verifica antes de guardarla.',storeUrl:'URL de la tienda',label:'Etiqueta (opcional)',consumerKey:'Consumer key',consumerSecret:'Consumer secret',connectWoo:'Conectar WooCommerce',ebayDesc:'Conecta eBay mediante OAuth y añade las políticas de venta necesarias.',ebayOAuth:'OAuth permite acceso a inventario, cuenta y cumplimiento sin compartir tu contraseña.',connectEbay:'Conectar eBay',connectedAs:'Conectado como',reconnectNeed:'Esta conexión de eBay necesita permisos actualizados:',reconnect:'Reconectar eBay',marketplace:'Marketplace',location:'Clave de ubicación del vendedor',fulfillment:'ID de política de envío',payment:'ID de política de pago',returns:'ID de política de devoluciones',category:'ID de categoría predeterminado (opcional)',save:'Guardar ajustes de eBay',wooSaved:'Conexión WooCommerce verificada y guardada.',ebaySaved:'Ajustes de eBay guardados.'},
  ja:{more:'その他の販売チャネル',moreDesc:'ここでストアを接続します。WooCommerce/eBay の認証情報はサーバー側で暗号化されます。',connected:'接続済みチャネル',managed:'WooCommerce と eBay はマルチチャネル層で管理されます。',refresh:'更新',none:'追加チャネルはまだ接続されていません。',disconnect:'切断',wooDesc:'読み書き可能な REST API キーを使用します。保存前に接続を確認します。',storeUrl:'ストア URL',label:'ラベル（任意）',consumerKey:'Consumer key',consumerSecret:'Consumer secret',connectWoo:'WooCommerce を接続',ebayDesc:'eBay OAuth で接続し、公開に必要な販売ポリシーを設定します。',ebayOAuth:'OAuth により、パスワードを共有せず在庫・アカウント・フルフィルメントへアクセスできます。',connectEbay:'eBay を接続',connectedAs:'接続中',reconnectNeed:'この eBay 接続には追加権限が必要です：',reconnect:'eBay を再接続',marketplace:'Marketplace',location:'販売者ロケーションキー',fulfillment:'配送ポリシー ID',payment:'支払いポリシー ID',returns:'返品ポリシー ID',category:'既定カテゴリ ID（任意）',save:'eBay 公開設定を保存',wooSaved:'WooCommerce 接続を確認して保存しました。',ebaySaved:'eBay 公開設定を保存しました。'},
  it:{more:'Altri canali di vendita',moreDesc:'Collega qui i negozi. Le credenziali WooCommerce/eBay vengono cifrate lato server.',connected:'Canali collegati',managed:'WooCommerce ed eBay sono gestiti dal livello multicanale.',refresh:'Aggiorna',none:'Nessun canale aggiuntivo collegato.',disconnect:'Disconnetti',wooDesc:'Usa chiavi REST API in lettura/scrittura. La connessione viene verificata prima del salvataggio.',storeUrl:'URL negozio',label:'Etichetta (opzionale)',consumerKey:'Consumer key',consumerSecret:'Consumer secret',connectWoo:'Collega WooCommerce',ebayDesc:'Collega eBay tramite OAuth e inserisci le policy richieste per pubblicare.',ebayOAuth:'OAuth consente accesso a inventario, account e fulfillment senza condividere la password eBay.',connectEbay:'Collega eBay',connectedAs:'Collegato come',reconnectNeed:'Questa connessione eBay richiede permessi aggiornati:',reconnect:'Ricollega eBay',marketplace:'Marketplace',location:'Merchant location key',fulfillment:'ID policy fulfillment',payment:'ID policy pagamento',returns:'ID policy reso',category:'ID categoria predefinita (opzionale)',save:'Salva impostazioni eBay',wooSaved:'Connessione WooCommerce verificata e salvata.',ebaySaved:'Impostazioni eBay salvate.'},
  ko:{more:'추가 판매 채널',moreDesc:'여기에서 스토어를 연결하세요. WooCommerce/eBay 자격 증명은 서버에서 암호화됩니다.',connected:'연결된 채널',managed:'WooCommerce와 eBay 연결은 멀티채널 계층에서 관리됩니다.',refresh:'새로고침',none:'아직 추가 채널이 연결되지 않았습니다.',disconnect:'연결 해제',wooDesc:'읽기/쓰기 REST API 키를 사용합니다. 저장 전에 연결을 확인합니다.',storeUrl:'스토어 URL',label:'라벨(선택)',consumerKey:'Consumer key',consumerSecret:'Consumer secret',connectWoo:'WooCommerce 연결',ebayDesc:'eBay OAuth로 연결한 뒤 게시에 필요한 판매 정책을 설정합니다.',ebayOAuth:'OAuth를 통해 eBay 비밀번호 공유 없이 재고, 계정, 주문 처리 권한을 부여합니다.',connectEbay:'eBay 연결',connectedAs:'연결 계정',reconnectNeed:'이 eBay 연결은 추가 권한이 필요합니다:',reconnect:'eBay 다시 연결',marketplace:'Marketplace',location:'판매자 위치 키',fulfillment:'배송 정책 ID',payment:'결제 정책 ID',returns:'반품 정책 ID',category:'기본 카테고리 ID(선택)',save:'eBay 게시 설정 저장',wooSaved:'WooCommerce 연결을 확인하고 저장했습니다.',ebaySaved:'eBay 게시 설정을 저장했습니다.'},
  pt:{more:'Mais canais de venda',moreDesc:'Conecte lojas aqui. As credenciais WooCommerce/eBay ficam criptografadas no servidor.',connected:'Canais conectados',managed:'WooCommerce e eBay são gerenciados pela camada multicanal.',refresh:'Atualizar',none:'Nenhum canal adicional conectado.',disconnect:'Desconectar',wooDesc:'Use chaves REST API de leitura/gravação. A conexão é verificada antes de salvar.',storeUrl:'URL da loja',label:'Rótulo (opcional)',consumerKey:'Consumer key',consumerSecret:'Consumer secret',connectWoo:'Conectar WooCommerce',ebayDesc:'Conecte eBay via OAuth e informe as políticas de venda necessárias.',ebayOAuth:'OAuth permite acesso a estoque, conta e fulfillment sem compartilhar sua senha do eBay.',connectEbay:'Conectar eBay',connectedAs:'Conectado como',reconnectNeed:'Esta conexão eBay precisa de permissões atualizadas:',reconnect:'Reconectar eBay',marketplace:'Marketplace',location:'Chave de localização do vendedor',fulfillment:'ID da política de envio',payment:'ID da política de pagamento',returns:'ID da política de devolução',category:'ID de categoria padrão (opcional)',save:'Salvar configurações do eBay',wooSaved:'Conexão WooCommerce verificada e salva.',ebaySaved:'Configurações do eBay salvas.'},
}

export default function CommerceConnections() {
  const { locale } = useI18n()
  const c = copy[locale]
  const [connections, setConnections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [connectingWoo, setConnectingWoo] = useState(false)
  const [loadingEbaySettings, setLoadingEbaySettings] = useState(false)
  const [savingEbay, setSavingEbay] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [woo, setWoo] = useState({ store_url: '', consumer_key: '', consumer_secret: '', label: '' })
  const [ebay, setEbay] = useState({ marketplace_id: 'EBAY_US', merchant_location_key: '', fulfillment_policy_id: '', payment_policy_id: '', return_policy_id: '', category_id: '' })
  const ebayConnection = useMemo(() => connections.find((connection) => connection.platform === 'ebay'), [connections])
  const ebayMissingScopes = useMemo(() => {
    if (!ebayConnection) return []
    const granted = new Set(Array.isArray(ebayConnection.scopes) ? ebayConnection.scopes : [])
    return EBAY_REQUIRED_SCOPES.filter((scope) => !granted.has(scope))
  }, [ebayConnection])

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/commerce/connections', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || c.none)
      setConnections(data.connections || [])
    } catch (err: any) { setError(err.message || c.none) }
    finally { setLoading(false) }
  }

  useEffect(() => { void load() }, [])

  useEffect(() => {
    if (!ebayConnection?.id) return
    let cancelled = false
    setLoadingEbaySettings(true)
    fetch(`/api/ebay/settings?connection_id=${encodeURIComponent(ebayConnection.id)}`, { cache: 'no-store' })
      .then(async (res) => { const data = await res.json(); if (!res.ok) throw new Error(data.error || 'eBay'); return data.settings })
      .then((settings) => {
        if (cancelled || !settings) return
        setEbay({ marketplace_id: settings.marketplaceId || 'EBAY_US', merchant_location_key: settings.merchantLocationKey || '', fulfillment_policy_id: settings.fulfillmentPolicyId || '', payment_policy_id: settings.paymentPolicyId || '', return_policy_id: settings.returnPolicyId || '', category_id: settings.categoryId || '' })
      })
      .catch((err) => { if (!cancelled) setError(err.message || 'eBay') })
      .finally(() => { if (!cancelled) setLoadingEbaySettings(false) })
    return () => { cancelled = true }
  }, [ebayConnection?.id])

  const connectWoo = async (e: React.FormEvent) => {
    e.preventDefault(); setConnectingWoo(true); setError(''); setSuccess('')
    try {
      const res = await fetch('/api/woocommerce/connect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(woo) })
      const data = await res.json(); if (!res.ok) throw new Error(data.error || 'WooCommerce')
      setWoo({ store_url: '', consumer_key: '', consumer_secret: '', label: '' }); setSuccess(c.wooSaved); await load()
    } catch (err: any) { setError(err.message || 'WooCommerce') } finally { setConnectingWoo(false) }
  }

  const saveEbay = async (e: React.FormEvent) => {
    e.preventDefault(); if (!ebayConnection) return
    setSavingEbay(true); setError(''); setSuccess('')
    try {
      const res = await fetch('/api/ebay/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ connection_id: ebayConnection.id, ...ebay }) })
      const data = await res.json(); if (!res.ok) throw new Error(data.error || 'eBay')
      setSuccess(c.ebaySaved); await load()
    } catch (err: any) { setError(err.message || 'eBay') } finally { setSavingEbay(false) }
  }

  const disconnect = async (id: string) => {
    setError(''); setSuccess('')
    const res = await fetch('/api/commerce/connections', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    const data = await res.json().catch(() => ({})); if (!res.ok) { setError(data.error || c.disconnect); return }
    setConnections((current) => current.filter((connection) => connection.id !== id))
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-16"><Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Plug className="h-5 w-5 text-primary" />{c.more}</CardTitle><CardDescription>{c.moreDesc}</CardDescription></CardHeader>
      <CardContent className="space-y-8">
        {error && <p className="text-sm text-destructive">{error}</p>}{success && <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p>}
        <div><div className="mb-3 flex items-center justify-between gap-3"><div><h3 className="font-medium">{c.connected}</h3><p className="text-sm text-muted-foreground">{c.managed}</p></div><Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>{loading && <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />}{c.refresh}</Button></div>
          {connections.length === 0 ? <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">{c.none}</div> : <div className="space-y-2">{connections.map((connection) => <div key={connection.id} className="rounded-lg border p-3"><div className="flex items-center justify-between gap-3"><div><p className="font-medium capitalize">{connection.platform}</p><p className="text-xs text-muted-foreground">{connection.account_label || connection.store_url || connection.account_key} · {connection.status}</p></div><Button size="sm" variant="ghost" onClick={() => disconnect(connection.id)}><Unplug className="mr-1 h-3.5 w-3.5" />{c.disconnect}</Button></div>{connection.last_error && <p className="mt-2 text-xs text-destructive">{connection.last_error}</p>}</div>)}</div>}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/70"><CardHeader><CardTitle className="text-base">WooCommerce</CardTitle><CardDescription>{c.wooDesc}</CardDescription></CardHeader><CardContent><form onSubmit={connectWoo} className="space-y-3"><div className="space-y-1.5"><Label>{c.storeUrl}</Label><Input placeholder="https://shop.example.com" value={woo.store_url} onChange={(e) => setWoo({ ...woo, store_url: e.target.value })} required /></div><div className="space-y-1.5"><Label>{c.label}</Label><Input value={woo.label} onChange={(e) => setWoo({ ...woo, label: e.target.value })} /></div><div className="space-y-1.5"><Label>{c.consumerKey}</Label><Input type="password" autoComplete="off" placeholder="ck_…" value={woo.consumer_key} onChange={(e) => setWoo({ ...woo, consumer_key: e.target.value })} required /></div><div className="space-y-1.5"><Label>{c.consumerSecret}</Label><Input type="password" autoComplete="off" placeholder="cs_…" value={woo.consumer_secret} onChange={(e) => setWoo({ ...woo, consumer_secret: e.target.value })} required /></div><Button className="w-full" disabled={connectingWoo}>{connectingWoo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Store className="mr-2 h-4 w-4" />}{c.connectWoo}</Button></form></CardContent></Card>
          <Card className="border-border/70"><CardHeader><CardTitle className="text-base">eBay</CardTitle><CardDescription>{c.ebayDesc}</CardDescription></CardHeader><CardContent className="space-y-4">{!ebayConnection ? <><p className="text-sm text-muted-foreground">{c.ebayOAuth}</p><Button className="w-full" asChild><a href="/api/ebay/connect">{c.connectEbay}</a></Button></> : <><div className="rounded-lg bg-muted px-3 py-2 text-sm">{c.connectedAs} <strong>{ebayConnection.account_label || 'eBay'}</strong>{loadingEbaySettings && <Loader2 className="ml-2 inline h-3.5 w-3.5 animate-spin" />}</div>{ebayMissingScopes.length > 0 && <div className="space-y-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3"><div className="flex gap-2 text-sm"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" /><p>{c.reconnectNeed} {ebayMissingScopes.join(', ')}.</p></div><Button variant="outline" className="w-full" asChild><a href="/api/ebay/connect"><RefreshCw className="mr-2 h-4 w-4" />{c.reconnect}</a></Button></div>}<form onSubmit={saveEbay} className="space-y-3"><div className="space-y-1.5"><Label>{c.marketplace}</Label><Input value={ebay.marketplace_id} onChange={(e) => setEbay({ ...ebay, marketplace_id: e.target.value.toUpperCase() })} placeholder="EBAY_US" required /></div><div className="space-y-1.5"><Label>{c.location}</Label><Input value={ebay.merchant_location_key} onChange={(e) => setEbay({ ...ebay, merchant_location_key: e.target.value })} required /></div><div className="space-y-1.5"><Label>{c.fulfillment}</Label><Input value={ebay.fulfillment_policy_id} onChange={(e) => setEbay({ ...ebay, fulfillment_policy_id: e.target.value })} required /></div><div className="space-y-1.5"><Label>{c.payment}</Label><Input value={ebay.payment_policy_id} onChange={(e) => setEbay({ ...ebay, payment_policy_id: e.target.value })} required /></div><div className="space-y-1.5"><Label>{c.returns}</Label><Input value={ebay.return_policy_id} onChange={(e) => setEbay({ ...ebay, return_policy_id: e.target.value })} required /></div><div className="space-y-1.5"><Label>{c.category}</Label><Input value={ebay.category_id} onChange={(e) => setEbay({ ...ebay, category_id: e.target.value })} /></div><Button className="w-full" disabled={savingEbay || loadingEbaySettings}>{savingEbay ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}{c.save}</Button></form></>}</CardContent></Card>
        </div>
      </CardContent>
    </Card></section>
  )
}
