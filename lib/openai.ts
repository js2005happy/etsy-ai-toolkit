import OpenAI from "openai";

export interface ListingInput { product_name: string; product_type: string; material: string; style: string; brand_tone?: string; brand_keywords?: string; }
export interface ListingOutput { title: string; description: string; tags: string[]; }
export interface MessageReplyInput { customer_message: string; product_info?: string; tone: string; brand_tone?: string; brand_keywords?: string; }
export interface MessageReplyOutput { replies: string[]; }
export interface SocialPostInput { product_description: string; platform: string; brand_tone?: string; brand_keywords?: string; }
export interface SocialPostOutput { caption: string; hashtags: string[]; }
export interface ReviewReplyInput { review_text: string; rating: number; tone: string; brand_tone?: string; brand_keywords?: string; }
export interface ReviewReplyOutput { replies: string[]; }
export interface AnnouncementInput { shop_type: string; announcement_type: string; tone: string; brand_tone?: string; brand_keywords?: string; }
export interface AnnouncementOutput { announcement: string; }
export interface KeywordsInput { product_type: string; market?: string; style?: string; }
export interface KeywordsOutput { keywords: string[]; }
export interface TranslateInput { text: string; target_language: string; }
export interface TranslateOutput { translated_text: string; }
export interface TranslateImageInput { image: string; target_language: string; }
export interface TranslateImageOutput { translated_text: string; extracted_text?: string; }
export interface OptimizeListingInput { current_title?: string; current_description?: string; current_tags?: string; brand_tone?: string; brand_keywords?: string; }
export interface OptimizeListingOutput { title: string; description: string; tags: string[]; suggestions: string; }
export interface PricingInput { material_cost: number; labor_cost: number; shipping_cost: number; competitor_price_min?: number; competitor_price_max?: number; desired_profit_margin?: number; }
export interface PricingOutput { suggested_price: number; estimated_profit: number; pricing_strategy: string; }

const PRIMARY_CHAT_MODEL = "gpt-4o-mini";
const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const GROQ_CHAT_MODEL = process.env.GROQ_CHAT_MODEL || "llama-3.3-70b-versatile";
const MOMA_VISION_BASE_URL = process.env.MOMA_VISION_BASE_URL || "https://moma.cmecloud.cn/v1";
const MOMA_VISION_MODEL = process.env.MOMA_VISION_MODEL || "qwen/qwen3.7-plus";

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
async function chat(user: string, opts: { system?: string; json?: boolean } = {}): Promise<string> {
  const messages: any[] = [];
  if (opts.system) messages.push({ role: "system", content: opts.system });
  messages.push({ role: "user", content: user });

  const run = async (client: OpenAI, model: string) => {
    const params: any = { model, messages };
    if (opts.json) params.response_format = { type: "json_object" };
    const r = await client.chat.completions.create(params);
    return r.choices[0]?.message?.content || (opts.json ? "{}" : "");
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

function brandContext(tone?: string, keywords?: string): string {
  if (!tone && !keywords) return ''
  const parts: string[] = []
  if (tone) parts.push(`Brand tone: ${tone}`)
  if (keywords) parts.push(`Brand keywords to weave in naturally: ${keywords}`)
  return `\n\nBrand voice — apply these to the output:\n- ${parts.join('\n- ')}`
}

export async function generateListing(input: ListingInput): Promise<ListingOutput> {
  if (process.env.USE_MOCK_AI === "true") {
    return {
      title: "[MOCK] Premium " + input.product_name + " - " + input.product_type + " made of " + input.material,
      description: "This is a high-quality " + input.product_name + " crafted from the finest " + input.material + ".\n\nHighlights:\n- Exquisite " + input.style + " design\n- Durable and long-lasting\n- Perfect for any occasion\n\nOrder now to add this beautiful " + input.product_name + " to your collection!",
      tags: ["handmade","etsyseller","giftidea","custom","unique","artisan","home","decor","style","material","quality","premium","sale"]
    };
  }
  const prompt = "You are an Etsy SEO expert. Create a high-converting product listing for:\n- Product Name: " + input.product_name + "\n- Product Type: " + input.product_type + "\n- Material: " + input.material + "\n- Style: " + input.style + brandContext(input.brand_tone, input.brand_keywords) + "\n\nReturn JSON with exactly three fields:\n1. \"title\": optimized Etsy title (max 140 chars)\n2. \"description\": detailed product description (use emojis and line breaks)\n3. \"tags\": array of 13 Etsy tags (each max 20 chars, lowercase, no duplicates)";
  const content = await chat(prompt, { system: "You are an Etsy SEO expert. Always return valid JSON.", json: true });
  return JSON.parse(content) as ListingOutput;
}

export async function generateMessageReply(input: MessageReplyInput): Promise<MessageReplyOutput> {
  if (process.env.USE_MOCK_AI === "true") {
    return { replies: ["Thank you for reaching out! We're sorry to hear about the issue and would love to make it right. Could you please share more details?", "We appreciate your patience and we are here to help. Please let us know how we can resolve this for you.", "We're so sorry for the inconvenience. We will do our best to fix this promptly."] };
  }
  const prompt = "You are a customer service assistant for an Etsy shop. Write three professional and " + input.tone + " replies to the following customer message.\n\nCustomer message: " + input.customer_message + (input.product_info ? "\nProduct info: " + input.product_info : "") + brandContext(input.brand_tone, input.brand_keywords) + "\n\nReturn JSON with exactly one field:\n\"replies\": array of three strings";
  const content = await chat(prompt, { system: "You are a helpful Etsy customer service assistant. Always return valid JSON.", json: true });
  return JSON.parse(content) as MessageReplyOutput;
}

export async function generateSocialPost(input: SocialPostInput): Promise<SocialPostOutput> {
  if (process.env.USE_MOCK_AI === "true") {
    return { caption: "Check out this amazing product! Perfect for any occasion. #handmade #giftideas", hashtags: ["handmade","giftideas","smallbusiness","shopsmall","etsyfinds","homedecor","unique","supportsmallbusiness"] };
  }
  const prompt = "You are a social media expert. Create a high-converting social media post for the following product description, specifically for " + input.platform + ".\n\nProduct description: " + input.product_description + brandContext(input.brand_tone, input.brand_keywords) + "\n\nReturn JSON with exactly two fields:\n1. \"caption\": a short, engaging caption (include emojis)\n2. \"hashtags\": an array of 8-10 relevant hashtags (without # symbol)";
  const content = await chat(prompt, { system: "You are a social media expert. Always return valid JSON.", json: true });
  return JSON.parse(content) as SocialPostOutput;
}

export async function generateReviewReply(input: ReviewReplyInput): Promise<ReviewReplyOutput> {
  if (process.env.USE_MOCK_AI === "true") {
    return { replies: ["Thank you so much for your kind words! We're thrilled you love your order.", "We're sorry to hear that. We'd love to make things right. Please send us a message.", "Thank you for your feedback. We're always improving our products and service."] };
  }
  const prompt = "You are an Etsy shop owner replying to a customer review. The review rating is " + input.rating + " stars. Tone should be " + input.tone + ".\n\nReview text: " + input.review_text + brandContext(input.brand_tone, input.brand_keywords) + "\n\nWrite two or three replies that are professional, polite, and appropriate for the rating.\n\nReturn JSON with exactly one field:\n\"replies\": array of strings";
  const content = await chat(prompt, { system: "You are a helpful Etsy seller. Always return valid JSON.", json: true });
  return JSON.parse(content) as ReviewReplyOutput;
}

export async function generateAnnouncement(input: AnnouncementInput): Promise<AnnouncementOutput> {
  if (process.env.USE_MOCK_AI === "true") {
    return { announcement: "Welcome to our shop! We specialize in beautiful " + input.shop_type + " items. Thank you for visiting, and feel free to reach out with any questions!" };
  }
  const prompt = "You are an Etsy shop owner. Write a " + input.announcement_type + " announcement for a shop that sells " + input.shop_type + ". Tone should be " + input.tone + brandContext(input.brand_tone, input.brand_keywords) + ".\n\nReturn JSON with exactly one field:\n\"announcement\": a string of the announcement text";
  const content = await chat(prompt, { system: "You are a helpful Etsy shop owner. Always return valid JSON.", json: true });
  return JSON.parse(content) as AnnouncementOutput;
}

export async function generateKeywords(input: KeywordsInput): Promise<KeywordsOutput> {
  if (process.env.USE_MOCK_AI === "true") {
    return { keywords: ["handmade " + input.product_type, "unique " + input.product_type, "gift " + input.product_type, "custom " + input.product_type, "small business " + input.product_type, "etsy " + input.product_type, "best " + input.product_type, "personalized " + input.product_type] };
  }
  const prompt = "You are an Etsy SEO expert. Generate a list of 15 high-search-volume keywords for a product type: " + input.product_type + (input.market ? " targeting market: " + input.market : "") + (input.style ? " with style: " + input.style : "") + ". Include long-tail keywords.\n\nReturn JSON with exactly one field:\n\"keywords\": an array of 15 keyword strings";
  const content = await chat(prompt, { system: "You are an Etsy SEO expert. Always return valid JSON.", json: true });
  return JSON.parse(content) as KeywordsOutput;
}

export async function translateListing(input: TranslateInput): Promise<TranslateOutput> {
  if (process.env.USE_MOCK_AI === "true") {
    return { translated_text: "[MOCK Translation] " + input.text + " (translated to " + input.target_language + ")" };
  }
  const prompt = "Translate the following Etsy listing text to " + input.target_language + ". Keep SEO-friendly keywords and formatting.\n\nText:\n" + input.text + "\n\nReturn JSON with exactly one field:\n\"translated_text\": the translated text";
  const content = await chat(prompt, { system: "You are a professional translator. Always return valid JSON.", json: true });
  return JSON.parse(content) as TranslateOutput;
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
  const cleaned = content.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  try {
    return JSON.parse(cleaned) as TranslateImageOutput;
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
  const prompt = "You are an Etsy SEO expert. Analyze the following existing listing and provide an improved version.\n\nCurrent title: " + (input.current_title || "N/A") + "\nCurrent description: " + (input.current_description || "N/A") + "\nCurrent tags: " + (input.current_tags || "N/A") + brandContext(input.brand_tone, input.brand_keywords) + "\n\nReturn JSON with these fields:\n1. \"title\": optimized title\n2. \"description\": optimized description\n3. \"tags\": array of 13 optimized tags\n4. \"suggestions\": a short paragraph explaining what was improved";
  const content = await chat(prompt, { system: "You are an Etsy SEO expert. Always return valid JSON.", json: true });
  return JSON.parse(content) as OptimizeListingOutput;
}

export interface ProductImageInput { product_name: string; product_description: string; platform: string; size: string; style: string; language?: string; }
export interface ProductImageOutput { imageUrl: string; revised_prompt?: string | null; }

export async function generateImagePrompt(input: ProductImageInput): Promise<string> {
  if (process.env.USE_MOCK_AI === "true") {
    return "professional product photography of " + input.product_name + ", " + input.style + ", high detail";
  }
  const language = input.language && input.language !== "No text" ? input.language : "no text";
  const prompt =
    "You are an expert prompt engineer for AI product photography. " +
    "Write a single, detailed English prompt for an image generation model that renders a product marketing poster.\n\n" +
    "Product name: " + input.product_name + "\n" +
    "Product description: " + input.product_description + "\n" +
    "Target platform: " + input.platform + "\n" +
    "Visual style: " + input.style + "\n" +
    "On-image text language: " + language + "\n\n" +
    "Requirements:\n" +
    "- Vividly describe the product, its material, colors, and key details.\n" +
    "- Specify composition, lighting, background, and mood.\n" +
    "- If a real language is given, require any on-image text to be written in that language and keep it minimal; if 'no text', require no text or lettering at all.\n" +
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

export async function generatePricingAdvice(input: PricingInput): Promise<PricingOutput> {
  if (process.env.USE_MOCK_AI === "true") {
    const totalCost = input.material_cost + input.labor_cost + input.shipping_cost;
    return {
      suggested_price: totalCost * 2.5,
      estimated_profit: totalCost * 1.5,
      pricing_strategy: "Consider a 2.5x markup to cover fees and profit."
    };
  }
  const prompt = "You are a pricing expert for Etsy sellers. Given the following costs and optional competitor prices, suggest a price and profit.\n\nMaterial cost: " + input.material_cost + "\nLabor cost: " + input.labor_cost + "\nShipping cost: " + input.shipping_cost + "\nCompetitor price range: " + (input.competitor_price_min || "unknown") + " to " + (input.competitor_price_max || "unknown") + "\nDesired profit margin: " + (input.desired_profit_margin || "not specified") + "\n\nReturn JSON with these fields:\n1. \"suggested_price\": a number\n2. \"estimated_profit\": a number\n3. \"pricing_strategy\": a short explanation";
  const content = await chat(prompt, { system: "You are a pricing expert. Always return valid JSON.", json: true });
  return JSON.parse(content) as PricingOutput;
}
