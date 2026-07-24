"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Building2, Smartphone, Wallet, Tag, Check, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { PaymentMethod } from "@/lib/types";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponApplied, setCouponApplied] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [shipping, setShipping] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "España",
  });

  useEffect(() => {
    if (!user && items.length > 0) {
      // Allow guest checkout but encourage login
    }
  }, [user, items.length]);

  const grandTotal = Math.max(0, total - discount);

  async function applyCoupon() {
    setCouponError(null);
    setCouponApplied(false);

    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode, orderTotal: total }),
    });

    const data = await res.json();
    if (!res.ok) {
      setCouponError(data.error || "Cupón no válido");
      return;
    }

    setDiscount(data.discount);
    setCouponApplied(true);
  }

  async function handleCheckout() {
    if (items.length === 0) return;
    if (!shipping.fullName || !shipping.email || !shipping.address) {
      alert("Por favor completa los datos de envío.");
      return;
    }

    setProcessing(true);

    try {
      const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
      const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;

      // Create order in database
      if (user) {
        const { data: orderData, error: orderError } = await supabase.from("orders").insert({
          order_number: orderNumber,
          user_id: user.id,
          customer_email: shipping.email,
          customer_name: shipping.fullName,
          shipping_address: shipping,
          status: "pending",
          payment_method: paymentMethod,
          payment_status: paymentMethod === "stripe" ? "unpaid" : "unpaid",
          subtotal: total,
          discount_amount: discount,
          shipping_cost: 0,
          total: grandTotal,
          coupon_code: couponApplied ? couponCode.toUpperCase() : null,
          invoice_number: invoiceNumber,
        }).select().single();

        if (orderError) throw orderError;

        // Insert order items
        await supabase.from("order_items").insert(
          items.map((item) => ({
            order_id: orderData.id,
            product_id: item.productId,
            product_name: item.name,
            product_image: item.image,
            variant_name: item.variantName,
            unit_price: item.price,
            quantity: item.quantity,
            line_total: item.price * item.quantity,
          }))
        );

        // Decrement stock
        for (const item of items) {
          await supabase.rpc("decrement_stock", {
            product_id: item.productId,
            quantity: item.quantity,
          });
        }

        // Increment coupon usage
        if (couponApplied) {
          await supabase.rpc("increment_coupon_usage", { coupon_code: couponCode.toUpperCase() });
        }
      }

      setOrderNumber(orderNumber);
      setSuccess(true);
      clearCart();
    } catch (err: any) {
      alert("Error al procesar el pedido: " + err.message);
    } finally {
      setProcessing(false);
    }
  }

  if (success) {
    return (
      <>
        <Navbar />
        <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10"
          >
            <Check className="h-10 w-10 text-success" />
          </motion.div>
          <h1 className="font-display text-2xl font-bold">¡Pedido realizado!</h1>
          <p className="mt-2 text-sm text-graphite">
            Tu número de pedido es <span className="font-mono font-semibold">{orderNumber}</span>
          </p>
          <p className="mt-1 text-sm text-graphite">
            {paymentMethod === "bank_transfer" && "Recibirás instrucciones de transferencia bancaria por correo."}
            {paymentMethod === "bizum" && "Te contactaremos para coordinar el pago por Bizum."}
            {paymentMethod === "paypal" && "Te enviaremos un enlace de pago por PayPal."}
            {paymentMethod === "stripe" && "Serás redirigido a la pasarela de pago."}
          </p>
          <button
            onClick={() => router.push("/account/orders")}
            className="mt-8 rounded-xl2 bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy dark:bg-white dark:text-ink"
          >
            Ver mis pedidos
          </button>
        </div>
        <Footer />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
          <p className="text-sm text-graphite">Tu carrito está vacío.</p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 rounded-xl2 bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy dark:bg-white dark:text-ink"
          >
            Ver catálogo
          </button>
        </div>
        <Footer />
      </>
    );
  }

  const paymentMethods: { id: PaymentMethod; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: "stripe", label: "Tarjeta (Stripe)", icon: <CreditCard className="h-5 w-5" />, desc: "Pago seguro con tarjeta" },
    { id: "paypal", label: "PayPal", icon: <Wallet className="h-5 w-5" />, desc: "Paga con tu cuenta PayPal" },
    { id: "bank_transfer", label: "Transferencia bancaria", icon: <Building2 className="h-5 w-5" />, desc: "Transferencia tradicional" },
    { id: "bizum", label: "Bizum", icon: <Smartphone className="h-5 w-5" />, desc: "Pago móvil instantáneo" },
  ];

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-graphite transition hover:text-ink dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </button>

        <h1 className="mb-8 font-display text-2xl font-bold tracking-tight">Finalizar compra</h1>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Left: forms */}
          <div className="space-y-8">
            {/* Shipping info */}
            <div className="rounded-xl3 border border-line p-6 dark:border-white/10">
              <h2 className="mb-4 font-display text-lg font-bold">Datos de envío</h2>
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Nombre completo" value={shipping.fullName} onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })} className="col-span-2 rounded-xl2 border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-navy dark:border-white/15 dark:bg-white/5" />
                <input placeholder="Correo electrónico" type="email" value={shipping.email} onChange={(e) => setShipping({ ...shipping, email: e.target.value })} className="rounded-xl2 border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-navy dark:border-white/15 dark:bg-white/5" />
                <input placeholder="Teléfono" value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value })} className="rounded-xl2 border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-navy dark:border-white/15 dark:bg-white/5" />
                <input placeholder="Dirección" value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })} className="col-span-2 rounded-xl2 border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-navy dark:border-white/15 dark:bg-white/5" />
                <input placeholder="Ciudad" value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} className="rounded-xl2 border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-navy dark:border-white/15 dark:bg-white/5" />
                <input placeholder="Código postal" value={shipping.postalCode} onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })} className="rounded-xl2 border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-navy dark:border-white/15 dark:bg-white/5" />
              </div>
            </div>

            {/* Payment method */}
            <div className="rounded-xl3 border border-line p-6 dark:border-white/10">
              <h2 className="mb-4 font-display text-lg font-bold">Método de pago</h2>
              <div className="space-y-2">
                {paymentMethods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`flex w-full items-center gap-3 rounded-xl2 border p-4 text-left transition ${
                      paymentMethod === m.id
                        ? "border-navy bg-navy/5 dark:border-white dark:bg-white/5"
                        : "border-line hover:border-navy dark:border-white/15"
                    }`}
                  >
                    {m.icon}
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{m.label}</div>
                      <div className="text-xs text-graphite">{m.desc}</div>
                    </div>
                    {paymentMethod === m.id && <Check className="h-5 w-5 text-navy dark:text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: order summary */}
          <div>
            <div className="sticky top-20 rounded-xl3 border border-line p-6 dark:border-white/10">
              <h2 className="mb-4 font-display text-lg font-bold">Resumen del pedido</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="h-14 w-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{item.name}</div>
                      <div className="text-xs text-graphite">Cantidad: {item.quantity}</div>
                    </div>
                    <div className="text-sm font-semibold">{(item.price * item.quantity).toFixed(2)} €</div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="mt-4 border-t border-line pt-4 dark:border-white/10">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite" />
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Código de descuento"
                      className="w-full rounded-xl2 border border-line bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-navy dark:border-white/15 dark:bg-white/5"
                    />
                  </div>
                  <button
                    onClick={applyCoupon}
                    className="rounded-xl2 border border-line px-4 py-2.5 text-sm font-semibold transition hover:bg-mist dark:border-white/15 dark:hover:bg-white/10"
                  >
                    Aplicar
                  </button>
                </div>
                {couponApplied && (
                  <p className="mt-2 text-xs text-success">Cupón aplicado: -{discount.toFixed(2)} €</p>
                )}
                {couponError && (
                  <p className="mt-2 text-xs text-error">{couponError}</p>
                )}
              </div>

              {/* Totals */}
              <div className="mt-4 space-y-2 border-t border-line pt-4 dark:border-white/10">
                <div className="flex justify-between text-sm">
                  <span className="text-graphite">Subtotal</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-graphite">Descuento</span>
                    <span className="text-success">-{discount.toFixed(2)} €</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-graphite">Envío</span>
                  <span>Gratis</span>
                </div>
                <div className="flex justify-between border-t border-line pt-2 dark:border-white/10">
                  <span className="font-display text-lg font-bold">Total</span>
                  <span className="font-display text-lg font-bold">{grandTotal.toFixed(2)} €</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={processing}
                className="mt-6 w-full rounded-xl2 bg-ink py-4 text-sm font-semibold text-white transition hover:bg-navy disabled:opacity-60 dark:bg-white dark:text-ink"
              >
                {processing ? "Procesando…" : `Confirmar pedido · ${grandTotal.toFixed(2)} €`}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
