import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, serviceKey);

    const url = new URL(req.url);
    const path = url.pathname.replace("/functions/v1/admin-operations", "");
    const segments = path.split("/").filter(Boolean);

    // GET /products — list all products (including disabled)
    if (segments[0] === "products" && req.method === "GET") {
      const [prodRes, imgRes] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("product_images").select("*").order("sort_order", { ascending: true }),
      ]);

      if (prodRes.error) {
        return new Response(JSON.stringify({ error: prodRes.error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const imagesMap = new Map<string, string[]>();
      for (const img of imgRes.data || []) {
        const arr = imagesMap.get(img.product_id) || [];
        arr.push(img.url);
        imagesMap.set(img.product_id, arr);
      }

      const products = (prodRes.data || []).map((p: any) => ({
        ...p,
        images: imagesMap.get(p.id) || [],
      }));

      return new Response(JSON.stringify({ products }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /products — create product
    if (segments[0] === "products" && req.method === "POST") {
      const body = await req.json();
      const slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") + "-" + Date.now().toString(36);

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

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (body.images && body.images.length > 0) {
        await supabase.from("product_images").insert(
          body.images.map((url: string, i: number) => ({
            product_id: data.id,
            url,
            sort_order: i,
          }))
        );
      }

      return new Response(JSON.stringify({ product: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PUT /products — update product
    if (segments[0] === "products" && req.method === "PUT") {
      const body = await req.json();
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

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

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

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DELETE /products?id=xxx — delete product
    if (segments[0] === "products" && req.method === "DELETE") {
      const id = url.searchParams.get("id");
      if (!id) {
        return new Response(JSON.stringify({ error: "Missing id" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /orders — list all orders
    if (segments[0] === "orders" && req.method === "GET") {
      const { data, error } = await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .order("created_at", { ascending: false });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ orders: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // PUT /orders — update order status
    if (segments[0] === "orders" && req.method === "PUT") {
      const { id, status } = await req.json();
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /coupons — list coupons
    if (segments[0] === "coupons" && req.method === "GET") {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ coupons: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /coupons — create coupon
    if (segments[0] === "coupons" && req.method === "POST") {
      const body = await req.json();
      const { data, error } = await supabase.from("coupons").insert({
        code: body.code,
        description: body.description || "",
        discount_type: body.discountType || "percentage",
        discount_value: body.discountValue || 0,
        min_order_amount: body.minOrderAmount || 0,
        usage_limit: body.usageLimit || null,
        active: body.active !== false,
      }).select().single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ coupon: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /invites — list invites
    if (segments[0] === "invites" && req.method === "GET") {
      const { data, error } = await supabase
        .from("invites")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ invites: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /invites — create invite
    if (segments[0] === "invites" && req.method === "POST") {
      const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase.from("invites").insert({
        token,
        expires_at: expiresAt,
      }).select().single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ invite: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /analytics — dashboard stats
    if (segments[0] === "analytics" && req.method === "GET") {
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

      return new Response(JSON.stringify({ analytics }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
