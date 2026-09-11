export type ProductCategory =
  | 'apparel'
  | 'jewelry'
  | 'home-decor'
  | 'art-print'
  | 'personalized-gift'
  | 'digital-product'
  | 'beauty'
  | 'food'
  | 'electronics'
  | 'accessories'
  | 'craft-supplies'
  | 'generic'

export type ProductProfile = {
  id: ProductCategory
  label: string
  detectionTerms: string[]
  requiredFacts: string[]
  buyerQuestions: string[]
  conversionAngles: string[]
  avoidClaims: string[]
  imagePriorities: string[]
  marketplaceNotes: Partial<Record<'etsy' | 'shopify' | 'woocommerce' | 'amazon' | 'ebay' | 'tiktok' | 'walmart' | 'google', string>>
}

export const PRODUCT_PROFILES: ProductProfile[] = [
  {
    id: 'apparel', label: 'Apparel',
    detectionTerms: ['shirt','t-shirt','tee','hoodie','sweater','dress','jacket','pants','clothing','apparel'],
    requiredFacts: ['fabric/material','fit','size range','care instructions','color/variant','production/dispatch time'],
    buyerQuestions: ['How does it fit?','Is it true to size?','How should I wash it?','What does the fabric feel like?'],
    conversionAngles: ['fit confidence','comfort','styling/use case','giftability','care simplicity'],
    avoidClaims: ['unsupported sustainability claims','guaranteed fit','medical/performance claims without evidence'],
    imagePriorities: ['front/back views','on-body scale','fabric close-up','size guide','variant swatches'],
    marketplaceNotes: { etsy: 'Emphasize design originality, personalization, garment details, and gift occasions.', amazon: 'Lead with material, fit, size, and care facts; reduce subjective lifestyle copy.', tiktok: 'Lead with the visual hook, fit transformation, or styling moment.', woocommerce: 'Keep size guide, material, fit and returns expectations close to the purchase decision.' },
  },
  {
    id: 'jewelry', label: 'Jewelry',
    detectionTerms: ['ring','necklace','bracelet','earring','jewelry','jewellery','pendant','chain'],
    requiredFacts: ['metal/material','dimensions','finish','closure/size','personalization','care'],
    buyerQuestions: ['What is it made from?','Will it tarnish?','What size is it?','Is it gift-ready?'],
    conversionAngles: ['meaning/sentiment','gift occasion','materials','craftsmanship','personalization'],
    avoidClaims: ['hypoallergenic unless verified','solid precious metal unless verified','permanent tarnish resistance'],
    imagePriorities: ['macro detail','on-body scale','clasp/back view','packaging','engraving close-up'],
    marketplaceNotes: { etsy: 'Prioritize craftsmanship, material transparency, personalization, and recipient/occasion keywords.', ebay: 'State material, hallmarks, dimensions, condition, and included packaging clearly.', woocommerce: 'Place metal, dimensions, care and personalization rules in structured product details.' },
  },
  {
    id: 'home-decor', label: 'Home Decor',
    detectionTerms: ['decor','vase','candle','pillow','blanket','rug','lamp','wall decor','home'],
    requiredFacts: ['dimensions','material','color','care','room/use context','what is included'],
    buyerQuestions: ['How big is it?','What color is it in real life?','How do I care for it?','What is included?'],
    conversionAngles: ['room transformation','texture/material','scale clarity','styling versatility'],
    avoidClaims: ['fire-safety or durability claims without evidence','exact color match across displays'],
    imagePriorities: ['styled room shot','scale reference','texture close-up','dimensions graphic','multiple angles'],
    marketplaceNotes: { etsy: 'Use decor style, room, material, and gift/housewarming intent.', google: 'Keep titles attribute-led with type, material, color, size, and style.' },
  },
  {
    id: 'art-print', label: 'Art & Prints',
    detectionTerms: ['print','poster','wall art','artwork','illustration','painting','canvas'],
    requiredFacts: ['physical vs digital','dimensions/aspect ratio','paper/canvas/file format','frame included or not','color notes'],
    buyerQuestions: ['Is this a physical item?','Is the frame included?','What sizes are available?','What file format do I receive?'],
    conversionAngles: ['style/aesthetic','room fit','giftability','artist story','instant access for digital'],
    avoidClaims: ['implying a frame is included when it is not','copyright/trademark language not owned by seller'],
    imagePriorities: ['room mockup','close-up detail','size comparison','included/not-included clarity','digital file preview'],
    marketplaceNotes: { etsy: 'Disambiguate digital download versus physical print in the first lines.', tiktok: 'Show before/after wall styling or a fast room transformation.' },
  },
  {
    id: 'personalized-gift', label: 'Personalized Gifts',
    detectionTerms: ['personalized','personalised','custom','engraved','monogram','name gift','custom gift'],
    requiredFacts: ['personalization input','character/length limits','proof/revision process','production time','final-sale policy if applicable'],
    buyerQuestions: ['Where do I enter personalization?','Can I see a proof?','How long does customization take?','Can I change it after ordering?'],
    conversionAngles: ['recipient emotion','occasion','uniqueness','proof confidence','deadline clarity'],
    avoidClaims: ['guaranteed delivery dates unless seller supports them','unlimited revisions unless actually offered'],
    imagePriorities: ['personalized example','input guide','font/style choices','packaging','occasion context'],
    marketplaceNotes: { etsy: 'Front-load recipient + occasion + personalization intent.', amazon: 'Keep customization choices and lead times structured and explicit.' },
  },
  {
    id: 'digital-product', label: 'Digital Products',
    detectionTerms: ['digital','download','template','printable','svg','pdf','canva','preset','ebook'],
    requiredFacts: ['digital-only disclosure','file formats','dimensions/pages','software requirements','license/use rights','delivery method'],
    buyerQuestions: ['Is anything shipped?','What files do I get?','What software do I need?','Can I use this commercially?'],
    conversionAngles: ['instant access','ease of use','editable/customizable','time saved','use-case breadth'],
    avoidClaims: ['implying physical delivery','unclear commercial-use rights','software compatibility not verified'],
    imagePriorities: ['what-you-get overview','file/page previews','editing demo','use examples','compatibility badge'],
    marketplaceNotes: { etsy: 'Make “digital download / no physical item” impossible to miss.', shopify: 'Clarify fulfillment method and license terms near the purchase CTA.', woocommerce: 'Clarify download delivery, file formats, software needs and license terms before checkout.' },
  },
  {
    id: 'beauty', label: 'Beauty & Personal Care',
    detectionTerms: ['soap','skincare','serum','cream','lotion','lip balm','beauty','cosmetic','oil'],
    requiredFacts: ['ingredients','net quantity','usage','skin/hair type','warnings','storage'],
    buyerQuestions: ['What are the ingredients?','How do I use it?','Is it suitable for my skin type?','How long will it last?'],
    conversionAngles: ['texture/sensory experience','routine fit','ingredient transparency','packaging','giftability'],
    avoidClaims: ['medical claims','disease treatment claims','guaranteed results','hypoallergenic claims unless substantiated'],
    imagePriorities: ['texture close-up','ingredient/label image','size-in-hand','usage demonstration','packaging'],
    marketplaceNotes: { amazon: 'Keep claims conservative and ingredient/use facts prominent.', tiktok: 'Show texture and routine use without unsupported efficacy promises.' },
  },
  {
    id: 'food', label: 'Food & Consumables',
    detectionTerms: ['food','snack','tea','coffee','chocolate','cookie','sauce','spice','candy'],
    requiredFacts: ['ingredients','allergens','net weight','storage','shelf life','dietary certifications only if verified'],
    buyerQuestions: ['What allergens are present?','How should I store it?','How much is included?','When does it expire?'],
    conversionAngles: ['flavor profile','origin','serving occasion','giftability','freshness'],
    avoidClaims: ['health/disease claims','certifications not actually held','guaranteed freshness beyond seller policy'],
    imagePriorities: ['packaging/label','serving suggestion','portion/scale','texture close-up','ingredients'],
    marketplaceNotes: { amazon: 'Prioritize ingredients, quantity, dietary facts, storage, and compliance.', etsy: 'Balance handmade/origin story with allergen and fulfillment clarity.' },
  },
  {
    id: 'electronics', label: 'Electronics & Tech Accessories',
    detectionTerms: ['charger','cable','case','keyboard','mouse','electronic','adapter','stand','headphone'],
    requiredFacts: ['compatibility','dimensions','connectors/specs','power rating if relevant','what is included','warranty/returns'],
    buyerQuestions: ['Will this work with my device?','What is included?','What are the exact specs?','Does it require an adapter?'],
    conversionAngles: ['compatibility certainty','problem solved','setup simplicity','durability evidence','portability'],
    avoidClaims: ['unsupported certification/safety claims','universal compatibility','performance benchmarks without evidence'],
    imagePriorities: ['compatibility chart','ports/connectors','in-use setup','dimensions','box contents'],
    marketplaceNotes: { amazon: 'Front-load compatibility and key specs.', ebay: 'Be explicit about model numbers, condition, included accessories, and compatibility.' },
  },
  {
    id: 'accessories', label: 'Accessories',
    detectionTerms: ['bag','wallet','hat','cap','scarf','belt','accessory','purse','tote'],
    requiredFacts: ['material','dimensions','capacity/fit','closure','care','color/variant'],
    buyerQuestions: ['How much does it hold?','What are the dimensions?','What is the material?','How do I care for it?'],
    conversionAngles: ['daily utility','style','organization','comfort','giftability'],
    avoidClaims: ['waterproof unless verified','leather type not verified','capacity claims without dimensions'],
    imagePriorities: ['on-body scale','inside/capacity','closure','material close-up','dimensions'], marketplaceNotes: {},
  },
  {
    id: 'craft-supplies', label: 'Craft Supplies',
    detectionTerms: ['beads','yarn','fabric','supply','supplies','vinyl','blank','findings','craft kit'],
    requiredFacts: ['quantity','dimensions','material','color','compatibility/use','batch variation'],
    buyerQuestions: ['How many are included?','What size are they?','Will this work for my project?','Is color consistent between batches?'],
    conversionAngles: ['project suitability','quantity/value','consistency','creative possibilities'],
    avoidClaims: ['tool/material compatibility unless verified','exact batch color matching'],
    imagePriorities: ['quantity overview','scale','close-up','example project','variant chart'],
    marketplaceNotes: { etsy: 'Use craft type, material, size, quantity, and intended project keywords.' },
  },
  {
    id: 'generic', label: 'General Product', detectionTerms: [],
    requiredFacts: ['material','dimensions','what is included','care/use','variants','fulfillment expectations'],
    buyerQuestions: ['What exactly do I receive?','How big is it?','What is it made from?','How do I use or care for it?'],
    conversionAngles: ['clear benefit','use case','material/spec confidence','giftability where relevant'],
    avoidClaims: ['unsupported guarantees or certifications'],
    imagePriorities: ['hero image','scale','details','in-use context','what is included'], marketplaceNotes: {},
  },
]

export function getProductProfile(id?: string | null): ProductProfile | undefined {
  if (!id) return undefined
  return PRODUCT_PROFILES.find((profile) => profile.id === id)
}

export function inferProductProfile(...parts: Array<string | null | undefined>): ProductProfile {
  const haystack = parts.filter(Boolean).join(' ').toLowerCase()
  let best = getProductProfile('generic')!
  let bestScore = 0
  for (const profile of PRODUCT_PROFILES) {
    if (profile.id === 'generic') continue
    const score = profile.detectionTerms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0)
    if (score > bestScore) { best = profile; bestScore = score }
  }
  return best
}

export function productProfileContext(profile: ProductProfile, platformId?: string): string {
  const platformNote = platformId ? profile.marketplaceNotes[platformId as keyof ProductProfile['marketplaceNotes']] : undefined
  return [
    `Product category: ${profile.label}`,
    `Critical facts to surface: ${profile.requiredFacts.join(', ')}`,
    `Buyer questions to answer: ${profile.buyerQuestions.join(' | ')}`,
    `Conversion angles: ${profile.conversionAngles.join(', ')}`,
    `Avoid unsupported claims: ${profile.avoidClaims.join(', ')}`,
    `Image/content priorities: ${profile.imagePriorities.join(', ')}`,
    platformNote ? `Category × marketplace note: ${platformNote}` : '',
  ].filter(Boolean).join('\n')
}
