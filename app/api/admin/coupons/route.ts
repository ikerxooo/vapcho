import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "@/lib/config.server";
import { createServerClient } from "@/lib/supabase";

function checkAdmin() {
  return cookies().get(ADMIN_COOKIE)?.value === "1";
}

export async function GET() {
  if (!checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServerClient();
  const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const coupons = (data || []).map((c: any) => ({
    id: c.id,
    code: c.code,
    description: c.description,
    discountType: c.discount_type,
    discountValue: parseFloat(c.discount_value) || 0,
    minOrderAmount: parseFloat(c.min_order_amount) || 0,
    usageLimit: c.usage_limit,
    usedCount: c.used_count,
    expiresAt: c.expires_at,
    active: c.active,
  }));

  return NextResponse.json({ coupons });
}

export async function POST(req: NextRequest) {
  if (!checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const supabase = createServerClient();

  const { data, error } = await supabase.from("coupons").insert({
    code: body.code,
    description: body.description || "",
    discount_type: body.discountType || "percentage",
    discount_value: body.discountValue || 0,
    min_order_amount: body.minOrderAmount || 0,
    usage_limit: body.usageLimit || null,
    active: body.active !== false,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ coupon: data });
}
