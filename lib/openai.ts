import OpenAI from "openai";

export interface ListingInput {
  product_name: string;
  product_type: string;
  material: string;
  style: string;
}

export interface ListingOutput {
  title: string;
  description: string;
  tags: string[];
}

export interface MessageReplyInput {
  customer_message: string;
  product_info?: string;
  tone: string;
}

export interface MessageReplyOutput {
  replies: string[];
}

export interface SocialPostInput {
  product_description: string;
  platform: string;
}

export interface SocialPostOutput {
  caption: string;
  hashtags: string[];
}

export async function generateListing(input: ListingInput): Promise<ListingOutput> {
  if (process.env.USE_MOCK_AI === "true") {
    return {
      title: "[MOCK] Premium " + input.product_name + " - " + input.product_type + " made of " + input.material,
      description: "This is a high-quality " + input.product_name + " crafted from the finest " + input.material + ".\n\nHighlights:\n- Exquisite " + input.style + " design\n- Durable and long-lasting\n- Perfect for any occasion\n\nOrder now to add this beautiful " + input.product_name + " to your collection!",
      tags: [
        "handmade",
        "etsyseller",
        "giftidea",
        "custom",
        "unique",
        "artisan",
        "home",
        "decor",
        "style",
        "material",
        "quality",
        "premium",
        "sale"
      ]
    };
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
  });

  const prompt = "You are an Etsy SEO expert. Create a high-converting product listing for:\n- Product Name: " + input.product_name + "\n- Product Type: " + input.product_type + "\n- Material: " + input.material + "\n- Style: " + input.style + "\n\nReturn JSON with exactly three fields:\n1. \"title\": optimized Etsy title (max 140 chars)\n2. \"description\": detailed product description (use emojis and line breaks)\n3. \"tags\": array of 13 Etsy tags (each max 20 chars, lowercase, no duplicates)";

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are an Etsy SEO expert. Always return valid JSON." },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" }
  });

  const content = response.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(content) as ListingOutput;
  return parsed;
}

export async function generateMessageReply(input: MessageReplyInput): Promise<MessageReplyOutput> {
  if (process.env.USE_MOCK_AI === "true") {
    return {
      replies: [
        "Thank you for reaching out! We're sorry to hear about the issue and would love to make it right. Could you please share more details?",
        "We appreciate your patience and we are here to help. Please let us know how we can resolve this for you.",
        "We're so sorry for the inconvenience. We will do our best to fix this promptly."
      ]
    };
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
  });

  const prompt = "You are a customer service assistant for an Etsy shop. Write three professional and " + input.tone + " replies to the following customer message.\n\nCustomer message: " + input.customer_message + (input.product_info ? "\nProduct info: " + input.product_info : "") + "\n\nReturn JSON with exactly one field:\n\"replies\": array of three strings";

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful Etsy customer service assistant. Always return valid JSON." },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" }
  });

  const content = response.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(content) as MessageReplyOutput;
  return parsed;
}

export async function generateSocialPost(input: SocialPostInput): Promise<SocialPostOutput> {
  if (process.env.USE_MOCK_AI === "true") {
    return {
      caption: "Check out this amazing product! Perfect for any occasion. #handmade #giftideas",
      hashtags: [
        "handmade",
        "giftideas",
        "smallbusiness",
        "shopsmall",
        "etsyfinds",
        "homedecor",
        "unique",
        "supportsmallbusiness"
      ]
    };
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
  });

  const prompt = "You are a social media expert. Create a high-converting social media post for the following product description, specifically for " + input.platform + ".\n\nProduct description: " + input.product_description + "\n\nReturn JSON with exactly two fields:\n1. \"caption\": a short, engaging caption (include emojis)\n2. \"hashtags\": an array of 8-10 relevant hashtags (without # symbol)";

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a social media expert. Always return valid JSON." },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" }
  });

  const content = response.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(content) as SocialPostOutput;
  return parsed;
}