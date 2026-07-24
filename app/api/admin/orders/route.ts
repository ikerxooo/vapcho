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
  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const orders = (data || []).map((o: any) => ({
    id: o.id,
    orderNumber: o.order_number,
    userId: o.user_id,
    customerEmail: o.customer_email,
    customerName: o.customer_name,
    shippingAddress: o.shipping_address,
    status: o.status,
    paymentMethod: o.payment_method,
    paymentStatus: o.payment_status,
    subtotal: parseFloat(o.subtotal) || 0,
    discountAmount: parseFloat(o.discount_amount) || 0,
    shippingCost: parseFloat(o.shipping_cost) || 0,
    total: parseFloat(o.total) || 0,
    couponCode: o.coupon_code,
    invoiceNumber: o.invoice_number,
    items: (o.items || []).map((it: any) => ({
      id: it.id,
      orderId: it.order_id,
      productId: it.product_id,
      productName: it.product_name,
      productImage: it.product_image,
      variantName: it.variant_name,
      unitPrice: parseFloat(it.unit_price) || 0,
      quantity: it.quantity,
      lineTotal: parseFloat(it.line_total) || 0,
    })),
    createdAt: o.created_at,
    updatedAt: o.updated_at,
  }));

  return NextResponse.json({ orders });
}

export async function PUT(req: NextRequest) {
  if (!checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status } = await req.json();
  const supabase = createServerClient();

  const { error } = await supabase.from("orders").update({ status }).eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
