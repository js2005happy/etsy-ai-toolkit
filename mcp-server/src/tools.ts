import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { callApi } from './api.js'

function textResult(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }
}

export function registerTools(server: McpServer): void {
  server.tool(
    'generate_listing',
    'Generate an optimized Etsy product listing (title, description, tags) from product details.',
    {
      product_name: z.string().describe('Name of the product'),
      product_type: z.string().describe('Category or type, e.g. "jewelry", "wall art"'),
      material: z.string().describe('Primary material(s), e.g. "sterling silver"'),
      style: z.string().describe('Design style, e.g. "boho", "minimalist"'),
    },
    async (args) => textResult(await callApi('/api/generate-listing', 'POST', args))
  )

  server.tool(
    'generate_message_reply',
    'Draft a polite, on-brand reply to a customer message.',
    {
      customer_message: z.string().describe('The customer message to reply to'),
      tone: z.string().describe('Reply tone, e.g. "friendly", "professional"'),
      product_info: z
        .string()
        .optional()
        .describe('Optional context about the product/order'),
    },
    async (args) => textResult(await callApi('/api/generate-message-reply', 'POST', args))
  )

  server.tool(
    'generate_social_post',
    'Create a social media post promoting a product for a given platform.',
    {
      product_description: z.string().describe('Description of the product to promote'),
      platform: z.string().describe('Target platform, e.g. "instagram", "pinterest", "facebook"'),
    },
    async (args) => textResult(await callApi('/api/generate-social-post', 'POST', args))
  )

  server.tool(
    'generate_review_reply',
    'Draft a response to a customer review (positive or negative).',
    {
      review_text: z.string().describe('The customer review text'),
      rating: z.coerce.number().describe('Star rating given by the customer (1-5)'),
      tone: z.string().describe('Reply tone, e.g. "grateful", "apologetic"'),
    },
    async (args) => textResult(await callApi('/api/generate-review-reply', 'POST', args))
  )

  server.tool(
    'generate_announcement',
    'Write a shop announcement (e.g. sale, restock, holiday notice).',
    {
      shop_type: z.string().describe('What the shop sells, e.g. "handmade candles"'),
      announcement_type: z.string().describe('Type, e.g. "sale", "restock", "holiday"'),
      tone: z.string().describe('Tone, e.g. "warm", "exciting"'),
    },
    async (args) => textResult(await callApi('/api/generate-announcement', 'POST', args))
  )

  server.tool(
    'generate_keywords',
    'Generate SEO keywords and tags for a product listing.',
    {
      product_type: z.string().describe('Product type, e.g. "handmade ceramic mug"'),
      market: z.string().optional().describe('Target market/audience'),
      style: z.string().optional().describe('Design style'),
    },
    async (args) => textResult(await callApi('/api/generate-keywords', 'POST', args))
  )

  server.tool(
    'translate_listing',
    'Translate listing text into a target language.',
    {
      text: z.string().describe('The text to translate'),
      target_language: z.string().describe('Target language, e.g. "Spanish", "French", "German"'),
    },
    async (args) => textResult(await callApi('/api/translate-listing', 'POST', args))
  )

  server.tool(
    'optimize_listing',
    'Optimize an existing listing title, description, and/or tags for better SEO.',
    {
      current_title: z.string().optional().describe('Current listing title'),
      current_description: z.string().optional().describe('Current listing description'),
      current_tags: z.string().optional().describe('Current comma-separated tags'),
    },
    async (args) => textResult(await callApi('/api/optimize-listing', 'POST', args))
  )

  server.tool(
    'generate_pricing_advice',
    'Get pricing advice based on costs and competitor prices.',
    {
      material_cost: z.coerce.number().describe('Material cost per item'),
      labor_cost: z.coerce.number().describe('Labor cost per item'),
      shipping_cost: z.coerce.number().describe('Shipping cost per item'),
      competitor_price_min: z.coerce.number().optional().describe('Lowest competitor price'),
      competitor_price_max: z.coerce.number().optional().describe('Highest competitor price'),
      desired_profit_margin: z.coerce
        .number()
        .optional()
        .describe('Desired profit margin as a percentage (e.g. 40 for 40%)'),
    },
    async (args) => textResult(await callApi('/api/generate-pricing-advice', 'POST', args))
  )

  server.tool(
    'get_credits',
    'Query your remaining credits, image quota, and current plan.',
    {},
    async () => textResult(await callApi('/api/user/credits', 'GET'))
  )
}
