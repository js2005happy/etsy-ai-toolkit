import OpenAI from "openai";
import { getPlatform } from "@/lib/platforms";
import { getSceneTemplate, buildStyleLockText } from "@/lib/image-scenes";

export interface ListingInput { product_name: string; product_type: string; material: string; style: string; platform?: string; brand_tone?: string; brand_keywords?: string; }
export interface ListingOutput { title: string; description: string; tags: string[]; }
export interface MessageReplyInput { customer_message: string; product_info?: string; tone: string; platform?: string; brand_tone?: string; brand_keywords?: string; }
export interface MessageReplyOutput { replies: string[]; }
export interface SocialPostInput { product_description: string; platform: string; brand_tone?: string; brand_keywords?: string; }
export interface SocialPostOutput { caption: string; hashtags: string[]; }
export interface ReviewReplyInput { review_text: string; rating: number; tone: string; platform?: string; brand_tone?: string; brand_keywords?: string; }
export interface ReviewReplyOutput { replies: string[]; }
export interface AnnouncementInput { shop_type: string; announcement_type: string; tone: string; platform?: string; brand_tone?: string; brand_keywords?: string; }
export interface AnnouncementOutput { announcement: string; }
export interface KeywordsInput { product_type: string; market?: string; style?: string; platform?: string; }
export interface KeywordsOutput { keywords: string[]; }
export interface TranslateInput { text: string; target_language: string; platform?: string; }
export interface TranslateOutput { translated_text: string; }
export interface TranslateImageInput { image: string; target_language: string; }
export interface TranslateImageOutput { translated_text: string; extracted_text?: string; }
export interface OptimizeListingInput { current_title?: string; current_description?: string; current_tags?: string; platform?: string; brand_tone?: string; brand_keywords?: string; }
export interface OptimizeListingOutput { title: string; description: string; tags: string[]; suggestions: string; }
export interface PricingInput { material_cost: number; labor_cost: number; shipping_cost: number; competitor_price_min?: number; competitor_price_max?: number; desired_profit_margin?: number; platform?: string; }
export interface PricingOutput { suggested_price: number; estimated_profit: number; pricing_strategy: string; }

// New e-commerce tool inputs/outputs
export interface BulletPointsInput { product_name: string; product_description: string; platform?: string; count?: number; brand_tone?: string; brand_keywords?: string; }
export interface BulletPointsOutput { bullets: string[]; }
export interface AdCopyInput { product_name: string; product_description: string; platform?: string; goal: string; audience?: string; brand_tone?: string; brand_keywords?: string; }
export interface AdCopyOutput { headlines: string[]; primary_text: string; description: string; cta: string; }
export interface EmailInput { email_type: string; product_name: string; product_description: string; audience?: string; brand_tone?: string; brand_keywords?: string; }
export interface EmailOutput { subject: string; preview_text: string; body: string; }
export interface CompetitorAnalysisInput { product_name: string; product_description: string; competitor_name?: string; competitor_description?: string; platform?: string; }
export interface CompetitorAnalysisOutput { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[]; differentiation: string; }
export interface BrandStoryInput { brand_name: string; product_type: string; origin_story?: string; values?: string; audience?: string; }
export interface BrandStoryOutput { story: string; mission: string; tagline: string; }

const PRIMARY_CHAT_MODEL = "gpt-4o-mini";
const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const GROQ_CHAT_MODEL = process.env.GROQ_CHAT_MODEL || "llama-3.3-70b-versatile";
const MOMA_VISION_BASE_URL = process.env.MOMA_VISION_BASE_URL || "https://moma.cmecloud.cn/v1";
const MOMA_VISION_MODEL = process.env.MOMA_VISION_MODEL || "qwen/qwen3.7-plus";

// Fail loud if mock mode leaks into production — serving canned responses to
// paying users is worse than an outage.
const MOCK_ENABLED = process.env.USE_MOCK_AI === "true";
if (MOCK_ENABLED && process.env.NODE_ENV === "production") {
  throw new Error("USE_MOCK_AI must not be enabled in production");
}

function momaVisionClient(): OpenAI {
  return new OpenAI({ apiKey: process.env.MOMA_VISION_API_KEY, baseURL: MOMA_VISION_BASE_URL });
}

function primaryClient(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY, baseURL: process.env.OPENAI_BASE_URL });
}

function groqClient(): OpenAI {
  return new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: GROQ_BASE_URL });
}

// Primary relay gateway first; fall back to Groq (if configured) on failure.
async function chat(user: string, opts: { system?: string; temperature?: number } = {}): Promise<string> {
  const messages: any[] = [];
  if (opts.system) messages.push({ role: "system", content: opts.system });
  messages.push({ role: "user", content: user });

  const run = async (client: OpenAI, model: string) => {
    const params: any = { model, messages, temperature: opts.temperature ?? 0.7 };
    const r = await client.chat.completions.create(params);
    return r.choices[0]?.message?.content || "";
  };

  try {
    return await run(primaryClient(), PRIMARY_CHAT_MODEL);
  } catch (primaryErr) {
    if (!process.env.GROQ_API_KEY) throw primaryErr;
    try {
      return await run(groqClient(), GROQ_CHAT_MODEL);
    } catch {
      throw primaryErr;
    }
  }
}

// ---- Output hygiene helpers -------------------------------------------------

// Robustly pull a JSON object out of a model reply: tolerates ```json fences
// and stray prose before/after the object.
function extractJson(content: string): any {
  const cleaned = content
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  try {
    if (start !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    return JSON.parse(cleaned);
  } catch {
    throw new Error("AI returned invalid JSON");
  }
}

// Unified JSON generation entry point. Guarantees a parsed object or throws:
// primary model → Groq fallback (if configured) → one retry on parse failure.
async function chatJson(system: string, user: string, temperature = 0.4): Promise<any> {
  const messages: any[] = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: user });

  const call = (client: OpenAI, model: string) =>
    client.chat.completions.create({
      model,
      messages,
      response_format: { type: "json_object" },
      temperature,
    });

  let raw = "";
  try {
    raw = (await call(primaryClient(), PRIMARY_CHAT_MODEL)).choices[0]?.message?.content || "";
    return extractJson(raw);
  } catch (primaryErr) {
    if (process.env.GROQ_API_KEY) {
      try {
        raw = (await call(groqClient(), GROQ_CHAT_MODEL)).choices[0]?.message?.content || "";
        return extractJson(raw);
      } catch {
        // fall through to primary retry
      }
    }
    try {
      raw = (await call(primaryClient(), PRIMARY_CHAT_MODEL)).choices[0]?.message?.content || "";
      return extractJson(raw);
    } catch {
      // rethrow the original error
    }
    throw primaryErr;
  }
}

// De-duplicate + trim + cap a string list (tags / keywords / hashtags).
// Strips a leading "#" so a hashtag tool never ships "#hashtag".
function cleanList(items: any[], max: number, maxLen = 0): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of items || []) {
    if (raw == null) continue;
    let s = String(raw).trim().replace(/^#+/, "");
    if (!s) continue;
    if (maxLen > 0) s = s.slice(0, maxLen);
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
    if (out.length >= max) break;
  }
  return out;
}

// Hard-truncate a string to a character budget (e.g. marketplace title cap).
function clampText(s: string, maxLen: number): string {
  const t = (s || "").trim();
  return t.length <= maxLen ? t : t.slice(0, maxLen);
}

function brandContext(tone?: string, keywords?: string): string {
  if (!tone && !keywords) return ''
  const parts: string[] = []
  if (tone) parts.push(`Brand tone: ${tone}`)
  if (keywords) parts.push(`Brand keywords to weave in naturally: ${keywords}`)
  return `\n\nBrand voice — apply these to the output:\n- ${parts.join('\n- ')}`
}

// Single source of marketplace SEO rules, injected into every prompt so the
// same tool "tunes" itself per marketplace (Etsy tags vs Amazon bullets, etc.)
function platformContext(id?: string): string {
  const p = getPlatform(id)
  return [
    `Marketplace: ${p.label}`,
    `Title rule: ${p.titleRule}`,
    `Description rule: ${p.descriptionRule}`,
    `Bullets/highlights rule: ${p.bulletsRule}`,
    `Keyword rule: ${p.keywordRule}`,
    `Tone: ${p.tone}`,
  ].join('\n')
}

// A single shared "voice" directive so every tool sounds like a maker, not a
// corporate drone. Kept in one place so tuning it tunes every tool.
const VOICE_DIRECTIVE =
  "Voice: write like a real maker talking to a real buyer — warm, plain-spoken, " +
  "no corporate filler. Never use hollow hype words (elevate, curated, must-have, " +
  "artisanal) unless the seller already does.";

export async function generateListing(input: ListingInput): Promise<ListingOutput> {
  if (process.env.USE_MOCK_AI === "true") {
    return {
      title: "[MOCK] Premium " + input.product_name + " - " + input.product_type + " made of " + input.material,
      description: "This is a high-quality " + input.product_name + " crafted from the finest " + input.material + ".\n\nHighlights:\n- Exquisite " + input.style + " design\n- Durable and long-lasting\n- Perfect for any occasion\n\nOrder now to add this beautiful " + input.product_name + " to your collection!",
      tags: ["handmade","etsyseller","giftidea","custom","unique","artisan","home","decor","style","material","quality","premium","sale"]
    };
  }
  const p = getPlatform(input.platform);
  const tagCount = p.id === 'etsy' ? 13 : 15;
  const system = "You are an expert e-commerce listing writer for " + p.label + ". Always return valid JSON.";
  const user =
    "Write a high-converting product listing from the maker's rough notes.\n\n" +
    "Marketplace rules:\n" + platformContext(input.platform) + "\n\n" +
    "Product details:\n" +
    "- Product Name: " + input.product_name + "\n" +
    "- Product Type: " + input.product_type + "\n" +
    "- Material: " + input.material + "\n" +
    "- Style: " + input.style + brandContext(input.brand_tone, input.brand_keywords) + "\n\n" +
    VOICE_DIRECTIVE + "\n\n" +
    "Example of the quality we expect (rough note -> listing):\n" +
    "NOTE: speckled mug sage glaze 12oz dishwasher ok small batch\n" +
    "OUTPUT: {\"title\":\"Hand-thrown Speckled Mug, Sage — Small Batch 12oz Stoneware\",\"description\":\"Wheel-thrown in small batches and glazed in a soft sage that pools a shade deeper near the foot. Iron in the clay burns through as fine speckles, so no two are alike.\\n\\nHolds 12oz. Dishwasher and microwave safe.\",\"tags\":[\"speckled mug\",\"sage mug\",\"stoneware mug\",\"handmade mug\",\"12oz mug\",\"small batch pottery\",\"dishwasher safe\",\"kitchen gift\",\"pottery cup\",\"ceramic mug\",\"gift for her\",\"cottagecore\",\"artisan mug\"]}\n\n" +
    "Now write the listing. Return JSON with exactly three fields:\n" +
    "1. \"title\": optimized title, max " + p.titleMax + " characters, front-load the strongest long-tail keywords, no ALL-CAPS\n" +
    "2. \"description\": story-driven, lead with material and craftsmanship, 2-3 short paragraphs, weave keywords in naturally\n" +
    "3. \"tags\": exactly " + tagCount + " tags, each max 20 characters, lowercase, no duplicates, multi-word phrases buyers actually search";

  const raw = await chatJson(system, user, 0.4);
  return {
    title: clampText(String(raw.title || input.product_name), p.titleMax),
    description: String(raw.description || ""),
    tags: cleanList(raw.tags, tagCount, 20),
  };
}

export async function generateMessageReply(input: MessageReplyInput): Promise<MessageReplyOutput> {
  if (process.env.USE_MOCK_AI === "true") {
    return { replies: ["Thank you for reaching out! We're sorry to hear about the issue and would love to make it right. Could you please share more details?", "We appreciate your patience and we are here to help. Please let us know how we can resolve this for you.", "We're so sorry for the inconvenience. We will do our best to fix this promptly."] };
  }
  const p = getPlatform(input.platform);
  const system = "You are a customer-service assistant for a " + p.label + " seller. Always return valid JSON.";
  const user =
    "Draft three replies to this buyer message, each a different angle:\n" +
    "1) a direct answer that solves it now, 2) a warmer option that adds a small reassurance, 3) a shorter one with a clear next step.\n\n" +
    "Buyer message: " + input.customer_message + (input.product_info ? "\nProduct info: " + input.product_info : "") +
    "\nTone: " + input.tone + brandContext(input.brand_tone, input.brand_keywords) + "\n\n" +
    VOICE_DIRECTIVE + "\n\n" +
    "Example (buyer asks about shipping):\n" +
    "OUTPUT: {\"replies\":[\"Tracked shipping to Canada is $14 and usually lands in 6-9 business days once it leaves the studio.\",\"Happy to help — tracked shipping to Canada is $14 and usually takes 6-9 business days. Want me to set one aside while you decide?\",\"Yes! $14 tracked, about 6-9 business days. Want me to hold one for you?\"]}\n\n" +
    "Return JSON with exactly one field:\n\"replies\": array of exactly three strings";

  const raw = await chatJson(system, user, 0.4);
  return { replies: cleanList(raw.replies, 3) };
}

export async function generateSocialPost(input: SocialPostInput): Promise<SocialPostOutput> {
  if (process.env.USE_MOCK_AI === "true") {
    return { caption: "Check out this amazing product! Perfect for any occasion. #handmade #giftideas", hashtags: ["handmade","giftideas","smallbusiness","shopsmall","etsyfinds","homedecor","unique","supportsmallbusiness"] };
  }
  const p = getPlatform(input.platform);
  const system = "You are a social media expert. Always return valid JSON.";
  const user =
    "Write a social post for " + p.label + " that sounds native to that platform.\n\n" +
    "Platform tone to match: " + p.tone + "\n" +
    "Product description: " + input.product_description + brandContext(input.brand_tone, input.brand_keywords) + "\n\n" +
    VOICE_DIRECTIVE + "\n\n" +
    "Example of the quality we expect:\n" +
    "OUTPUT: {\"caption\":\"Twelve mugs went into the kiln. Eleven came out. The twelfth cracked at the handle and now holds pencils on my shelf. Eleven sage and oat mugs go live Thursday.\",\"hashtags\":[\"handmadepottery\",\"smallbatch\",\"potterystudio\",\"shopsmall\",\"ceramics\",\"kilnopening\",\"handmadehome\",\"makersgonnamake\",\"wheelthrown\",\"supportsmallbusiness\"]}\n\n" +
    "Return JSON with exactly two fields:\n" +
    "1. \"caption\": a short, engaging caption that tells a small story or shows the product in life (first line must stop the scroll)\n" +
    "2. \"hashtags\": an array of 8-15 relevant hashtags, without the # symbol, no duplicates";

  const raw = await chatJson(system, user, 0.7);
  return { caption: String(raw.caption || ""), hashtags: cleanList(raw.hashtags, 15, 30) };
}

export async function generateReviewReply(input: ReviewReplyInput): Promise<ReviewReplyOutput> {
  if (process.env.USE_MOCK_AI === "true") {
    return { replies: ["Thank you so much for your kind words! We're thrilled you love your order.", "We're sorry to hear that. We'd love to make things right. Please send us a message.", "Thank you for your feedback. We're always improving our products and service."] };
  }
  const p = getPlatform(input.platform);
  const ratingWord = input.rating >= 5 ? "positive" : input.rating >= 4 ? "mixed-positive" : input.rating >= 3 ? "neutral" : "negative";
  const system = "You are a " + p.label + " seller replying to a customer review. Always return valid JSON.";
  const user =
    "Write two or three replies to this " + ratingWord + " review (" + input.rating + " stars).\n" +
    "- For positive reviews: thank them genuinely, don't oversell.\n" +
    "- For neutral/negative reviews: acknowledge the specific complaint without defensiveness, say what you changed, and invite a fix.\n\n" +
    "Review text: " + input.review_text + "\nTone: " + input.tone + brandContext(input.brand_tone, input.brand_keywords) + "\n\n" +
    VOICE_DIRECTIVE + "\n\n" +
    "Example (3-star review):\n" +
    "REVIEW: nice mug but smaller than I expected\n" +
    "OUTPUT: {\"replies\":[\"Fair point, and I should have been clearer — it's 12oz, which is a smaller pour than most diner mugs. I've added the height in inches to the listing photos.\",\"Thanks for saying so. It's a 12oz mug, and I've added exact dimensions to the photos so it's easier to judge before ordering.\"]}\n\n" +
    "Return JSON with exactly one field:\n\"replies\": array of two or three strings, appropriate for a " + ratingWord + " review";

  const raw = await chatJson(system, user, 0.4);
  return { replies: cleanList(raw.replies, 3) };
}

export async function generateAnnouncement(input: AnnouncementInput): Promise<AnnouncementOutput> {
  if (process.env.USE_MOCK_AI === "true") {
    return { announcement: "Welcome to our shop! We specialize in beautiful " + input.shop_type + " items. Thank you for visiting, and feel free to reach out with any questions!" };
  }
  const p = getPlatform(input.platform);
  const system = "You are a helpful " + p.label + " shop owner. Always return valid JSON.";
  const user =
    "Write a short shop announcement (" + input.announcement_type + ") for a shop that sells " + input.shop_type + ".\nTone: " + input.tone + brandContext(input.brand_tone, input.brand_keywords) + "\n\n" +
    VOICE_DIRECTIVE + "\n\n" +
    "Keep it to two or three sentences. Be specific (dates, times, what changed) rather than vague.\n\n" +
    "Return JSON with exactly one field:\n\"announcement\": a string of the announcement text";

  const raw = await chatJson(system, user, 0.7);
  return { announcement: String(raw.announcement || "") };
}

export async function generateKeywords(input: KeywordsInput): Promise<KeywordsOutput> {
  if (process.env.USE_MOCK_AI === "true") {
    return { keywords: ["handmade " + input.product_type, "unique " + input.product_type, "gift " + input.product_type, "custom " + input.product_type, "small business " + input.product_type, "etsy " + input.product_type, "best " + input.product_type, "personalized " + input.product_type] };
  }
  const p = getPlatform(input.platform);
  const system = "You are an expert keyword researcher for " + p.label + ". Always return valid JSON.";
  const user =
    "Generate 15 high-search-volume, long-tail keywords for a product type: " + input.product_type +
    (input.market ? " targeting market: " + input.market : "") +
    (input.style ? " with style: " + input.style : "") + ".\n\n" +
    "Keyword rule for " + p.label + ": " + p.keywordRule + "\n\n" +
    "Requirements:\n" +
    "- Mix of exact phrases and long-tail modifiers (gift, for her, handmade, small batch, etc.)\n" +
    "- No single generic words, no duplicates, no competitor brand names\n" +
    "- Lowercase, multi-word phrases buyers actually type into search\n\n" +
    "Example (product type: linen apron):\n" +
    "OUTPUT: {\"keywords\":[\"linen apron\",\"handmade linen apron\",\"adjustable apron\",\"linen kitchen apron\",\"apron with pockets\",\"oat linen apron\",\"gift for baker\",\"women apron\",\"natural linen apron\",\"crossback apron\",\"personalized apron\",\"linen cooking apron\",\"minimalist apron\",\"apron for him\",\"small batch apron\"]}\n\n" +
    "Return JSON with exactly one field:\n\"keywords\": an array of 15 keyword strings";

  const raw = await chatJson(system, user, 0.4);
  return { keywords: cleanList(raw.keywords, 15, 50) };
}

export async function translateListing(input: TranslateInput): Promise<TranslateOutput> {
  if (process.env.USE_MOCK_AI === "true") {
    return { translated_text: "[MOCK Translation] " + input.text + " (translated to " + input.target_language + ")" };
  }
  const p = getPlatform(input.platform);
  const system = "You are a professional e-commerce translator. Always return valid JSON.";
  const user =
    "Translate the following " + p.label + " listing text into " + input.target_language + ".\n" +
    "Keep it natural for a native reader. Preserve SEO keywords, product names, measurements, and line breaks. Don't add marketing copy that wasn't there.\n\n" +
    "Text:\n" + input.text + "\n\n" +
    "Return JSON with exactly one field:\n\"translated_text\": the translated text";

  const raw = await chatJson(system, user, 0.3);
  return { translated_text: String(raw.translated_text || input.text) };
}

export async function translateImage(input: TranslateImageInput): Promise<TranslateImageOutput> {
  if (process.env.USE_MOCK_AI === "true") {
    return { translated_text: "[MOCK Image Translation to " + input.target_language + "]", extracted_text: "[MOCK extracted text]" };
  }
  const prompt =
    "You are given an image that may contain text (e.g. a product poster or listing graphic). " +
    "Step 1: transcribe ALL readable text from the image. " +
    "Step 2: translate that text into " + input.target_language + ", keeping SEO-friendly keywords and line breaks.\n\n" +
    "Return JSON with exactly two fields:\n" +
    "1. \"extracted_text\": the original text found in the image\n" +
    "2. \"translated_text\": the translation in " + input.target_language;

  const r = await momaVisionClient().chat.completions.create({
    model: MOMA_VISION_MODEL,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: input.image } },
        ],
      },
    ],
  });

  const content = r.choices[0]?.message?.content || "";
  try {
    return extractJson(content) as TranslateImageOutput;
  } catch {
    return { translated_text: content };
  }
}

export async function optimizeListing(input: OptimizeListingInput): Promise<OptimizeListingOutput> {
  if (process.env.USE_MOCK_AI === "true") {
    return {
      title: "[MOCK Optimized] " + (input.current_title || "Handmade Item"),
      description: "This is a mock optimized description for your listing. Add more details and keywords.",
      tags: ["optimized", "mock", "listing", "tags"],
      suggestions: "Add more long-tail keywords and use all 13 tags."
    };
  }
  const p = getPlatform(input.platform);
  const tagCount = p.id === 'etsy' ? 13 : 15;
  const system = "You are an expert e-commerce listing optimizer for " + p.label + ". Always return valid JSON.";
  const user =
    "Improve this existing listing so it ranks better on " + p.label + ", while keeping the seller's voice.\n\n" +
    "Marketplace rules:\n" + platformContext(input.platform) + "\n\n" +
    "Current title: " + (input.current_title || "N/A") + "\n" +
    "Current description: " + (input.current_description || "N/A") + "\n" +
    "Current tags: " + (input.current_tags || "N/A") + brandContext(input.brand_tone, input.brand_keywords) + "\n\n" +
    VOICE_DIRECTIVE + "\n\n" +
    "Return JSON with these fields:\n" +
    "1. \"title\": optimized title (max " + p.titleMax + " characters)\n" +
    "2. \"description\": optimized description\n" +
    "3. \"tags\": array of " + tagCount + " optimized tags (lowercase, max 20 chars, no duplicates)\n" +
    "4. \"suggestions\": 2-3 sentences explaining concretely what you changed and why it helps";

  const raw = await chatJson(system, user, 0.4);
  return {
    title: clampText(String(raw.title || input.current_title || ""), p.titleMax),
    description: String(raw.description || ""),
    tags: cleanList(raw.tags, tagCount, 20),
    suggestions: String(raw.suggestions || ""),
  };
}

export interface ProductImageInput { product_name: string; product_description: string; platform: string; size: string; style: string; language?: string; category?: string; scene?: string; style_lock?: boolean; }
export interface ProductImageOutput { imageUrl: string; revised_prompt?: string | null; }

// Per-category "tuning" presets. Each category carries a different working
// logic (how to stage/compose the shot and sell the product) plus a prompt
// vocabulary (lighting/material/mood) and a hard list of things to avoid.
// This is what makes a jewelry poster look like jewelry and a digital
// printable look like a flat mockup instead of a hallucinated physical object.
export interface CategoryPreset {
  label: string
  logic: string
  promptHints: string
  avoid: string
}

export const CATEGORY_PRESETS: Record<string, CategoryPreset> = {
  jewelry: {
    label: 'Jewelry & Accessories',
    logic: 'Extreme macro close-up that makes gem facets and metal details the hero. Stage on dark velvet or silk; use a single dramatic key light to pull specular highlights and a shallow depth of field to melt the background away. Optionally show the piece worn on a hand, ear or neck for scale.',
    promptHints: 'macro detail, specular highlights, dark velvet or silk backdrop, shallow depth of field, single dramatic key light, reflective polished metal, fine craftsmanship',
    avoid: 'No full-body mid shots, no cluttered multi-item piles, no cheap plastic look, no flat dull lighting',
  },
  clothing: {
    label: 'Clothing & Apparel',
    logic: 'Show the garment on a model to sell fit and drape, or a clean flat-lay. Use soft natural or studio light. Make fabric texture (cotton, linen, silk, knit) readable.',
    promptHints: 'on-model lifestyle or clean flat-lay, fabric drape and weave texture, soft natural light, flattering fit, styled wardrobe',
    avoid: 'No stiff mannequin plastic look, no cropped faces that read like stock, no wrinkled/creased fabric, no harsh flash',
  },
  accessories: {
    label: 'Bags & Accessories',
    logic: 'Product-hero close-up plus a lifestyle carry shot (bag on shoulder, hat on head, scarf draped). Emphasize leather/canvas grain and hardware (zippers, buckles, stitching).',
    promptHints: 'product hero close-up, leather or canvas texture, brushed hardware detail, lifestyle carry shot, structured silhouette',
    avoid: 'No ignored hardware or stitching detail, no busy background stealing focus, no muddy material',
  },
  shoes: {
    label: 'Shoes',
    logic: 'Three-quarter profile or top-down to reveal the last/silhouette. Emphasize sole and upper material. Add a floating or dynamic pose for energy, on a clean backdrop.',
    promptHints: '3/4 profile shot, sole and upper texture, floating or dynamic pose, clean seamless backdrop, crisp edges',
    avoid: 'No dead-on symmetric composition, no flat lighting without dimension, no scuffed/dirty look',
  },
  home_decor: {
    label: 'Home & Living Decor',
    logic: 'Place the piece in a real lived-in scene (shelf, bedside, dining table) so buyers see it in use. Warm natural light, cozy mood, soft shadows.',
    promptHints: 'styled interior scene, cozy warm natural light, lifestyle placement, soft shadows, lived-in warmth',
    avoid: 'No sterile white studio shot, no isolated object floating in void, no cold clinical tone',
  },
  furniture: {
    label: 'Furniture',
    logic: 'Single product-hero shot of the furniture piece against a clean wall or a minimal styled corner — NOT a fully furnished room. Keep the composition simple so the piece\'s structure reads perfectly. Emphasize wood grain or upholstery texture. Include exactly ONE subtle size reference (a floor plant, a throw, a rug edge) without cluttering the frame.',
    promptHints: 'single hero piece, clean wall or minimal corner, visible structural joinery, even straight legs touching the floor, correct proportions, natural window light, one subtle scale reference',
    avoid: 'No fully-furnished busy room, no melted or merged parts, no vanishing or uneven legs, no impossibly thin or asymmetrical frame, no repeating fake wood texture, no distorted proportions',
  },
  art_prints: {
    label: 'Art Prints & Wall Decor',
    logic: 'Show the artwork framed and hung on a styled wall, or propped in a gallery/living room. Keep print colors accurate and show frame/matting detail.',
    promptHints: 'framed artwork on styled wall, gallery or living room, faithful print color, matting and frame detail, natural side light',
    avoid: 'No bare image with zero wall reference, no color distortion, no washed-out print',
  },
  digital: {
    label: 'Digital Products & Printables',
    logic: 'Present as a FLAT mockup: the design on a tablet screen or printed page, with clean typography and crisp layout. This is a digital file, NOT a physical product — never render a real object.',
    promptHints: 'flat digital mockup, tablet screen or printed page presentation, clean typography, crisp layout, paper texture',
    avoid: 'NEVER render a physical 3D object, no fake shadows implying a real product, no mushy text, no skewed perspective',
  },
  craft_supplies: {
    label: 'Craft Supplies & Tools',
    logic: 'Arrange raw materials or tools to emphasize texture and DIY potential. Artisan workbench scene, organized flat-lay, tactile material feel.',
    promptHints: 'raw materials arranged, artisan workbench, tactile texture, organized craft flat-lay, hands-on maker mood',
    avoid: 'No finished-product look (these are supplies), no chaotic unfocused pile, no sterile packaging-only shot',
  },
  paper_party: {
    label: 'Paper & Party Supplies',
    logic: 'Flat-lay of invitations, cards or party decor with a bright festive palette. Show printed pattern and cut detail clearly.',
    promptHints: 'flat-lay stationery, bright festive palette, printed pattern detail, celebration theme, crisp paper edges',
    avoid: 'No dark muted tones, no fake 3D pop-up objects, no blurry print',
  },
  wedding: {
    label: 'Weddings',
    logic: 'Romantic soft light with a blush/ivory/gold palette. Emphasize delicate detail (florals, lace, ribbon) and an elegant ceremony mood.',
    promptHints: 'romantic soft light, blush and ivory palette, delicate florals and lace, elegant ceremony mood, airy',
    avoid: 'No garish loud colors, no cold clinical tone, no cluttered prop overload',
  },
  toys: {
    label: 'Toys & Games',
    logic: 'Bright playful scene with the toy as hero and fun props. Cheerful saturated but tasteful colors that spark play desire.',
    promptHints: 'bright playful scene, cheerful saturated colors, product hero with fun props, inviting and fun',
    avoid: 'No adult dark mood, no busy background stealing focus, no washed-out color',
  },
  baby: {
    label: 'Baby & Kids',
    logic: 'Soft gentle mood with low-saturation pastels and diffused light. Communicate safety and coziness; emphasize plush/soft materials.',
    promptHints: 'soft pastel palette, gentle diffused light, cozy safe mood, plush fabric texture, tender',
    avoid: 'No sharp or unsafe elements, no cold hard tone, no cluttered space',
  },
  pet: {
    label: 'Pet Supplies',
    logic: 'Show an adorable pet actually using the product, warm natural light, playful interaction in a cozy home setting. Keep product clearly visible.',
    promptHints: 'adorable pet in scene, warm natural light, playful interaction, cozy home setting, endearing',
    avoid: 'No distressed pet expression, no product upstaged by pet, no dim lighting',
  },
  beauty: {
    label: 'Beauty & Bath',
    logic: 'Clean fresh look with water splash, foam or cream texture. Minimal spa or bathroom backdrop; emphasize product consistency.',
    promptHints: 'clean minimal background, water splash or cream texture, spa mood, fresh dewy feel, soft even light',
    avoid: 'No greasy messy look, no over-airbrushed plastic feel, no harsh reflections',
  },
  food: {
    label: 'Food & Drink',
    logic: 'Appetizing close-up with warm backlight, visible steam or glaze, shallow depth of field and styled plating that makes you hungry.',
    promptHints: 'appetizing close-up, warm backlight, steam and glaze, shallow depth of field, styled plating, mouth-watering',
    avoid: 'No cold color grade, no dry grey food, no clutter ruining the plate',
  },
  vintage: {
    label: 'Vintage & Antiques',
    logic: 'Evoke age with warm sepia tones and patina. Stage on wood, old books or lace; emphasize time-worn character and nostalgic mood.',
    promptHints: 'warm sepia tones, aged patina, antique setting, nostalgic mood, soft faded light, time-worn character',
    avoid: 'No brand-new modern look, no cold white studio, no erased wear that kills authenticity',
  },
  handmade_crafts: {
    label: 'Handmade Crafts & Sculpture',
    logic: 'Celebrate the handmade, one-of-a-kind character. Show the material honestly (clay, wood grain, blown glass, woven fiber) on a simple display surface or workbench. Soft warm light to bring out craft warmth and the small imperfections that prove it is human-made.',
    promptHints: 'handmade artisan detail, tactile material (clay, wood grain, glass, woven fiber), soft warm light, craftsmanship, charming unique imperfections',
    avoid: 'No mass-produced factory look, no plastic-clean perfection, no harsh clinical light, no generic 3D render feel',
  },
  collectibles: {
    label: 'Collectibles & Figurines',
    logic: 'Make it feel rare and valuable. Stage on a display pedestal, shelf or clean dark backdrop with a single spotlight. Use a macro or eye-level angle to reveal fine sculpt detail and surface sheen.',
    promptHints: 'display case or clean pedestal, dramatic spot lighting, fine sculpt detail, collectible sheen, museum mood',
    avoid: 'No cheap toy look, no busy background, no soft focus, no flat lighting',
  },
  candles_fragrance: {
    label: 'Candles & Fragrance',
    logic: 'Evoke relaxation. Warm candlelight glow, wax texture and glass vessel detail, cozy home setting with soft ambient light. Sell the scent mood, not just the object.',
    promptHints: 'warm candlelight glow, cozy home setting, wax texture and glass vessel, soft ambient light, relaxing mood',
    avoid: 'No cold color grade, no dangerous open-flame drama, no empty blank backdrop',
  },
  stationery: {
    label: 'Stationery & Office',
    logic: 'Clean tidy desk flat-lay or a hand-using-it scene. Emphasize paper texture, printing quality and finishing. Bright soft light, minimal and organized.',
    promptHints: 'clean desk flat-lay, paper texture, tidy arrangement, bright soft light, minimal organized',
    avoid: 'No messy desk, no cheap plastic office clutter, no harsh overhead light',
  },
  plants_garden: {
    label: 'Plants & Garden',
    logic: 'Lush and alive. Natural daylight, thriving greenery, the planter or tool shown in use with soil and texture. Fresh airy feel.',
    promptHints: 'natural daylight, lush greenery, terracotta or ceramic planter, fresh airy feel, organic soil texture',
    avoid: 'No fake plastic plant look, no lifeless withered plants, no cold sterile light',
  },
  electronics: {
    label: 'Electronics & Accessories',
    logic: 'Tech-forward hero shot. Clean specular light, brushed metal / glass / silicone detail on a minimal or gradient backdrop. Precision and finish matter.',
    promptHints: 'tech product hero, clean specular light, brushed metal or glass, minimal gradient backdrop, precise detail',
    avoid: 'No cheap plastic look, no cluttered reflections, no overexposed highlights',
  },
  sports_outdoors: {
    label: 'Sports & Outdoors',
    logic: 'Show it in action or in a rugged outdoor scene under natural light. Emphasize durable materials and function, energetic mood.',
    promptHints: 'outdoor natural light, dynamic action or rugged scene, durable material, energetic mood',
    avoid: 'No indoor studio look, no flimsy feel, no disconnected from its environment',
  },
  musical_instruments: {
    label: 'Musical Instruments',
    logic: 'Highlight craftsmanship: warm wood grain, polished metal hardware, sound holes or strings. Warm light on a performance scene or clean backdrop.',
    promptHints: 'warm wood grain, polished metal hardware, soft warm light, performance or clean backdrop, fine craftsmanship',
    avoid: 'No cheap plastic instrument, no harsh glare, no out-of-focus detail',
  },
  books_media: {
    label: 'Books, Movies & Music',
    logic: 'Vintage or literary mood. Stacked or shelved arrangement that shows cover and paper texture, under warm library light.',
    promptHints: 'stacked or shelved arrangement, paper and cover texture, warm library light, vintage or literary mood',
    avoid: 'No cold white light, no cluttered pile, no modern plastic feel (unless the product is modern)',
  },
  photography: {
    label: 'Photography Gear',
    logic: 'Show lens glass reflection and matte metal body against a dark clean backdrop under a studio spot. Professional precision feel.',
    promptHints: 'lens glass reflection, matte metal body, dark clean backdrop, studio spot light, professional',
    avoid: 'No overexposure, no cheap plastic body, no stray reflections',
  },
  generic: {
    label: 'Other / General',
    logic: 'Standard product photography: hero the product, its material and selling points on a clean background or a simple lifestyle scene.',
    promptHints: 'clean product photography, clear subject, good lighting, professional, balanced composition',
    avoid: 'No clutter, no ambiguous subject, no unflattering light',
  },
}

export function getCategoryPreset(category?: string): CategoryPreset {
  return (category && CATEGORY_PRESETS[category]) || CATEGORY_PRESETS.generic
}

export async function generateImagePrompt(input: ProductImageInput): Promise<string> {
  if (process.env.USE_MOCK_AI === "true") {
    return "professional product photography of " + input.product_name + ", " + input.style + ", high detail";
  }
  const preset = getCategoryPreset(input.category)
  const scene = getSceneTemplate(input.scene)
  const styleLock = input.style_lock ? buildStyleLockText() : ''
  const wantText = input.language && input.language !== "No text";
  const language = wantText ? input.language : "no text";
  const prompt =
    "You are an expert prompt engineer for AI product photography and marketing visuals. " +
    "Write a single, detailed English prompt for an image generation model that renders a product image.\n\n" +
    "Product name: " + input.product_name + "\n" +
    "Product description: " + input.product_description + "\n" +
    "Product category: " + preset.label + "\n" +
    "Target platform: " + input.platform + "\n" +
    "Visual style: " + input.style + "\n" +
    "On-image text language: " + language + "\n\n" +
    (scene
      ? "Scene/format brief — follow this closely:\n" +
        "- Composition & staging: " + scene.logic + "\n" +
        "- Lighting/material/mood vocabulary to weave in: " + scene.promptHints + "\n" +
        "- Avoid at all costs: " + scene.avoid + "\n\n"
      : "") +
    (styleLock ? styleLock + "\n" : "") +
    "Category-specific brief — follow this closely:\n" +
    "- Composition & staging: " + preset.logic + "\n" +
    "- Lighting/material/mood vocabulary to weave in: " + preset.promptHints + "\n" +
    "- Avoid at all costs: " + preset.avoid + "\n\n" +
    "Global realism / anti-AI directives — apply to EVERY category:\n" +
    "- Render as a genuine photograph, not a 3D render, illustration or digital painting.\n" +
    "- Kill the 'AI look': no oversaturated candy colors, no plastic-smooth surfaces, no over-sharpened edges, no unnatural HDR glow, no unnaturally mirror-perfect symmetry (real structural symmetry — like four even chair legs — is required, not forbidden).\n" +
    "- Preserve structural integrity: every leg, handle, edge, hinge and joint must be geometrically correct and physically plausible — no melted, merged, floating, vanishing, or asymmetrically-warped parts.\n" +
    "- Prefer natural, slightly imperfect lighting (soft window light, real soft shadows) over dramatic fake studio rim-light.\n" +
    "- Include believable micro-texture and small imperfections: fabric weave, wood grain, metal patina, subtle dust, gentle focus falloff.\n" +
    "- Use shallow depth of field with real camera-lens bokeh, never a fake uniform blur.\n" +
    "- Avoid sterile studio-perfect cleanliness: let light fall off naturally, let shadows be soft and slightly uneven, and leave a hint of real atmosphere (a gentle wall-shadow gradient, varied wood grain) so the scene feels lived-in, not clinically staged.\n" +
    "- Never use hype words like '8k', 'hyper-detailed', 'masterpiece', 'award-winning' in the final prompt; describe a real photo instead.\n" +
    "- Any on-image text must look like real printed or on-screen typography, never warped or garbled AI lettering.\n\n" +
    "Requirements:\n" +
    "- Vividly describe the product, its material, colors, and key details.\n" +
    "- Apply the category-specific brief above to composition, lighting, background and mood.\n" +
    (wantText
      ? "- On-image text: write ONE short marketing tagline (3-6 words, " + language + ") that sells this product (e.g. \"Handcrafted · Free Shipping\") and state it verbatim in the final prompt as 'The on-image text reads exactly: \"<your tagline>\"'. Require that exact tagline to appear as clean printed typography near the top or bottom edge, never warped, garbled or misspelled lettering.\n"
      : "- No text or lettering at all.\n") +
    "- Output ONLY the prompt text, with no quotes, labels, or explanations.";
  const content = await chat(prompt);
  const cleaned = content.trim().replace(/^["']+|["']+$/g, "");
  if (cleaned) return cleaned;
  return "Professional product marketing poster of " + input.product_name + " — " + input.product_description + " in " + input.style + " style, " + (language === "no text" ? "no text" : "text in " + language) + ".";
}

export async function generateProductImage(input: ProductImageInput): Promise<ProductImageOutput> {
  if (process.env.USE_MOCK_AI === "true") {
    return { imageUrl: "https://placehold.co/1024x1024/png?text=Product+Poster" };
  }
  const prompt = await generateImagePrompt(input);
  const response = await primaryClient().images.generate({
    model: "gpt-image-2-all",
    prompt,
    size: input.size as any,
    n: 1,
  });
  const data = response.data?.[0] as any;
  if (data?.b64_json) {
    return { imageUrl: "data:image/png;base64," + data.b64_json, revised_prompt: data?.revised_prompt ?? null };
  }
  if (data?.url) {
    return { imageUrl: data.url, revised_prompt: data?.revised_prompt ?? null };
  }
  throw new Error("Image generation returned no image");
}

// Generate a batch of product images. Reuses the single-image path but
// fans out with bounded concurrency (3 at a time) so the relay gateway
// isn't hammered. The gpt-image relay doesn't support `n > 1`, so batch
// means multiple independent generate calls.
export async function generateProductImages(
  inputs: ProductImageInput[]
): Promise<ProductImageOutput[]> {
  const results: ProductImageOutput[] = []
  const CONCURRENCY = 3
  for (let i = 0; i < inputs.length; i += CONCURRENCY) {
    const batch = inputs.slice(i, i + CONCURRENCY)
    const out = await Promise.all(batch.map(generateProductImage))
    results.push(...out)
  }
  return results
}

export async function generatePricingAdvice(input: PricingInput): Promise<PricingOutput> {
  if (process.env.USE_MOCK_AI === "true") {
    const totalCost = input.material_cost + input.labor_cost + input.shipping_cost;
    return {
      suggested_price: totalCost * 2.5,
      estimated_profit: totalCost * 1.5,
      pricing_strategy: "Consider a 2.5x markup to cover fees and profit."
    };
  }
  const p = getPlatform(input.platform);
  const totalCost = input.material_cost + input.labor_cost + input.shipping_cost;
  const system = "You are a pricing expert for " + p.label + " sellers. Always return valid JSON.";
  const user =
    "Suggest a price and profit for this product. Do the math with the real numbers, don't guess.\n\n" +
    "Material cost: " + input.material_cost + "\n" +
    "Labor cost: " + input.labor_cost + "\n" +
    "Shipping cost: " + input.shipping_cost + "\n" +
    "Total cost: " + totalCost + "\n" +
    "Competitor price range: " + (input.competitor_price_min || "unknown") + " to " + (input.competitor_price_max || "unknown") + "\n" +
    "Desired profit margin: " + (input.desired_profit_margin ? input.desired_profit_margin + "%" : "not specified — assume a healthy 40-50%") + "\n" +
    "Marketplace: " + p.label + "\n\n" +
    "Use this exact formula: suggested_price = total_cost / (1 - desired_margin_decimal - fee_rate). Account for " + p.label + "'s typical commission + payment fee (roughly 9-15% combined). Show your reasoning in plain language.\n\n" +
    "Return JSON with exactly three fields:\n" +
    "1. \"suggested_price\": a number (round to a clean price point)\n" +
    "2. \"estimated_profit\": a number (suggested_price - total_cost - estimated_fees)\n" +
    "3. \"pricing_strategy\": a short, plain-language explanation of the math and the tradeoff";

  const raw = await chatJson(system, user, 0.2);
  const num = (v: any, fallback: number) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };
  return {
    suggested_price: num(raw.suggested_price, Math.round(totalCost * 2.5)),
    estimated_profit: num(raw.estimated_profit, Math.round(totalCost * 1.5)),
    pricing_strategy: String(raw.pricing_strategy || ""),
  };
}

export interface GlobalPricingInput { product_name?: string; base_price_usd: number; markets: string[]; }
export interface GlobalPricingOutput { strategy: string; }

export async function generateGlobalPricingStrategy(input: GlobalPricingInput): Promise<GlobalPricingOutput> {
  if (process.env.USE_MOCK_AI === "true") {
    return { strategy: "Price slightly above the local market average; use round numbers in local currency and absorb platform fees into a markup of roughly 10–15%." };
  }
  const system = "You are a cross-border e-commerce pricing strategist. Always return valid JSON.";
  const user =
    "A seller is expanding a product to several international markets. Give 3-5 concrete, actionable pricing recommendations.\n\n" +
    "Product: " + (input.product_name || "a handmade product") + "\n" +
    "Base price (USD): " + input.base_price_usd + "\n" +
    "Target markets: " + input.markets.join(", ") + "\n\n" +
    "Cover, in this order:\n" +
    "1) how to set a local landed price (base + shipping + VAT/duties + platform fee)\n" +
    "2) how to absorb marketplace fees and VAT without eating the margin\n" +
    "3) how to keep the same product profitable across markets with different willingness-to-pay\n" +
    "Use round numbers in local currency. Write in a warm, direct, founder-to-founder tone — no corporate clichés.\n\n" +
    "Return JSON with exactly one field:\n\"strategy\": a string with 3-5 numbered recommendations, each on its own line";

  const raw = await chatJson(system, user, 0.5);
  return { strategy: String(raw.strategy || "") };
}

// ===== New e-commerce tool functions =====

export async function generateBulletPoints(input: BulletPointsInput): Promise<BulletPointsOutput> {
  if (process.env.USE_MOCK_AI === "true") {
    return { bullets: ["Premium quality " + input.product_name, "Made from durable, long-lasting materials", "Perfect gift for any occasion", "Fast, reliable shipping", "Backed by a satisfaction guarantee"] };
  }
  const p = getPlatform(input.platform);
  const count = input.count || 5;
  const system = "You are an expert e-commerce copywriter for " + p.label + ". Always return valid JSON.";
  const user =
    "Write " + count + " benefit-led bullet points for this product.\n\n" +
    "Marketplace rules:\n" + platformContext(input.platform) + "\n\n" +
    "Product: " + input.product_name + "\n" +
    "Description: " + input.product_description + brandContext(input.brand_tone, input.brand_keywords) + "\n\n" +
    VOICE_DIRECTIVE + "\n\n" +
    "Every bullet must:\n" +
    "- Lead with a concrete benefit, not a feature dump\n" +
    "- Answer a buyer objection (size, material, use case, care, what's included)\n" +
    "- Be scannable; skip filler words\n\n" +
    "Example:\n" +
    "OUTPUT: {\"bullets\":[\"Cut from 8oz European linen that softens with every wash\",\"One pocket deep enough for a phone, with a wide strap that won't twist\",\"One size with an adjustable waist tie\",\"Machine wash cold, hang to dry — the wrinkles are part of it\"]}\n\n" +
    "Return JSON with exactly one field:\n\"bullets\": array of " + count + " strings";

  const raw = await chatJson(system, user, 0.4);
  return { bullets: cleanList(raw.bullets, count) };
}

export async function generateAdCopy(input: AdCopyInput): Promise<AdCopyOutput> {
  if (process.env.USE_MOCK_AI === "true") {
    return { headlines: ["Introducing " + input.product_name, "Upgrade your everyday", "The " + input.product_name + " everyone's talking about"], primary_text: "Meet " + input.product_name + ". " + input.product_description, description: "Order today and see the difference.", cta: "Shop Now" };
  }
  const p = getPlatform(input.platform);
  const system = "You are a performance marketing copywriter. Always return valid JSON.";
  const user =
    "Write high-converting ad copy for " + p.label + " and paid social (Meta, TikTok, Google).\n\n" +
    "Goal: " + input.goal + "\n" +
    "Product: " + input.product_name + "\n" +
    "Description: " + input.product_description + (input.audience ? "\nTarget audience: " + input.audience : "") + "\n" +
    "Marketplace tone to respect: " + p.tone + brandContext(input.brand_tone, input.brand_keywords) + "\n\n" +
    VOICE_DIRECTIVE + "\n\n" +
    "Headlines must be distinct angles (benefit-led, curiosity, social-proof), not five rewordings of the same line. The CTA must be specific, not a generic 'Shop now'.\n\n" +
    "Return JSON with exactly four fields:\n" +
    "1. \"headlines\": array of 5 headline options (each under 60 characters)\n" +
    "2. \"primary_text\": the main ad body text (2-3 sentences)\n" +
    "3. \"description\": a short supporting description\n" +
    "4. \"cta\": a strong, specific call-to-action phrase";

  const raw = await chatJson(system, user, 0.7);
  return {
    headlines: cleanList(raw.headlines, 5, 60),
    primary_text: String(raw.primary_text || ""),
    description: String(raw.description || ""),
    cta: String(raw.cta || ""),
  };
}

export async function generateEmail(input: EmailInput): Promise<EmailOutput> {
  if (process.env.USE_MOCK_AI === "true") {
    return { subject: "A little something for you", preview_text: "Don't miss out on " + input.product_name, body: "Hi there,\n\nWe thought you'd love " + input.product_name + ".\n\n" + input.product_description + "\n\nShop now." };
  }
  const typeLabel = input.email_type.replace(/_/g, " ");
  const system = "You are an e-commerce email marketing copywriter. Always return valid JSON.";
  const user =
    "Write a " + typeLabel + " email that reads like a note from a real person.\n\n" +
    "Product: " + input.product_name + "\n" +
    "Description: " + input.product_description + (input.audience ? "\nAudience: " + input.audience : "") + brandContext(input.brand_tone, input.brand_keywords) + "\n\n" +
    VOICE_DIRECTIVE + "\n\n" +
    "Rules:\n" +
    "- Subject under 50 characters, no spammy all-caps or clickbait\n" +
    "- One clear ask; don't bury it\n" +
    "- Preview text must complement the subject, not repeat it\n" +
    "- Body in plain text with line breaks, 80-150 words\n\n" +
    "Return JSON with exactly three fields:\n" +
    "1. \"subject\": email subject line\n" +
    "2. \"preview_text\": one-sentence preview text\n" +
    "3. \"body\": the email body in plain text with line breaks";

  const raw = await chatJson(system, user, 0.7);
  return {
    subject: clampText(String(raw.subject || ""), 50),
    preview_text: String(raw.preview_text || ""),
    body: String(raw.body || ""),
  };
}

export async function generateCompetitorAnalysis(input: CompetitorAnalysisInput): Promise<CompetitorAnalysisOutput> {
  if (process.env.USE_MOCK_AI === "true") {
    return { strengths: ["Established brand"], weaknesses: ["Higher price point"], opportunities: ["Better product photography"], threats: ["Price competition"], differentiation: "Focus on quality and storytelling." };
  }
  const p = getPlatform(input.platform);
  const system = "You are an e-commerce competitive analyst. Always return valid JSON.";
  const user =
    "Run a SWOT analysis of a competitor on " + p.label + " to help a seller differentiate.\n\n" +
    "Your product: " + input.product_name + "\n" +
    "Your product description: " + input.product_description + "\n" +
    "Competitor: " + (input.competitor_name || "a comparable product") + "\n" +
    "Competitor description: " + (input.competitor_description || "not provided — infer typical weaknesses") + "\n\n" +
    "Be specific and honest. No generic SWOT filler ('good quality', 'bad marketing') — every point should be something the seller can actually act on.\n\n" +
    "Return JSON with exactly five fields:\n" +
    "1. \"strengths\": array of competitor strengths\n" +
    "2. \"weaknesses\": array of competitor weaknesses\n" +
    "3. \"opportunities\": array of opportunities for your product to win\n" +
    "4. \"threats\": array of threats to watch\n" +
    "5. \"differentiation\": a short paragraph on how to position against this competitor";

  const raw = await chatJson(system, user, 0.4);
  return {
    strengths: cleanList(raw.strengths, 6),
    weaknesses: cleanList(raw.weaknesses, 6),
    opportunities: cleanList(raw.opportunities, 6),
    threats: cleanList(raw.threats, 6),
    differentiation: String(raw.differentiation || ""),
  };
}

export async function generateBrandStory(input: BrandStoryInput): Promise<BrandStoryOutput> {
  if (process.env.USE_MOCK_AI === "true") {
    return { story: "Every " + input.product_type + " we make starts with a simple idea: craft something worth keeping.", mission: "To make " + input.product_type + " that people love and keep.", tagline: "Made with care, made to last." };
  }
  const system = "You are a brand storyteller for an e-commerce business. Always return valid JSON.";
  const user =
    "Write a compelling brand story for " + input.brand_name + ".\n\n" +
    "Product type: " + input.product_type + (input.origin_story ? "\nOrigin story: " + input.origin_story : "") + (input.values ? "\nCore values: " + input.values : "") + (input.audience ? "\nTarget audience: " + input.audience : "") + "\n\n" +
    VOICE_DIRECTIVE + "\n\n" +
    "Rules:\n" +
    "- Write like a real founder telling their story, not a press release\n" +
    "- Lead with a concrete, specific moment or detail — avoid abstract claims\n" +
    "- No corporate clichés ('passion for quality', 'committed to excellence')\n\n" +
    "Return JSON with exactly three fields:\n" +
    "1. \"story\": the brand story (2-3 paragraphs)\n" +
    "2. \"mission\": a one-sentence mission statement\n" +
    "3. \"tagline\": a short, memorable tagline (under 8 words)";

  const raw = await chatJson(system, user, 0.7);
  return {
    story: String(raw.story || ""),
    mission: String(raw.mission || ""),
    tagline: String(raw.tagline || ""),
  };
}
