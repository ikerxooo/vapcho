import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { productId } = await req.json();
  if (!productId) return NextResponse.json({ error: "Missing productId" }, { status: 400 });

  const supabase = createServerClient();

  // Increment view count
  await supabase.rpc("increment_product_views", { product_id: productId });

  // Try to insert recently_viewed if user is authenticated
  const authRes = await supabase.auth.getUser();
  if (authRes.data?.user) {
    await supabase.from("recently_viewed").upsert({
      user_id: authRes.data.user.id,
      product_id: productId,
      viewed_at: new Date().toISOString(),
    }, { onConflict: "user_id,product_id" });
  }

  return NextResponse.json({ ok: true });
}
