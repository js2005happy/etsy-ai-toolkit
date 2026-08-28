import { createClient } from "@/lib/supabase/server";
import { translateListing } from "@/lib/openai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("credits_remaining, plan")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    const isPro = profile.plan === "pro";

    if (!isPro && profile.credits_remaining <= 0) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 403 });
    }

    const body = await request.json();
    const { text, target_language } = body;

    if (!text || !target_language) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await translateListing({ text, target_language });

    await supabase.from("generations").insert({
      user_id: user.id,
      tool_type: "translate",
      input_data: body,
      output_data: result,
    });

    if (!isPro) {
      await supabase
        .from("profiles")
        .update({ credits_remaining: profile.credits_remaining - 1 })
        .eq("id", user.id);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in translate-listing:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}