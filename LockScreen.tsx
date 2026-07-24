"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, Check, Package } from "lucide-react";
import { useProducts } from "@/context/ProductsContext";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";

export default function ProductDetail({ id }: { id: string }) {
  const { products, loaded } = useProducts();
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);

  const product = products.find((p) => p.id === id);

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-graphite">
        Cargando…
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-graphite">Este producto ya no está disponible.</p>
        <Link href="/" className="text-sm font-semibold underline underline-offset-4">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  function handleBuy() {
    if (!product) return;
    addItem({ id: product.id, name: product.name, price: product.price, image: product.images[0] });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  const favorite = isFavorite(product.id);

  return (
    <>
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-graphite transition hover:text-ink dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al catálogo
        </Link>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Carrusel de imágenes */}
          <div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl3 bg-mist dark:bg-white/5">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  src={product.images[activeImage]}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full w-full object-cover"
                />
              </AnimatePresence>
            </div>
            <div className="mt-4 flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`h-20 w-16 overflow-hidden rounded-xl2 border-2 transition ${
                    activeImage === i ? "border-navy dark:border-white" : "border-transparent opacity-60"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Información del producto */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-graphite">
              {product.category}
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">{product.name}</h1>
            <div className="mt-4 font-display text-2xl font-bold">{product.price.toFixed(2)} €</div>

            <p className="mt-6 text-sm leading-relaxed text-graphite">{product.fullDescription}</p>

            <div className="mt-6 space-y-2">
              {product.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 shrink-0 text-navy dark:text-white" />
                  {f}
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm text-graphite">
              <Package className="h-4 w-4" />
              {product.stock > 0 ? `${product.stock} unidades disponibles` : "Sin stock disponible"}
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={handleBuy}
                disabled={product.stock === 0}
                className="flex-1 rounded-xl2 bg-ink py-4 text-sm font-semibold text-white transition hover:bg-navy disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-ink"
              >
                {added ? "Añadido ✓" : "Comprar"}
              </button>
              <button
                onClick={() => toggleFavorite(product.id)}
                aria-label="Añadir a favoritos"
                className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl2 border border-line transition hover:bg-mist dark:border-white/15 dark:hover:bg-white/10"
              >
                <Heart
                  className="h-5 w-5"
                  fill={favorite ? "#0B1B3B" : "none"}
                  stroke={favorite ? "#0B1B3B" : "currentColor"}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <CartDrawer />
    </>
  );
}
