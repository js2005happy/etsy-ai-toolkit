'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle2, Store } from 'lucide-react'
import { useI18n } from '@/lib/i18n/client'
import type { Locale } from '@/lib/i18n/locales'

const CHANNELS = ['Etsy', 'Shopify', 'WooCommerce', 'eBay']

const copy: Record<Locale, { pill: string; title: string; body: string; start: string; connect: string; trust: string; status: string }> = {
  en: { pill:'Craftly Multichannel Commerce', title:'One seller workspace for Etsy, Shopify, WooCommerce and eBay.', body:'Create product content once, adapt it for each marketplace, connect your stores, review changes and publish through one controlled workflow.', start:'Start free', connect:'Connect sales channels', trust:'Human-reviewed publishing. Nothing is pushed to an external store until you approve it.', status:'Production connector · reviewed publish workflow' },
  zh: { pill:'Craftly 多渠道电商', title:'一个工作台管理 Etsy、Shopify、WooCommerce 和 eBay。', body:'一次创建商品内容，针对不同平台自动适配，连接店铺、审核修改，并通过统一流程发布。', start:'免费开始', connect:'连接销售渠道', trust:'人工审核后再发布。未经你的确认，不会向外部店铺推送任何内容。', status:'生产环境连接器 · 审核后发布' },
  de: { pill:'Craftly Multichannel Commerce', title:'Ein Verkäufer-Workspace für Etsy, Shopify, WooCommerce und eBay.', body:'Erstelle Produktinhalte einmal, passe sie je Marktplatz an, verbinde Shops, prüfe Änderungen und veröffentliche kontrolliert.', start:'Kostenlos starten', connect:'Vertriebskanäle verbinden', trust:'Veröffentlichung nach menschlicher Prüfung. Ohne deine Freigabe wird nichts extern veröffentlicht.', status:'Produktiv-Connector · geprüfter Veröffentlichungsablauf' },
  fr: { pill:'Craftly Commerce multicanal', title:'Un seul espace vendeur pour Etsy, Shopify, WooCommerce et eBay.', body:'Créez le contenu une fois, adaptez-le à chaque marketplace, connectez vos boutiques, vérifiez les changements et publiez de façon contrôlée.', start:'Commencer gratuitement', connect:'Connecter les canaux de vente', trust:'Publication après validation humaine. Rien n’est envoyé sans votre approbation.', status:'Connecteur production · publication contrôlée' },
  es: { pill:'Craftly Comercio multicanal', title:'Un espacio de trabajo para Etsy, Shopify, WooCommerce y eBay.', body:'Crea el contenido una vez, adáptalo a cada marketplace, conecta tiendas, revisa cambios y publica de forma controlada.', start:'Empezar gratis', connect:'Conectar canales de venta', trust:'Publicación revisada por personas. Nada se envía a una tienda externa sin tu aprobación.', status:'Conector de producción · publicación revisada' },
  ja: { pill:'Craftly マルチチャネルコマース', title:'Etsy・Shopify・WooCommerce・eBay を一つのワークスペースで。', body:'商品コンテンツを一度作成し、各マーケット向けに調整。ストア接続、変更確認、公開までを一つの管理フローで行えます。', start:'無料で始める', connect:'販売チャネルを接続', trust:'人が確認してから公開します。承認なしに外部ストアへ送信されることはありません。', status:'本番コネクター · 確認後に公開' },
  it: { pill:'Craftly Commercio multicanale', title:'Un solo workspace per Etsy, Shopify, WooCommerce ed eBay.', body:'Crea i contenuti una volta, adattali a ogni marketplace, collega i negozi, verifica le modifiche e pubblica con un flusso controllato.', start:'Inizia gratis', connect:'Collega i canali di vendita', trust:'Pubblicazione con revisione umana. Nulla viene inviato senza la tua approvazione.', status:'Connettore produzione · pubblicazione verificata' },
  ko: { pill:'Craftly 멀티채널 커머스', title:'Etsy, Shopify, WooCommerce, eBay를 하나의 판매자 워크스페이스에서.', body:'상품 콘텐츠를 한 번 만들고 각 마켓에 맞게 조정한 뒤, 스토어 연결부터 검토와 게시까지 한 흐름에서 관리하세요.', start:'무료로 시작', connect:'판매 채널 연결', trust:'사람이 검토한 뒤 게시합니다. 승인하기 전에는 외부 스토어로 아무것도 전송되지 않습니다.', status:'프로덕션 커넥터 · 검토 후 게시' },
  pt: { pill:'Craftly Comércio multicanal', title:'Um único workspace para Etsy, Shopify, WooCommerce e eBay.', body:'Crie o conteúdo uma vez, adapte para cada marketplace, conecte as lojas, revise alterações e publique com controle.', start:'Começar grátis', connect:'Conectar canais de venda', trust:'Publicação com revisão humana. Nada é enviado para lojas externas sem sua aprovação.', status:'Conector de produção · publicação revisada' },
}

export default function MultichannelLaunch() {
  const { locale } = useI18n()
  const c = copy[locale]

  return (
    <section className="k-wrap pt-14 md:pt-20">
      <div className="overflow-hidden rounded-[2rem] border border-primary/20 bg-card/80 px-6 py-10 shadow-2xl backdrop-blur md:px-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <Store className="h-3.5 w-3.5" /> {c.pill}
            </div>
            <h1 className="max-w-4xl font-display text-4xl font-bold tracking-tight text-foreground md:text-6xl">{c.title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">{c.body}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/signup" className="k-btn k-btn-primary whitespace-nowrap"><span>{c.start}</span><i className="k-shine" /></Link>
              <Link href="/dashboard/channels" className="k-btn whitespace-nowrap">{c.connect} <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">{c.trust}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {CHANNELS.map((channel) => (
              <div key={channel} className="rounded-2xl border border-border bg-background/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-foreground">{channel}</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{c.status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
