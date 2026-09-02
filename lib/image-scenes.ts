// Scene / format templates for product imagery. Whereas CATEGORY_PRESETS in
// lib/openai.ts tune for *what* the product is, SCENE_TEMPLATES tune for *what
// kind of image* to make. This is the "full set" dimension — main image (主图),
// detail page (详情图) and social media (社媒图) — lifted from the ecommerce
// image-generation skills and kept as pure data so both the server prompt
// builder and the client UI can share one source of truth.

export interface SceneTemplate {
  label: string
  group: 'main' | 'detail' | 'social'
  logic: string
  promptHints: string
  avoid: string
}

export const SCENE_TEMPLATES: Record<string, SceneTemplate> = {
  hero: {
    label: 'Main Image — Clean Hero',
    group: 'main',
    logic: 'The canonical e-commerce main image. Product centered and front-facing on a seamless light background, occupying roughly 80% of the frame with generous negative space around it. Flat, even, soft-shadowed lighting so the product reads instantly in search results and on the listing thumbnail.',
    promptHints: 'centered front view, seamless light background, ~80% product occupancy, soft even studio light, crisp focus, professional e-commerce hero',
    avoid: 'No watermark or logo, no busy background, no harsh shadows, no clipped edges, no mirror-floor reflection, no extra props',
  },
  lifestyle: {
    label: 'Lifestyle — In Use',
    group: 'main',
    logic: 'The product placed in a real, believable environment being used or styled, so the buyer pictures it in their own life. Natural light, lived-in warmth, shallow depth of field keeping the product the sharp focal point.',
    promptHints: 'real home or outdoor setting, natural daylight, lived-in warmth, product as sharp focal point, relatable aspirational mood',
    avoid: 'No sterile studio backdrop, no product floating disconnected from the scene, no competing focal points',
  },
  'flat-lay': {
    label: 'Flat-Lay — Top Down',
    group: 'main',
    logic: 'A top-down flat lay of the product styled with a few tasteful, thematically-matched props on a textured surface. Even overhead lighting, balanced negative space, organized composition.',
    promptHints: 'top-down flat lay, tasteful matching props, textured surface, even overhead light, balanced organized composition',
    avoid: 'No cluttered chaotic pile, no shadows that distort shape, no props that outshine the product',
  },
  'detail-macro': {
    label: 'Detail — Macro Close-Up',
    group: 'detail',
    logic: 'An extreme close-up that sells material quality: fabric weave, wood grain, stitching, metal polish, glaze texture. Shallow depth of field with real lens bokeh, the product texture filling most of the frame.',
    promptHints: 'extreme macro close-up, material texture, real lens bokeh, shallow depth of field, craftsmanship detail',
    avoid: 'No whole-product wide shot, no fake uniform blur, no plastic-smooth surfaces',
  },
  infographic: {
    label: 'Detail — Feature / A+ Content',
    group: 'detail',
    logic: 'A clean feature callout graphic (Amazon A+ / Etsy infographic style): the product plus short labeled benefit blocks or a small comparison layout. Crisp on-image typography, structured sections, professional layout.',
    promptHints: 'feature callout blocks, clean labeled sections, crisp typography, structured infographic layout, professional',
    avoid: 'No garbled or warped lettering, no overcrowded text, no fake 3D objects',
  },
  'multi-angle': {
    label: 'Detail — Multi-Angle Grid',
    group: 'detail',
    logic: 'Multiple angles of the same product arranged in a clean grid within one image (front, side, back, top, detail), each angle at the same scale and lighting for a consistent catalog look.',
    promptHints: 'multi-angle grid, front side back top views, consistent scale and lighting, catalog presentation',
    avoid: 'No inconsistent lighting between angles, no mismatched product colors, no overlapping views',
  },
  poster: {
    label: 'Poster — Marketing Banner',
    group: 'social',
    logic: 'A marketing poster/banner with a short headline, the product as hero, and optional subtitle, price and call-to-action. Bold, scroll-stopping composition with clean typography.',
    promptHints: 'marketing poster, short headline, product hero, bold composition, clean typography, call-to-action',
    avoid: 'No garbled text, no cluttered layout, no mismatched fonts',
  },
  social: {
    label: 'Social Media — Organic Feed',
    group: 'social',
    logic: 'An authentic social-media photo that does NOT look AI-generated or like a studio ad. Casual phone-camera feel, natural imperfect lighting, film-like color, believable everyday moment with the product.',
    promptHints: 'phone camera feel, natural imperfect light, film-like color grade, authentic everyday moment, believable and real',
    avoid: 'No studio advertising look, no oversaturated candy colors, no AI-perfect symmetry, no obvious marketing text',
  },
  ugc: {
    label: 'Social — UGC / Creator Style',
    group: 'social',
    logic: 'User-generated-content style: a real person (hands, partial body, or a lifestyle crop) casually holding or using the product in an everyday setting, as if photographed by a customer. Genuine, unpolished, trustworthy.',
    promptHints: 'user generated content, real hands or person in frame, casual everyday setting, genuine unpolished trustworthy feel',
    avoid: 'No model-perfect posed studio shot, no clinical backdrop, no stock-photo stiffness',
  },
}

export function getSceneTemplate(scene?: string): SceneTemplate | null {
  return (scene && SCENE_TEMPLATES[scene]) || null
}

// Campaign Style Lock — a fixed, deterministic visual identity applied to every
// image in a batch so a multi-image campaign (main + detail + social) reads as
// one cohesive set. Deterministic hex codes + lighting words, not LLM-guessed,
// which is what actually keeps a batch visually consistent.
export const CAMPAIGN_STYLE_LOCK = {
  palette: '#FFFFFF · #2D2D2D · #D4AF37 · #F5F1E8 · #1A3A2E',
  tone: 'warm',
  typography: 'clean modern sans-serif',
  background: 'soft warm-white / ivory seamless backdrop',
  lighting: 'soft diffused natural window light from the upper left, gentle soft shadows',
  layout: 'centered product with generous negative space',
  mood: 'minimalist premium editorial',
}

export function buildStyleLockText(): string {
  return (
    'Campaign Style Lock — apply this EXACT visual identity to the image so the whole set stays consistent:\n' +
    '- Color palette (use only these tones): ' + CAMPAIGN_STYLE_LOCK.palette + '\n' +
    '- Overall tone: ' + CAMPAIGN_STYLE_LOCK.tone + '\n' +
    '- Typography for any on-image text: ' + CAMPAIGN_STYLE_LOCK.typography + '\n' +
    '- Background: ' + CAMPAIGN_STYLE_LOCK.background + '\n' +
    '- Lighting: ' + CAMPAIGN_STYLE_LOCK.lighting + '\n' +
    '- Layout: ' + CAMPAIGN_STYLE_LOCK.layout + '\n' +
    '- Mood: ' + CAMPAIGN_STYLE_LOCK.mood + '\n'
  )
}

// The "full set" preset: one image per core format so a seller gets a complete
// main + detail + social campaign in a single generation run.
export const CAMPAIGN_SET_SCENES = ['hero', 'lifestyle', 'detail-macro', 'social']
