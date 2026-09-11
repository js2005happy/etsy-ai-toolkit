'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle2, Store } from 'lucide-react'
import EtsyConnect from '@/components/account/etsy-connect'
import ShopifyConnect from '@/components/account/shopify-connect'
import CommerceConnections from '@/components/account/commerce-connections'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n/client'
import type { Locale } from '@/lib/i18n/locales'

const copy: Record<Locale, {
  eyebrow: string; title: string; intro: string; open: string; badge: string; reviewed: string;
  etsyDetail: string; shopifyDetail: string; wooDetail: string; ebayDetail: string;
  etsyCard: string; shopifyCard: string;
}> = {
  en: { eyebrow:'Sales Channels', title:'Connect Etsy, Shopify, WooCommerce and eBay', intro:'Connect your stores here, then use Product Hub and Multichannel Commerce to create, review and publish channel-specific work.', open:'Open Multichannel Commerce', badge:'Production connector', reviewed:'Human-reviewed publishing flow', etsyDetail:'Connect your Etsy shop and review approved listing changes before publishing.', shopifyDetail:'Connect a Shopify store for product publishing, order import and inventory workflows.', wooDetail:'Connect your own WooCommerce store with read/write REST API credentials.', ebayDetail:'Connect eBay for inventory, account, fulfillment and reviewed publishing workflows.', etsyCard:'Connect or reconnect your Etsy seller account.', shopifyCard:'Enter your shop domain and authorize Craftly through Shopify OAuth.' },
  zh: { eyebrow:'销售渠道', title:'连接 Etsy、Shopify、WooCommerce 和 eBay', intro:'在这里连接店铺，然后通过商品中心和多渠道工作台生成、审核并发布各平台内容。', open:'打开多渠道工作台', badge:'生产环境连接器', reviewed:'人工审核后发布', etsyDetail:'连接 Etsy 店铺，在发布前审核并确认商品修改。', shopifyDetail:'连接 Shopify 店铺，用于商品发布、订单导入和库存流程。', wooDetail:'使用读写 REST API 凭据连接你自己的 WooCommerce 店铺。', ebayDetail:'连接 eBay，用于库存、账户、履约及审核后发布流程。', etsyCard:'连接或重新连接你的 Etsy 卖家账号。', shopifyCard:'输入店铺域名并通过 Shopify OAuth 授权 Craftly。' },
  de: { eyebrow:'Vertriebskanäle', title:'Etsy, Shopify, WooCommerce und eBay verbinden', intro:'Verbinde hier deine Shops und nutze anschließend Product Hub und Multichannel Commerce für kanalspezifische Inhalte.', open:'Multichannel Commerce öffnen', badge:'Produktiv-Connector', reviewed:'Veröffentlichung nach Prüfung', etsyDetail:'Verbinde deinen Etsy-Shop und prüfe Änderungen vor der Veröffentlichung.', shopifyDetail:'Verbinde Shopify für Produkte, Bestellungen und Lagerbestand.', wooDetail:'Verbinde deinen WooCommerce-Shop mit REST-API-Schlüsseln mit Lese-/Schreibzugriff.', ebayDetail:'Verbinde eBay für Bestand, Konto, Fulfillment und geprüfte Veröffentlichungen.', etsyCard:'Etsy-Verkäuferkonto verbinden oder erneut verbinden.', shopifyCard:'Shop-Domain eingeben und Craftly per Shopify OAuth autorisieren.' },
  fr: { eyebrow:'Canaux de vente', title:'Connectez Etsy, Shopify, WooCommerce et eBay', intro:'Connectez vos boutiques ici, puis utilisez Product Hub et Multichannel Commerce pour créer, vérifier et publier par canal.', open:'Ouvrir Multichannel Commerce', badge:'Connecteur production', reviewed:'Publication après validation humaine', etsyDetail:'Connectez votre boutique Etsy et validez les modifications avant publication.', shopifyDetail:'Connectez Shopify pour publier des produits, importer les commandes et gérer le stock.', wooDetail:'Connectez WooCommerce avec des identifiants REST API en lecture/écriture.', ebayDetail:'Connectez eBay pour le stock, le compte, l’exécution et la publication contrôlée.', etsyCard:'Connectez ou reconnectez votre compte vendeur Etsy.', shopifyCard:'Saisissez le domaine de votre boutique et autorisez Craftly via Shopify OAuth.' },
  es: { eyebrow:'Canales de venta', title:'Conecta Etsy, Shopify, WooCommerce y eBay', intro:'Conecta tus tiendas aquí y usa Product Hub y Multichannel Commerce para crear, revisar y publicar por canal.', open:'Abrir Multichannel Commerce', badge:'Conector de producción', reviewed:'Publicación con revisión humana', etsyDetail:'Conecta tu tienda Etsy y revisa los cambios antes de publicar.', shopifyDetail:'Conecta Shopify para publicar productos, importar pedidos y gestionar inventario.', wooDetail:'Conecta WooCommerce con credenciales REST API de lectura/escritura.', ebayDetail:'Conecta eBay para inventario, cuenta, cumplimiento y publicación revisada.', etsyCard:'Conecta o vuelve a conectar tu cuenta de vendedor de Etsy.', shopifyCard:'Introduce el dominio de tu tienda y autoriza Craftly mediante Shopify OAuth.' },
  ja: { eyebrow:'販売チャネル', title:'Etsy・Shopify・WooCommerce・eBay を接続', intro:'ここでストアを接続し、Product Hub と Multichannel Commerce からチャネル別の作成・確認・公開を行えます。', open:'マルチチャネルを開く', badge:'本番コネクター', reviewed:'人による確認後に公開', etsyDetail:'Etsy ショップを接続し、公開前に変更内容を確認します。', shopifyDetail:'Shopify を接続して商品公開、注文取り込み、在庫管理を行います。', wooDetail:'読み書き可能な REST API 認証情報で WooCommerce を接続します。', ebayDetail:'eBay を接続して在庫、アカウント、フルフィルメント、確認済み公開を行います。', etsyCard:'Etsy セラーアカウントを接続または再接続します。', shopifyCard:'ショップドメインを入力し、Shopify OAuth で Craftly を承認します。' },
  it: { eyebrow:'Canali di vendita', title:'Collega Etsy, Shopify, WooCommerce ed eBay', intro:'Collega qui i tuoi negozi e usa Product Hub e Multichannel Commerce per creare, verificare e pubblicare per ogni canale.', open:'Apri Multichannel Commerce', badge:'Connettore produzione', reviewed:'Pubblicazione con revisione umana', etsyDetail:'Collega il tuo negozio Etsy e verifica le modifiche prima della pubblicazione.', shopifyDetail:'Collega Shopify per pubblicazione prodotti, import ordini e inventario.', wooDetail:'Collega WooCommerce con credenziali REST API in lettura/scrittura.', ebayDetail:'Collega eBay per inventario, account, fulfillment e pubblicazione verificata.', etsyCard:'Collega o ricollega il tuo account venditore Etsy.', shopifyCard:'Inserisci il dominio del negozio e autorizza Craftly tramite Shopify OAuth.' },
  ko: { eyebrow:'판매 채널', title:'Etsy, Shopify, WooCommerce, eBay 연결', intro:'여기에서 스토어를 연결한 뒤 Product Hub와 Multichannel Commerce에서 채널별 콘텐츠를 생성, 검토, 게시할 수 있습니다.', open:'멀티채널 열기', badge:'프로덕션 커넥터', reviewed:'사람이 검토한 뒤 게시', etsyDetail:'Etsy 스토어를 연결하고 게시 전 변경 사항을 검토합니다.', shopifyDetail:'Shopify를 연결해 상품 게시, 주문 가져오기, 재고 작업을 수행합니다.', wooDetail:'읽기/쓰기 REST API 자격 증명으로 WooCommerce 스토어를 연결합니다.', ebayDetail:'eBay를 연결해 재고, 계정, 주문 처리 및 검토 후 게시를 관리합니다.', etsyCard:'Etsy 판매자 계정을 연결하거나 다시 연결합니다.', shopifyCard:'스토어 도메인을 입력하고 Shopify OAuth로 Craftly를 승인합니다.' },
  pt: { eyebrow:'Canais de venda', title:'Conecte Etsy, Shopify, WooCommerce e eBay', intro:'Conecte suas lojas aqui e use Product Hub e Multichannel Commerce para criar, revisar e publicar por canal.', open:'Abrir Multichannel Commerce', badge:'Conector de produção', reviewed:'Publicação com revisão humana', etsyDetail:'Conecte sua loja Etsy e revise as alterações antes de publicar.', shopifyDetail:'Conecte Shopify para publicar produtos, importar pedidos e gerenciar estoque.', wooDetail:'Conecte WooCommerce com credenciais REST API de leitura e gravação.', ebayDetail:'Conecte eBay para estoque, conta, fulfillment e publicação revisada.', etsyCard:'Conecte ou reconecte sua conta de vendedor Etsy.', shopifyCard:'Digite o domínio da loja e autorize o Craftly via Shopify OAuth.' },
}

export default function SalesChannelsPage() {
  const { locale } = useI18n()
  const c = copy[locale]
  const channels = [
    { name: 'Etsy', mode: 'OAuth', detail: c.etsyDetail },
    { name: 'Shopify', mode: 'OAuth', detail: c.shopifyDetail },
    { name: 'WooCommerce', mode: 'REST API', detail: c.wooDetail },
    { name: 'eBay', mode: 'OAuth', detail: c.ebayDetail },
  ]

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-primary">{c.eyebrow}</p>
          <h1 className="mt-1 font-display text-3xl font-bold">{c.title}</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">{c.intro}</p>
        </div>
        <Button variant="outline" asChild><Link href="/dashboard/multichannel">{c.open} <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {channels.map((channel) => (
          <Card key={channel.name} className="border-primary/15">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-lg"><Store className="h-4 w-4 text-primary" />{channel.name}</CardTitle>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">{c.badge}</span>
              </div>
              <CardDescription>{channel.mode}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>{channel.detail}</p>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-foreground"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />{c.reviewed}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Etsy</CardTitle><CardDescription>{c.etsyCard}</CardDescription></CardHeader><CardContent><EtsyConnect /></CardContent></Card>
        <Card><CardHeader><CardTitle>Shopify</CardTitle><CardDescription>{c.shopifyCard}</CardDescription></CardHeader><CardContent><ShopifyConnect /></CardContent></Card>
      </div>

      <div id="additional-commerce-channels" className="mt-8"><CommerceConnections /></div>
    </div>
  )
}
