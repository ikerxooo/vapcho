import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "@/lib/config.server";
import { createServerClient } from "@/lib/supabase";

function checkAdmin() {
  return cookies().get(ADMIN_COOKIE)?.value === "1";
}

export async function GET() {
  if (!checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServerClient();

  const [ordersRes, productsRes, customersRes] = await Promise.all([
    supabase.from("orders").select("total, status, payment_status"),
    supabase.from("products").select("name, sold, views, stock, price, low_stock_threshold"),
    supabase.from("orders").select("user_id").not("user_id", "is", null),
  ]);

  const orders = ordersRes.data || [];
  const products = productsRes.data || [];

  const totalRevenue = orders
    .filter((o: any) => o.payment_status === "paid")
    .reduce((sum: number, o: any) => sum + parseFloat(o.total), 0);

  const activeCustomers = new Set(customersRes.data?.map((c: any) => c.user_id)).size;

  const bestSelling = [...products]
    .sort((a: any, b: any) => b.sold - a.sold)
    .slice(0, 5)
    .map((p: any) => ({
      name: p.name,
      sold: p.sold,
      revenue: p.sold * (parseFloat(p.price) || 0),
    }));

  const mostViewed = [...products]
    .sort((a: any, b: any) => b.views - a.views)
    .slice(0, 5)
    .map((p: any) => ({ name: p.name, views: p.views }));

  const lowStock = products
    .filter((p: any) => p.stock <= p.low_stock_threshold)
    .map((p: any) => ({ name: p.name, stock: p.stock }));

  const analytics = {
    totalSales: orders.length,
    totalRevenue,
    totalOrders: orders.length,
    bestSellingProducts: bestSelling,
    mostViewedProducts: mostViewed,
    activeCustomers,
    lowStockProducts: lowStock,
  };

  return NextResponse.json({ analytics });
}
