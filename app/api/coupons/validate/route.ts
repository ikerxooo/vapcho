import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { code, orderTotal } = await req.json();

  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("active", true)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Cupón no válido" }, { status: 404 });
  }

  // Check expiry
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ error: "El cupón ha expirado" }, { status: 400 });
  }

  // Check usage limit
  if (data.usage_limit && data.used_count >= data.usage_limit) {
    return NextResponse.json({ error: "El cupón ha alcanzado el límite de uso" }, { status: 400 });
  }

  // Check minimum order
  if (orderTotal < parseFloat(data.min_order_amount)) {
    return NextResponse.json({ error: `Pedido mínimo: ${data.min_order_amount}€` }, { status: 400 });
  }

  let discount = 0;
  if (data.discount_type === "percentage") {
    discount = (orderTotal * parseFloat(data.discount_value)) / 100;
  } else {
    discount = parseFloat(data.discount_value);
  }

  return NextResponse.json({
    code: data.code,
    discountType: data.discount_type,
    discountValue: parseFloat(data.discount_value),
    discount,
  });
}
