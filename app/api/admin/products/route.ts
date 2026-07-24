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
  const [prodRes, imgRes] = await Promise.all([
    supabase.from("products").select("*").order("created_at", { ascending: false }),
    supabase.from("product_images").select("*").order("sort_order", { ascending: true }),
  ]);

  if (prodRes.error) return NextResponse.json({ error: prodRes.error.message }, { status: 500 });

  const imagesMap = new Map<string, string[]>();
  for (const img of imgRes.data || []) {
    const arr = imagesMap.get(img.product_id) || [];
    arr.push(img.url);
    imagesMap.set(img.product_id, arr);
  }

  const products = (prodRes.data || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug || p.id,
    description: p.description,
    fullDescription: p.full_description,
    features: p.features || [],
    specifications: p.specifications || {},
    price: parseFloat(p.price) || 0,
    categoryId: p.category_id,
    categoryName: p.category_name,
    stock: p.stock,
    lowStockThreshold: p.low_stock_threshold,
    featured: p.featured,
    enabled: p.enabled,
    sold: p.sold,
    views: p.views,
    images: imagesMap.get(p.id) || [],
    variants: [],
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  }));

  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  if (!checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const supabase = createServerClient();

  const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString(36);

  const { data, error } = await supabase.from("products").insert({
    name: body.name,
    slug,
    description: body.description || "",
    full_description: body.fullDescription || body.description || "",
    features: body.features || [],
    specifications: body.specifications || {},
    price: body.price || 0,
    category_name: body.categoryName || "General",
    stock: body.stock || 0,
    low_stock_threshold: 5,
    featured: body.featured || false,
    enabled: body.enabled !== false,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Insert images
  if (body.images && body.images.length > 0) {
    await supabase.from("product_images").insert(
      body.images.map((url: string, i: number) => ({
        product_id: data.id,
        url,
        sort_order: i,
      }))
    );
  }

  return NextResponse.json({ product: data });
}

export async function PUT(req: NextRequest) {
  if (!checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const supabase = createServerClient();
  const productId = body.id;

  const { error } = await supabase.from("products").update({
    name: body.name,
    description: body.description,
    full_description: body.fullDescription,
    features: body.features,
    price: body.price,
    category_name: body.categoryName,
    stock: body.stock,
    featured: body.featured,
    enabled: body.enabled,
  }).eq("id", productId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Update images if provided
  if (body.images) {
    await supabase.from("product_images").delete().eq("product_id", productId);
    if (body.images.length > 0) {
      await supabase.from("product_images").insert(
        body.images.map((url: string, i: number) => ({
          product_id: productId,
          url,
          sort_order: i,
        }))
      );
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = createServerClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
