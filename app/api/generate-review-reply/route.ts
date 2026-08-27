import { createClient } from "@/lib/supabase/server";
import { generateReviewReply } from "@/lib/openai";
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
      .select("credits_remaining")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    if (profile.credits_remaining <= 0) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 403 });
    }

    const body = await request.json();
    const { review_text, rating, tone } = body;

    if (!review_text || !rating || !tone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await generateReviewReply({ review_text, rating, tone });

    await supabase.from("generations").insert({
      user_id: user.id,
      tool_type: "review_reply",
      input_data: body,
      output_data: result,
    });

    await supabase
      .from("profiles")
      .update({ credits_remaining: profile.credits_remaining - 1 })
      .eq("id", user.id);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in generate-review-reply:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}