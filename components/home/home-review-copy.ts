import type { Locale } from '@/lib/i18n/locales'

type DemoCopy = {
  product: string
  title: string
  tags: string[]
  issues: string[]
}

type HomeReviewCopy = {
  publishing: string
  contentFor: string
  pill: string
  heroA: string
  heroB: string
  heroC: string
  heroSub: string
  startFree: string
  tryTool: string
  trust: string
  workspacePreview: string
  reviewMode: string
  listingHealth: string
  exampleScore: string
  roughNote: string
  suggestedTitle: string
  aiDraft: string
  reviewChanges: string
  publishToEtsy: string
  exampleData: string
  seeDifference: string
  differenceHeading: string
  differenceLead: string
  before: string
  needsWork: string
  title: string
  beforeTitle: string
  issuesFound: string
  beforeIssues: string[]
  afterReview: string
  readyToReview: string
  exampleHealth: string
  publishingLabel: string
  approvalOnly: string
  disclaimer: string
  process: Array<[string, string]>
  demoNote: string
  mug: DemoCopy
  moon: DemoCopy
  generic: DemoCopy
}

const en: HomeReviewCopy = {
  publishing: 'Publishing:', contentFor: 'Content for:', pill: 'Craftly for Etsy sellers',
  heroA: 'Connect your Etsy shop.', heroB: 'Find what needs fixing.', heroC: 'Improve listings.',
  heroSub: 'Craftly analyzes your Etsy listings, suggests improvements to titles, descriptions, tags and images, then lets you review every change before publishing.',
  startFree: 'Start free — no card', tryTool: 'Try a free Etsy tool', trust: 'Review first. Publish only when you are ready.',
  workspacePreview: 'Listing workspace preview', reviewMode: 'Review mode', listingHealth: 'Listing health', exampleScore: 'Example score',
  roughNote: 'Your rough note', suggestedTitle: 'Suggested title', aiDraft: 'AI draft', reviewChanges: 'Review changes', publishToEtsy: 'Publish to Etsy',
  exampleData: 'Example data · nothing publishes automatically', seeDifference: 'See the difference', differenceHeading: 'From rough listing to review-ready.',
  differenceLead: 'Craftly gives sellers a clear before-and-after view so AI suggestions stay useful, editable and under your control.',
  before: 'Before', needsWork: 'Needs work', title: 'Title', beforeTitle: 'Handmade green mug gift ceramic cup', issuesFound: 'Issues found',
  beforeIssues: ['Product size is missing', 'Title reads like a keyword list', 'Tags are broad and repetitive'],
  afterReview: 'After Craftly review', readyToReview: 'Ready to review', exampleHealth: 'Example health', publishingLabel: 'Publishing', approvalOnly: 'Your approval only',
  disclaimer: 'Illustrative example only. Craftly does not guarantee Etsy ranking, traffic or sales.',
  process: [['Find problems', 'Listing health surfaces the places worth reviewing.'], ['Fix with AI', 'Draft clearer titles, descriptions, tags and seller content.'], ['Review safely', 'Nothing changes remotely until you approve it.'], ['Publish', 'Push approved work to Etsy from the same workspace.']],
  demoNote: 'handmade ceramic mug, sage green, 12 oz, speckled glaze',
  mug: { product: 'Sage green ceramic mug', title: 'Handmade Sage Green Ceramic Mug — Speckled 12 oz Pottery Cup', tags: ['ceramic mug', 'sage green mug', 'handmade pottery'], issues: ['Size is missing from title', 'Material can be clearer', 'Tags repeat broad terms'] },
  moon: { product: 'Sterling silver moon necklace', title: 'Handmade Sterling Silver Moon Pendant Necklace — Minimal Celestial Jewelry Gift', tags: ['moon necklace', 'sterling silver', 'celestial gift'], issues: ['Title is too generic', 'Important material missing', 'Tags can be more specific'] },
  generic: { product: 'Handmade product', title: 'Handmade Product Listing — Clear Materials, Style and Gift Details', tags: ['handmade gift', 'small business', 'artisan made'], issues: ['Title needs more detail', 'Key attributes are missing', 'Tags can be more specific'] },
}

export const HOME_REVIEW_COPY: Record<Locale, HomeReviewCopy> = {
  en,
  zh: {
    ...en,
    publishing: '发布到：', contentFor: '内容适用于：', pill: '为 Etsy 卖家打造的 Craftly',
    heroA: '连接你的 Etsy 店铺。', heroB: '找出真正需要优化的地方。', heroC: '改进商品刊登。',
    heroSub: 'Craftly 会分析你的 Etsy 商品刊登，并针对标题、描述、标签和图片提出改进建议；所有修改都由你审核后才会发布。',
    startFree: '免费开始 — 无需信用卡', tryTool: '试用免费 Etsy 工具', trust: '先审核，再发布。只有你确认后才会生效。',
    workspacePreview: '商品刊登工作区预览', reviewMode: '审核模式', listingHealth: '刊登健康度', exampleScore: '示例评分', roughNote: '你的原始笔记',
    suggestedTitle: '建议标题', aiDraft: 'AI 草稿', reviewChanges: '审核修改', publishToEtsy: '发布到 Etsy', exampleData: '示例数据 · 不会自动发布任何内容',
    seeDifference: '看看变化', differenceHeading: '从粗略刊登到可审核版本。', differenceLead: 'Craftly 提供清晰的前后对比，让 AI 建议始终可用、可编辑，并由你掌控。',
    before: '优化前', needsWork: '需要改进', title: '标题', beforeTitle: '手工绿色马克杯 礼物 陶瓷杯', issuesFound: '发现的问题',
    beforeIssues: ['缺少商品尺寸信息', '标题读起来像关键词堆砌', '标签过于宽泛且重复'],
    afterReview: 'Craftly 审核后', readyToReview: '可供审核', exampleHealth: '示例健康度', publishingLabel: '发布方式', approvalOnly: '仅在你批准后发布',
    disclaimer: '仅为示例。Craftly 不保证 Etsy 排名、流量或销量。',
    process: [['发现问题', '刊登健康度会指出值得优先检查的位置。'], ['AI 辅助优化', '生成更清晰的标题、描述、标签和卖家内容草稿。'], ['安全审核', '在你批准前，不会远程修改任何内容。'], ['发布', '在同一工作区把已批准的内容发布到 Etsy。']],
    demoNote: '手工陶瓷马克杯，鼠尾草绿，12 盎司，斑点釉面',
    mug: { product: '鼠尾草绿陶瓷马克杯', title: '手工鼠尾草绿陶瓷马克杯 — 12 盎司斑点釉陶杯', tags: ['陶瓷马克杯', '鼠尾草绿马克杯', '手工陶艺'], issues: ['标题中缺少尺寸', '材质可以写得更清楚', '标签存在宽泛重复'] },
    moon: { product: '纯银月亮项链', title: '手工纯银月亮吊坠项链 — 极简星月首饰礼物', tags: ['月亮项链', '纯银首饰', '星月礼物'], issues: ['标题过于笼统', '缺少重要材质信息', '标签可以更具体'] },
    generic: { product: '手工商品', title: '手工商品刊登 — 清楚呈现材质、风格与送礼信息', tags: ['手工礼物', '小型商家', '匠人制作'], issues: ['标题需要更多细节', '缺少关键属性', '标签可以更具体'] },
  },
  de: { ...en, pill: 'Craftly für Etsy-Verkäufer', heroA: 'Verbinde deinen Etsy-Shop.', heroB: 'Finde, was verbessert werden muss.', heroC: 'Optimiere deine Listings.', heroSub: 'Craftly analysiert deine Etsy-Listings, schlägt Verbesserungen für Titel, Beschreibungen, Tags und Bilder vor und lässt dich jede Änderung vor der Veröffentlichung prüfen.', startFree: 'Kostenlos starten — keine Karte', tryTool: 'Kostenloses Etsy-Tool testen', trust: 'Erst prüfen. Veröffentlicht wird nur, wenn du bereit bist.', workspacePreview: 'Listing-Arbeitsbereich Vorschau', reviewMode: 'Prüfmodus', listingHealth: 'Listing-Qualität', exampleScore: 'Beispielwert', roughNote: 'Deine Rohnotiz', suggestedTitle: 'Vorgeschlagener Titel', aiDraft: 'KI-Entwurf', reviewChanges: 'Änderungen prüfen', publishToEtsy: 'Auf Etsy veröffentlichen', exampleData: 'Beispieldaten · nichts wird automatisch veröffentlicht', seeDifference: 'Sieh den Unterschied', differenceHeading: 'Vom Rohentwurf zur prüfbereiten Version.', differenceLead: 'Craftly zeigt dir klar Vorher und Nachher, damit KI-Vorschläge nützlich, editierbar und unter deiner Kontrolle bleiben.', before: 'Vorher', needsWork: 'Verbesserung nötig', title: 'Titel', issuesFound: 'Gefundene Probleme', afterReview: 'Nach Craftly-Prüfung', readyToReview: 'Prüfbereit', exampleHealth: 'Beispielqualität', publishingLabel: 'Veröffentlichung', approvalOnly: 'Nur mit deiner Freigabe', disclaimer: 'Nur ein Beispiel. Craftly garantiert keine Etsy-Rankings, Zugriffe oder Verkäufe.', process: [['Probleme finden', 'Die Listing-Qualität zeigt, was du prüfen solltest.'], ['Mit KI verbessern', 'Erstelle klarere Titel, Beschreibungen, Tags und Inhalte.'], ['Sicher prüfen', 'Ohne deine Freigabe wird nichts geändert.'], ['Veröffentlichen', 'Sende freigegebene Inhalte direkt zu Etsy.']] },
  fr: { ...en, pill: 'Craftly pour les vendeurs Etsy', heroA: 'Connectez votre boutique Etsy.', heroB: 'Repérez ce qui doit être amélioré.', heroC: 'Optimisez vos fiches.', heroSub: 'Craftly analyse vos fiches Etsy, suggère des améliorations pour les titres, descriptions, tags et images, puis vous laisse valider chaque modification avant publication.', startFree: 'Commencer gratuitement — sans carte', tryTool: 'Essayer un outil Etsy gratuit', trust: 'Vérifiez d’abord. Publiez seulement quand vous êtes prêt.', workspacePreview: 'Aperçu de l’espace de travail', reviewMode: 'Mode révision', listingHealth: 'Qualité de la fiche', exampleScore: 'Score exemple', roughNote: 'Votre note brute', suggestedTitle: 'Titre suggéré', aiDraft: 'Brouillon IA', reviewChanges: 'Vérifier les modifications', publishToEtsy: 'Publier sur Etsy', exampleData: 'Données d’exemple · rien n’est publié automatiquement', seeDifference: 'Voyez la différence', differenceHeading: 'D’une fiche brute à une version prête à valider.', differenceLead: 'Craftly montre clairement l’avant et l’après pour que les suggestions IA restent utiles, modifiables et sous votre contrôle.', before: 'Avant', needsWork: 'À améliorer', title: 'Titre', issuesFound: 'Problèmes détectés', afterReview: 'Après révision Craftly', readyToReview: 'Prêt à valider', exampleHealth: 'Qualité exemple', publishingLabel: 'Publication', approvalOnly: 'Uniquement avec votre accord', disclaimer: 'Exemple illustratif uniquement. Craftly ne garantit ni classement Etsy, ni trafic, ni ventes.', process: [['Repérer les problèmes', 'La qualité de la fiche montre les points à vérifier.'], ['Améliorer avec l’IA', 'Rédigez des titres, descriptions et tags plus clairs.'], ['Valider en sécurité', 'Rien ne change sans votre approbation.'], ['Publier', 'Envoyez les changements approuvés vers Etsy.']] },
  es: { ...en, pill: 'Craftly para vendedores de Etsy', heroA: 'Conecta tu tienda de Etsy.', heroB: 'Encuentra lo que necesita mejoras.', heroC: 'Mejora tus anuncios.', heroSub: 'Craftly analiza tus anuncios de Etsy, sugiere mejoras en títulos, descripciones, etiquetas e imágenes y te deja revisar cada cambio antes de publicarlo.', startFree: 'Empieza gratis — sin tarjeta', tryTool: 'Probar una herramienta Etsy gratis', trust: 'Revisa primero. Publica solo cuando estés listo.', workspacePreview: 'Vista previa del espacio de anuncios', reviewMode: 'Modo revisión', listingHealth: 'Salud del anuncio', exampleScore: 'Puntuación de ejemplo', roughNote: 'Tu nota inicial', suggestedTitle: 'Título sugerido', aiDraft: 'Borrador IA', reviewChanges: 'Revisar cambios', publishToEtsy: 'Publicar en Etsy', exampleData: 'Datos de ejemplo · nada se publica automáticamente', seeDifference: 'Mira la diferencia', differenceHeading: 'De anuncio básico a listo para revisar.', differenceLead: 'Craftly muestra un antes y un después claro para que las sugerencias de IA sean útiles, editables y estén bajo tu control.', before: 'Antes', needsWork: 'Necesita mejoras', title: 'Título', issuesFound: 'Problemas encontrados', afterReview: 'Después de revisar con Craftly', readyToReview: 'Listo para revisar', exampleHealth: 'Salud de ejemplo', publishingLabel: 'Publicación', approvalOnly: 'Solo con tu aprobación', disclaimer: 'Solo es un ejemplo. Craftly no garantiza posicionamiento, tráfico ni ventas en Etsy.', process: [['Detecta problemas', 'La salud del anuncio muestra qué conviene revisar.'], ['Mejora con IA', 'Crea títulos, descripciones y etiquetas más claros.'], ['Revisa con seguridad', 'Nada cambia hasta que lo apruebes.'], ['Publica', 'Envía a Etsy el trabajo aprobado.']] },
  ja: { ...en, pill: 'Etsy セラーのための Craftly', heroA: 'Etsy ショップを接続。', heroB: '改善すべき点を見つける。', heroC: '商品ページを改善。', heroSub: 'Craftly が Etsy の商品ページを分析し、タイトル・説明・タグ・画像の改善案を提示。公開前にすべての変更を確認できます。', startFree: '無料で開始 — カード不要', tryTool: '無料の Etsy ツールを試す', trust: 'まず確認。準備ができたときだけ公開。', workspacePreview: '商品ページ作業画面プレビュー', reviewMode: 'レビューモード', listingHealth: '商品ページ品質', exampleScore: 'サンプルスコア', roughNote: 'ラフメモ', suggestedTitle: '提案タイトル', aiDraft: 'AI 下書き', reviewChanges: '変更を確認', publishToEtsy: 'Etsy に公開', exampleData: 'サンプルデータ · 自動公開されません', seeDifference: '違いを見る', differenceHeading: 'ラフな商品ページから確認可能な状態へ。', differenceLead: 'Craftly は明確なビフォー・アフターを示し、AI 提案を編集可能であなたの管理下に保ちます。', before: '変更前', needsWork: '要改善', title: 'タイトル', issuesFound: '見つかった問題', afterReview: 'Craftly レビュー後', readyToReview: '確認準備完了', exampleHealth: '品質例', publishingLabel: '公開', approvalOnly: '承認した場合のみ', disclaimer: '説明用の例です。Craftly は Etsy の順位、流入、売上を保証しません。', process: [['問題を発見', '商品ページ品質から確認箇所を見つけます。'], ['AI で改善', 'より明確なタイトル・説明・タグを作成します。'], ['安全に確認', '承認するまで何も変更されません。'], ['公開', '承認済みの内容を Etsy に送信します。']] },
  it: { ...en, pill: 'Craftly per venditori Etsy', heroA: 'Collega il tuo negozio Etsy.', heroB: 'Trova ciò che va migliorato.', heroC: 'Migliora le inserzioni.', heroSub: 'Craftly analizza le tue inserzioni Etsy, suggerisce miglioramenti a titoli, descrizioni, tag e immagini e ti consente di verificare ogni modifica prima della pubblicazione.', startFree: 'Inizia gratis — senza carta', tryTool: 'Prova uno strumento Etsy gratuito', trust: 'Prima controlla. Pubblica solo quando sei pronto.', workspacePreview: 'Anteprima area inserzioni', reviewMode: 'Modalità revisione', listingHealth: 'Qualità inserzione', exampleScore: 'Punteggio esempio', roughNote: 'La tua nota grezza', suggestedTitle: 'Titolo suggerito', aiDraft: 'Bozza AI', reviewChanges: 'Rivedi modifiche', publishToEtsy: 'Pubblica su Etsy', exampleData: 'Dati di esempio · nulla viene pubblicato automaticamente', seeDifference: 'Guarda la differenza', differenceHeading: 'Da inserzione grezza a pronta per la revisione.', differenceLead: 'Craftly mostra chiaramente prima e dopo così i suggerimenti AI restano utili, modificabili e sotto il tuo controllo.', before: 'Prima', needsWork: 'Da migliorare', title: 'Titolo', issuesFound: 'Problemi trovati', afterReview: 'Dopo la revisione Craftly', readyToReview: 'Pronta da rivedere', exampleHealth: 'Qualità esempio', publishingLabel: 'Pubblicazione', approvalOnly: 'Solo con la tua approvazione', disclaimer: 'Solo esempio illustrativo. Craftly non garantisce ranking Etsy, traffico o vendite.', process: [['Trova problemi', 'La qualità dell’inserzione evidenzia cosa controllare.'], ['Migliora con AI', 'Crea titoli, descrizioni e tag più chiari.'], ['Rivedi in sicurezza', 'Nulla cambia finché non approvi.'], ['Pubblica', 'Invia a Etsy il lavoro approvato.']] },
  ko: { ...en, pill: 'Etsy 판매자를 위한 Craftly', heroA: 'Etsy 스토어를 연결하세요.', heroB: '무엇을 고쳐야 하는지 찾으세요.', heroC: '리스팅을 개선하세요.', heroSub: 'Craftly가 Etsy 리스팅을 분석하고 제목, 설명, 태그, 이미지 개선안을 제시하며 게시 전 모든 변경을 직접 검토할 수 있게 합니다.', startFree: '무료 시작 — 카드 불필요', tryTool: '무료 Etsy 도구 사용', trust: '먼저 검토하세요. 준비됐을 때만 게시됩니다.', workspacePreview: '리스팅 작업공간 미리보기', reviewMode: '검토 모드', listingHealth: '리스팅 품질', exampleScore: '예시 점수', roughNote: '초안 메모', suggestedTitle: '추천 제목', aiDraft: 'AI 초안', reviewChanges: '변경 검토', publishToEtsy: 'Etsy에 게시', exampleData: '예시 데이터 · 자동으로 게시되지 않습니다', seeDifference: '차이를 확인하세요', differenceHeading: '거친 초안에서 검토 가능한 리스팅으로.', differenceLead: 'Craftly는 전후 비교를 명확히 보여 AI 제안을 유용하고 편집 가능하며 판매자 통제 아래 유지합니다.', before: '이전', needsWork: '개선 필요', title: '제목', issuesFound: '발견된 문제', afterReview: 'Craftly 검토 후', readyToReview: '검토 준비 완료', exampleHealth: '예시 품질', publishingLabel: '게시', approvalOnly: '승인할 때만', disclaimer: '설명용 예시입니다. Craftly는 Etsy 순위, 트래픽 또는 판매를 보장하지 않습니다.', process: [['문제 찾기', '리스팅 품질이 검토할 지점을 보여줍니다.'], ['AI로 개선', '더 명확한 제목, 설명, 태그를 작성합니다.'], ['안전하게 검토', '승인 전에는 아무것도 변경되지 않습니다.'], ['게시', '승인한 작업을 Etsy로 보냅니다.']] },
  pt: { ...en, pill: 'Craftly para vendedores da Etsy', heroA: 'Conecte sua loja Etsy.', heroB: 'Descubra o que precisa melhorar.', heroC: 'Melhore seus anúncios.', heroSub: 'A Craftly analisa seus anúncios da Etsy, sugere melhorias em títulos, descrições, tags e imagens e permite revisar cada alteração antes de publicar.', startFree: 'Comece grátis — sem cartão', tryTool: 'Testar ferramenta Etsy grátis', trust: 'Revise primeiro. Publique só quando estiver pronto.', workspacePreview: 'Prévia do espaço de anúncios', reviewMode: 'Modo de revisão', listingHealth: 'Saúde do anúncio', exampleScore: 'Pontuação de exemplo', roughNote: 'Sua nota inicial', suggestedTitle: 'Título sugerido', aiDraft: 'Rascunho de IA', reviewChanges: 'Revisar alterações', publishToEtsy: 'Publicar na Etsy', exampleData: 'Dados de exemplo · nada é publicado automaticamente', seeDifference: 'Veja a diferença', differenceHeading: 'Do anúncio bruto ao pronto para revisão.', differenceLead: 'A Craftly mostra claramente o antes e depois para que as sugestões de IA continuem úteis, editáveis e sob seu controle.', before: 'Antes', needsWork: 'Precisa melhorar', title: 'Título', issuesFound: 'Problemas encontrados', afterReview: 'Após revisão da Craftly', readyToReview: 'Pronto para revisar', exampleHealth: 'Saúde de exemplo', publishingLabel: 'Publicação', approvalOnly: 'Somente com sua aprovação', disclaimer: 'Apenas exemplo ilustrativo. A Craftly não garante ranking, tráfego ou vendas na Etsy.', process: [['Encontre problemas', 'A saúde do anúncio mostra o que merece revisão.'], ['Melhore com IA', 'Crie títulos, descrições e tags mais claros.'], ['Revise com segurança', 'Nada muda até você aprovar.'], ['Publique', 'Envie o trabalho aprovado para a Etsy.']] },
}
