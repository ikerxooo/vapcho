"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, Pencil, Trash2, Star, Package, DollarSign,
  ShoppingCart, TrendingUp, Users, AlertTriangle, Gift, Mail,
  Upload, Download, BarChart3, X,
} from "lucide-react";
import ProductFormModal from "./ProductFormModal";
import type { Product, Order, Coupon, Invite, Analytics } from "@/lib/types";

type Tab = "products" | "orders" | "analytics" | "coupons" | "invites" | "import-export";

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, orderRes, couponRes, inviteRes, analyticsRes] = await Promise.all([
        fetch("/api/admin/products").then((r) => r.json()),
        fetch("/api/admin/orders").then((r) => r.json()),
        fetch("/api/admin/coupons").then((r) => r.json()),
        fetch("/api/admin/invites").then((r) => r.json()),
        fetch("/api/admin/analytics").then((r) => r.json()),
      ]);

      if (prodRes.products) setProducts(prodRes.products);
      if (orderRes.orders) setOrders(orderRes.orders);
      if (couponRes.coupons) setCoupons(couponRes.coupons);
      if (inviteRes.invites) setInvites(inviteRes.invites);
      if (analyticsRes.analytics) setAnalytics(analyticsRes.analytics);
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  async function handleSaveProduct(product: Partial<Product>) {
    const method = product.id ? "PUT" : "POST";
    await fetch("/api/admin/products", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    setShowForm(false);
    setEditingProduct(null);
    fetchAll();
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm("¿Eliminar este producto?")) return;
    await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    fetchAll();
  }

  async function handleToggleFeatured(product: Product) {
    await fetch("/api/admin/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...product, featured: !product.featured }),
    });
    fetchAll();
  }

  async function handleToggleEnabled(product: Product) {
    await fetch("/api/admin/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...product, enabled: !product.enabled }),
    });
    fetchAll();
  }

  async function handleUpdateOrderStatus(orderId: string, status: string) {
    await fetch("/api/admin/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: orderId, status }),
    });
    fetchAll();
  }

  async function handleCreateInvite() {
    await fetch("/api/admin/invites", { method: "POST" });
    fetchAll();
  }

  async function handleCreateCoupon() {
    const code = prompt("Código del cupón:");
    if (!code) return;
    const value = prompt("Valor del descuento (%):");
    if (!value) return;
    await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: code.toUpperCase(),
        discountType: "percentage",
        discountValue: parseFloat(value),
        active: true,
      }),
    });
    fetchAll();
  }

  function handleExport(type: "products" | "orders" | "customers") {
    let data: any[] = [];
    let filename = "";
    if (type === "products") {
      data = products;
      filename = "productos.csv";
    } else if (type === "orders") {
      data = orders;
      filename = "pedidos.csv";
    } else {
      data = orders.map((o) => ({ email: o.customerEmail, name: o.customerName }));
      filename = "clientes.csv";
    }

    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportCSV(file: File) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").filter(Boolean);
      const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));
        const product: any = {};
        headers.forEach((h, idx) => {
          product[h] = values[idx];
        });
        await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: product.name || "Producto importado",
            categoryName: product.categoryName || "General",
            price: parseFloat(product.price) || 0,
            stock: parseInt(product.stock) || 0,
            description: product.description || "",
            fullDescription: product.fullDescription || "",
            features: [],
            images: product.images ? product.images.split("|") : [],
            featured: false,
            enabled: true,
          }),
        });
      }
      fetchAll();
    };
    reader.readAsText(file);
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "products", label: "Productos", icon: <Package className="h-4 w-4" /> },
    { id: "orders", label: "Pedidos", icon: <ShoppingCart className="h-4 w-4" /> },
    { id: "analytics", label: "Analíticas", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "coupons", label: "Cupones", icon: <Gift className="h-4 w-4" /> },
    { id: "invites", label: "Invitaciones", icon: <Mail className="h-4 w-4" /> },
    { id: "import-export", label: "Import/Export", icon: <Download className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-mist dark:bg-ink">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold tracking-tight">Panel de Administración</h1>
          <a
            href="/"
            className="text-sm text-graphite transition hover:text-ink dark:hover:text-white"
          >
            Ver tienda →
          </a>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-xl2 px-4 py-2.5 text-sm font-medium transition ${
                tab === t.id
                  ? "bg-ink text-white dark:bg-white dark:text-ink"
                  : "bg-white text-graphite hover:text-ink dark:bg-white/5 dark:hover:text-white"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy border-t-transparent" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* PRODUCTS TAB */}
              {tab === "products" && (
                <div>
                  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite" />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar productos…"
                        className="w-full rounded-xl2 border border-line bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-navy dark:border-white/15 dark:bg-white/5"
                      />
                    </div>
                    <button
                      onClick={() => { setEditingProduct(null); setShowForm(true); }}
                      className="flex items-center justify-center gap-2 rounded-xl2 bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy dark:bg-white dark:text-ink"
                    >
                      <Plus className="h-4 w-4" />
                      Añadir producto
                    </button>
                  </div>

                  <div className="overflow-hidden rounded-xl3 border border-line dark:border-white/10">
                    <table className="w-full text-sm">
                      <thead className="bg-mist dark:bg-white/5">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold">Producto</th>
                          <th className="px-4 py-3 text-left font-semibold">Categoría</th>
                          <th className="px-4 py-3 text-right font-semibold">Precio</th>
                          <th className="px-4 py-3 text-right font-semibold">Stock</th>
                          <th className="px-4 py-3 text-center font-semibold">Destacado</th>
                          <th className="px-4 py-3 text-center font-semibold">Visible</th>
                          <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((p) => (
                          <tr key={p.id} className="border-t border-line dark:border-white/10">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {p.images[0] && (
                                  <img src={p.images[0]} alt="" className="h-12 w-10 rounded-lg object-cover" />
                                )}
                                <span className="font-medium">{p.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-graphite">{p.categoryName}</td>
                            <td className="px-4 py-3 text-right font-semibold">{p.price.toFixed(2)} €</td>
                            <td className={`px-4 py-3 text-right ${p.stock <= p.lowStockThreshold ? "text-error font-semibold" : ""}`}>
                              {p.stock}
                              {p.stock <= p.lowStockThreshold && p.stock > 0 && (
                                <AlertTriangle className="ml-1 inline h-3.5 w-3.5" />
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button onClick={() => handleToggleFeatured(p)} className="transition hover:scale-110">
                                <Star
                                  className={`h-5 w-5 ${p.featured ? "fill-warning text-warning" : "text-graphite"}`}
                                />
                              </button>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => handleToggleEnabled(p)}
                                className={`relative h-6 w-11 rounded-full transition ${p.enabled ? "bg-success" : "bg-graphite/30"}`}
                              >
                                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${p.enabled ? "left-5" : "left-0.5"}`} />
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => { setEditingProduct(p); setShowForm(true); }}
                                  className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-mist dark:hover:bg-white/10"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="flex h-8 w-8 items-center justify-center rounded-full text-error transition hover:bg-red-50 dark:hover:bg-red-500/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ORDERS TAB */}
              {tab === "orders" && (
                <div className="overflow-hidden rounded-xl3 border border-line dark:border-white/10">
                  <table className="w-full text-sm">
                    <thead className="bg-mist dark:bg-white/5">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Pedido</th>
                        <th className="px-4 py-3 text-left font-semibold">Cliente</th>
                        <th className="px-4 py-3 text-right font-semibold">Total</th>
                        <th className="px-4 py-3 text-center font-semibold">Pago</th>
                        <th className="px-4 py-3 text-center font-semibold">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-12 text-center text-graphite">
                            No hay pedidos todavía.
                          </td>
                        </tr>
                      ) : (
                        orders.map((o) => (
                          <tr key={o.id} className="border-t border-line dark:border-white/10">
                            <td className="px-4 py-3 font-mono text-xs">{o.orderNumber}</td>
                            <td className="px-4 py-3">{o.customerEmail}</td>
                            <td className="px-4 py-3 text-right font-semibold">{o.total.toFixed(2)} €</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                                o.paymentStatus === "paid" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                              }`}>
                                {o.paymentStatus === "paid" ? "Pagado" : "Pendiente"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <select
                                value={o.status}
                                onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                                className="rounded-xl2 border border-line bg-white px-3 py-1.5 text-xs outline-none focus:border-navy dark:border-white/15 dark:bg-white/5"
                              >
                                <option value="pending">Pendiente</option>
                                <option value="processing">Procesando</option>
                                <option value="shipped">Enviado</option>
                                <option value="delivered">Entregado</option>
                                <option value="cancelled">Cancelado</option>
                              </select>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ANALYTICS TAB */}
              {tab === "analytics" && analytics && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      { label: "Ventas totales", value: `${analytics.totalSales}`, icon: <ShoppingCart className="h-5 w-5" /> },
                      { label: "Ingresos", value: `${analytics.totalRevenue.toFixed(2)} €`, icon: <DollarSign className="h-5 w-5" /> },
                      { label: "Pedidos", value: `${analytics.totalOrders}`, icon: <Package className="h-5 w-5" /> },
                      { label: "Clientes activos", value: `${analytics.activeCustomers}`, icon: <Users className="h-5 w-5" /> },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-xl3 border border-line bg-white p-5 dark:border-white/10 dark:bg-white/5">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-wider text-graphite">{stat.label}</span>
                          {stat.icon}
                        </div>
                        <div className="font-display text-2xl font-bold">{stat.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="rounded-xl3 border border-line bg-white p-5 dark:border-white/10 dark:bg-white/5">
                      <h3 className="mb-4 flex items-center gap-2 font-display text-base font-bold">
                        <TrendingUp className="h-4 w-4" /> Más vendidos
                      </h3>
                      <div className="space-y-2">
                        {analytics.bestSellingProducts.map((p, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span>{p.name}</span>
                            <span className="font-semibold">{p.sold} uds · {p.revenue.toFixed(2)} €</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl3 border border-line bg-white p-5 dark:border-white/10 dark:bg-white/5">
                      <h3 className="mb-4 flex items-center gap-2 font-display text-base font-bold">
                        <BarChart3 className="h-4 w-4" /> Más vistos
                      </h3>
                      <div className="space-y-2">
                        {analytics.mostViewedProducts.map((p, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span>{p.name}</span>
                            <span className="font-semibold">{p.views} vistas</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {analytics.lowStockProducts.length > 0 && (
                    <div className="rounded-xl3 border border-warning/30 bg-warning/5 p-5">
                      <h3 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-warning">
                        <AlertTriangle className="h-4 w-4" /> Alertas de stock bajo
                      </h3>
                      <div className="space-y-2">
                        {analytics.lowStockProducts.map((p, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span>{p.name}</span>
                            <span className="font-semibold text-warning">{p.stock} unidades</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* COUPONS TAB */}
              {tab === "coupons" && (
                <div>
                  <div className="mb-6 flex justify-end">
                    <button
                      onClick={handleCreateCoupon}
                      className="flex items-center gap-2 rounded-xl2 bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy dark:bg-white dark:text-ink"
                    >
                      <Plus className="h-4 w-4" /> Crear cupón
                    </button>
                  </div>
                  <div className="overflow-hidden rounded-xl3 border border-line dark:border-white/10">
                    <table className="w-full text-sm">
                      <thead className="bg-mist dark:bg-white/5">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold">Código</th>
                          <th className="px-4 py-3 text-left font-semibold">Descripción</th>
                          <th className="px-4 py-3 text-right font-semibold">Descuento</th>
                          <th className="px-4 py-3 text-right font-semibold">Usos</th>
                          <th className="px-4 py-3 text-center font-semibold">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coupons.length === 0 ? (
                          <tr><td colSpan={5} className="px-4 py-12 text-center text-graphite">No hay cupones.</td></tr>
                        ) : (
                          coupons.map((c) => (
                            <tr key={c.id} className="border-t border-line dark:border-white/10">
                              <td className="px-4 py-3 font-mono font-semibold">{c.code}</td>
                              <td className="px-4 py-3 text-graphite">{c.description}</td>
                              <td className="px-4 py-3 text-right">
                                {c.discountType === "percentage" ? `${c.discountValue}%` : `${c.discountValue.toFixed(2)} €`}
                              </td>
                              <td className="px-4 py-3 text-right">{c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ""}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                                  c.active ? "bg-success/10 text-success" : "bg-graphite/10 text-graphite"
                                }`}>
                                  {c.active ? "Activo" : "Inactivo"}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* INVITES TAB */}
              {tab === "invites" && (
                <div>
                  <div className="mb-6 flex justify-end">
                    <button
                      onClick={handleCreateInvite}
                      className="flex items-center gap-2 rounded-xl2 bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy dark:bg-white dark:text-ink"
                    >
                      <Plus className="h-4 w-4" /> Generar invitación
                    </button>
                  </div>
                  <div className="space-y-3">
                    {invites.length === 0 ? (
                      <p className="py-12 text-center text-sm text-graphite">No hay invitaciones.</p>
                    ) : (
                      invites.map((inv) => (
                        <div key={inv.id} className="flex items-center justify-between rounded-xl2 border border-line p-4 dark:border-white/10">
                          <div>
                            <code className="text-sm font-semibold">
                              {typeof window !== "undefined" ? `${window.location.origin}/account?invite=${inv.token}` : inv.token}
                            </code>
                            {inv.expiresAt && (
                              <span className="ml-3 text-xs text-graphite">
                                Expira: {new Date(inv.expiresAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                            inv.used ? "bg-graphite/10 text-graphite" : "bg-success/10 text-success"
                          }`}>
                            {inv.used ? "Usada" : "Disponible"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* IMPORT/EXPORT TAB */}
              {tab === "import-export" && (
                <div className="space-y-6">
                  <div className="rounded-xl3 border border-line bg-white p-6 dark:border-white/10 dark:bg-white/5">
                    <h3 className="mb-4 flex items-center gap-2 font-display text-base font-bold">
                      <Upload className="h-4 w-4" /> Importar productos (CSV)
                    </h3>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImportCSV(file);
                      }}
                      className="text-sm"
                    />
                    <p className="mt-2 text-xs text-graphite">
                      Columnas: name, categoryName, price, stock, description, fullDescription, images (separadas por |)
                    </p>
                  </div>

                  <div className="rounded-xl3 border border-line bg-white p-6 dark:border-white/10 dark:bg-white/5">
                    <h3 className="mb-4 flex items-center gap-2 font-display text-base font-bold">
                      <Download className="h-4 w-4" /> Exportar datos
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleExport("products")}
                        className="rounded-xl2 border border-line px-5 py-2.5 text-sm font-semibold transition hover:bg-mist dark:border-white/15 dark:hover:bg-white/10"
                      >
                        Exportar productos
                      </button>
                      <button
                        onClick={() => handleExport("orders")}
                        className="rounded-xl2 border border-line px-5 py-2.5 text-sm font-semibold transition hover:bg-mist dark:border-white/15 dark:hover:bg-white/10"
                      >
                        Exportar pedidos
                      </button>
                      <button
                        onClick={() => handleExport("customers")}
                        className="rounded-xl2 border border-line px-5 py-2.5 text-sm font-semibold transition hover:bg-mist dark:border-white/15 dark:hover:bg-white/10"
                      >
                        Exportar clientes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {showForm && (
        <ProductFormModal
          initial={editingProduct}
          onClose={() => { setShowForm(false); setEditingProduct(null); }}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
}
