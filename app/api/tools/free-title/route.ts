import { NextResponse } from "next/server";
import { generateListing } from "@/lib/openai";

// Anonymous free tool: the lead-gen entry point of the free-tool SEO matrix.
// No auth, no credits — visitors get a real Etsy listing (title + 13 tags +
// a description preview) so they can feel the value before signing up.
//
// Rate limit: 3 generations per IP per day. The in-memory Map is per
// serverless instance — enough to stop casual abuse and scrapers; if abuse
// shows up in logs, move the counter to Upstash Redis or a Supabase table
// before scaling the matrix to hundreds of pages.
const DAILY_LIMIT = 3;
const DESCRIPTION_PREVIEW_CHARS = 180;

const hits = new Map<string, { day: string; count: number }>();

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function allowRequest(ip: string): boolean {
  const day = today();
  const rec = hits.get(ip);
  if (!rec || rec.day !== day) {
    hits.set(ip, { day, count: 1 });
    return true;
  }
  if (rec.count >= DAILY_LIMIT) return false;
  rec.count += 1;
  return true;
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!allowRequest(ip)) {
      return NextResponse.json(
        {
          error:
            "You've used all 3 free generations for today. Create a free account for 10 credits every month — no card needed.",
          limitReached: true,
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const productName = String(body.product_name || "").trim().slice(0, 120);
    const productType = String(body.product_type || "").trim().slice(0, 80);
    const material = String(body.material || "").trim().slice(0, 80);
    const style = String(body.style || "").trim().slice(0, 80) || "handmade";

    if (!productName || !productType || !material) {
      return NextResponse.json(
        {
          error:
            "Please fill in the product name, product type, and material.",
        },
        { status: 400 }
      );
    }

    const result = await generateListing({
      product_name: productName,
      product_type: productType,
      material,
      style,
      platform: "etsy",
    });

    // Full title + tags are the real value — give them completely.
    // The description is the hook: preview only, full version after signup.
    const truncated = result.description.length > DESCRIPTION_PREVIEW_CHARS;
    const descriptionPreview = truncated
      ? result.description.slice(0, DESCRIPTION_PREVIEW_CHARS).trimEnd() + "…"
      : result.description;

    return NextResponse.json({
      title: result.title,
      tags: result.tags,
      description_preview: descriptionPreview,
      truncated,
    });
  } catch (error: any) {
    console.error("free-title API error:", error);
    return NextResponse.json(
      { error: error.message || "Generation failed. Please try again." },
      { status: 500 }
    );
  }
}
