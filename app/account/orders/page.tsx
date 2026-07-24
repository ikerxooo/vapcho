"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, User, LogOut, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { Order, Product } from "@/lib/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AccountDashboard() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/account");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      setLoadingData(true);
      try {
        const [ordersRes, recentRes] = await Promise.all([
          supabase
            .from("orders")
            .select("*, items:order_items(*)")
            .eq("user_id", user!.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("recently_viewed")
            .select("product:products(*)")
            .eq("user_id", user!.id)
            .order("viewed_at", { ascending: false })
            .limit(6),
        ]);

        if (ordersRes.data) {
          setOrders(
            ordersRes.data.map((o: any) => ({
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
              notes: o.notes || null,
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
            }))
          );
        }

        if (recentRes.data) {
          setRecentlyViewed(
            recentRes.data.map((r: any) => ({
              id: r.product.id,
              name: r.product.name,
              slug: r.product.slug,
              description: r.product.description,
              fullDescription: r.product.full_description,
              features: r.product.features || [],
              specifications: r.product.specifications || {},
              price: parseFloat(r.product.price) || 0,
              categoryId: r.product.category_id,
              categoryName: r.product.category_name,
              stock: r.product.stock,
              lowStockThreshold: r.product.low_stock_threshold,
              featured: r.product.featured,
              enabled: r.product.enabled,
              sold: r.product.sold,
              views: r.product.views,
              images: [],
              variants: [],
              createdAt: r.product.created_at,
              updatedAt: r.product.updated_at,
            }))
          );
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy border-t-transparent" />
      </div>
    );
  }

  const statusLabels: Record<string, string> = {
    pending: "Pendiente",
    processing: "Procesando",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado",
  };

  const statusColors: Record<string, string> = {
    pending: "bg-warning/10 text-warning",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-success/10 text-success",
    cancelled: "bg-error/10 text-error",
  };

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Mi cuenta</h1>
            <p className="mt-1 text-sm text-graphite">{user.email}</p>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 rounded-xl2 border border-line px-4 py-2.5 text-sm font-semibold transition hover:bg-mist dark:border-white/15 dark:hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>

        {loadingData ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy border-t-transparent" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl3 border border-line bg-white p-5 dark:border-white/10 dark:bg-white/5">
                <Package className="mb-2 h-5 w-5 text-graphite" />
                <div className="font-display text-2xl font-bold">{orders.length}</div>
                <div className="text-xs font-semibold uppercase tracking-wider text-graphite">Pedidos</div>
              </div>
              <div className="rounded-xl3 border border-line bg-white p-5 dark:border-white/10 dark:bg-white/5">
                <User className="mb-2 h-5 w-5 text-graphite" />
                <div className="font-display text-lg font-bold truncate">{user.email}</div>
                <div className="text-xs font-semibold uppercase tracking-wider text-graphite">Cliente</div>
              </div>
              <div className="rounded-xl3 border border-line bg-white p-5 dark:border-white/10 dark:bg-white/5">
                <Clock className="mb-2 h-5 w-5 text-graphite" />
                <div className="font-display text-2xl font-bold">{recentlyViewed.length}</div>
                <div className="text-xs font-semibold uppercase tracking-wider text-graphite">Vistos recientemente</div>
              </div>
            </div>

            {/* Recent orders */}
            <div>
              <h2 className="mb-4 font-display text-lg font-bold">Pedidos recientes</h2>
              {orders.length === 0 ? (
                <p className="rounded-xl2 border border-dashed border-line py-12 text-center text-sm text-graphite dark:border-white/15">
                  Aún no has realizado ningún pedido.
                </p>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((o) => (
                    <div key={o.id} className="flex items-center justify-between rounded-xl2 border border-line p-4 dark:border-white/10">
                      <div>
                        <div className="font-mono text-xs text-graphite">{o.orderNumber}</div>
                        <div className="text-sm font-semibold">{o.total.toFixed(2)} €</div>
                        <div className="text-xs text-graphite">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[o.status]}`}>
                        {statusLabels[o.status]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recently viewed */}
            {recentlyViewed.length > 0 && (
              <div>
                <h2 className="mb-4 font-display text-lg font-bold">Vistos recientemente</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                  {recentlyViewed.map((p) => (
                    <a key={p.id} href={`/product/${p.id}`} className="group block">
                      <div className="aspect-square overflow-hidden rounded-xl2 bg-mist dark:bg-white/5">
                        {p.images[0] && (
                          <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                        )}
                      </div>
                      <p className="mt-1.5 text-xs font-medium line-clamp-1">{p.name}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
      <Footer />
    </>
  );
}
