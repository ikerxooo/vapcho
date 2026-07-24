"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total, clearCart } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-ink"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5 dark:border-white/10">
              <h3 className="font-display text-lg font-bold">Tu carrito</h3>
              <button
                onClick={closeCart}
                className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-mist dark:hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <p className="mt-20 text-center text-sm text-graphite">Tu carrito está vacío.</p>
              ) : (
                <div className="space-y-5">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-20 w-16 rounded-xl2 object-cover"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-semibold">{item.name}</div>
                        <div className="mt-0.5 text-sm text-graphite">{item.price.toFixed(2)} €</div>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-line dark:border-white/15"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-line dark:border-white/15"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="ml-auto text-graphite transition hover:text-red-500"
                            aria-label="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-line px-6 py-5 dark:border-white/10">
                <div className="mb-4 flex items-center justify-between text-sm">
                  <span className="text-graphite">Total</span>
                  <span className="font-display text-lg font-bold">{total.toFixed(2)} €</span>
                </div>
                <button className="w-full rounded-xl2 bg-ink py-3.5 text-sm font-semibold text-white transition hover:bg-navy dark:bg-white dark:text-ink">
                  Finalizar compra
                </button>
                <button
                  onClick={clearCart}
                  className="mt-2 w-full py-2 text-xs text-graphite transition hover:text-ink dark:hover:text-white"
                >
                  Vaciar carrito
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
