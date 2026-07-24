"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, Check, Package, Share2, Star, ZoomIn } from "lucide-react";
import { useProducts } from "@/context/ProductsContext";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import type { Review } from "@/lib/types";

export default function ProductDetail({ id }: { id: string }) {
  const { products, loading } = useProducts();
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<typeof products>([]);

  const product = products.find((p) => p.id === id);

  useEffect(() => {
    if (!product) return;

    // Increment view count via API
    fetch("/api/recently-viewed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: id }),
    }).catch(() => {});

    // Fetch reviews
    supabase
      .from("reviews")
      .select("*, author:auth.users(email)")
      .eq("product_id", id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setReviews(
            data.map((r: any) => ({
              id: r.id,
              productId: r.product_id,
              userId: r.user_id,
              rating: r.rating,
              comment: r.comment,
              createdAt: r.created_at,
              authorEmail: r.author?.email,
            }))
          );
        }
      });

    // Related products (same category)
    const related = products
      .filter((p) => p.categoryName === product.categoryName && p.id !== product.id)
      .slice(0, 4);
    setRelatedProducts(related);
  }, [id, product, products]);

  if (loading) {
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
    const variant = product.variants.find((v) => v.id === selectedVariant);
    addItem({
      id: selectedVariant ? `${product.id}-${selectedVariant}` : product.id,
      productId: product.id,
      name: product.name,
      price: variant ? product.price + variant.priceAdjustion : product.price,
      image: product.images[0],
      quantity: 1,
      variantName: variant ? `${variant.name}: ${variant.value}` : undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  function handleShare() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
    }
  }

  const favorite = isFavorite(product.id);
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

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
          {/* Image gallery */}
          <div>
            <div
              className="relative aspect-[4/5] cursor-zoom-in overflow-hidden rounded-xl3 bg-mist dark:bg-white/5"
              onClick={() => setZoom(true)}
            >
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
              <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur">
                <ZoomIn className="h-4 w-4" />
              </div>
            </div>
            {product.images.length > 1 && (
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
            )}
          </div>

          {/* Product info */}
          <div>
            <div className="flex items-center gap-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-graphite">
                {product.categoryName}
              </div>
              {avgRating && (
                <div className="flex items-center gap-1 text-xs text-graphite">
                  <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                  {avgRating} ({reviews.length})
                </div>
              )}
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

            {/* Specifications */}
            {Object.keys(product.specifications).length > 0 && (
              <div className="mt-6 rounded-xl2 border border-line p-4 dark:border-white/10">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-graphite">
                  Especificaciones
                </h4>
                <dl className="space-y-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <dt className="text-graphite">{key}</dt>
                      <dd className="font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Variants */}
            {product.variants.length > 0 && (
              <div className="mt-6">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-graphite">
                  {product.variants[0].name}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v.id)}
                      disabled={v.stock === 0}
                      className={`rounded-xl2 border px-4 py-2 text-sm transition disabled:opacity-40 ${
                        selectedVariant === v.id
                          ? "border-navy bg-navy text-white dark:border-white dark:bg-white dark:text-ink"
                          : "border-line hover:border-navy dark:border-white/15"
                      }`}
                    >
                      {v.value}
                      {v.priceAdjustion > 0 && ` (+${v.priceAdjustion.toFixed(2)}€)`}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
              <button
                onClick={handleShare}
                aria-label="Compartir producto"
                className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl2 border border-line transition hover:bg-mist dark:border-white/15 dark:hover:bg-white/10"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>

            {/* Reviews */}
            <div className="mt-10">
              <h3 className="mb-4 font-display text-lg font-bold">Reseñas ({reviews.length})</h3>
              {reviews.length === 0 ? (
                <p className="text-sm text-graphite">Aún no hay reseñas. ¡Sé el primero en valorar!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-xl2 border border-line p-4 dark:border-white/10">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-semibold">
                          {review.authorEmail || "Cliente"}
                        </span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-3.5 w-3.5 ${
                                s <= review.rating ? "fill-warning text-warning" : "text-graphite"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-graphite">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h3 className="mb-6 font-display text-xl font-bold">Productos relacionados</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {relatedProducts.map((p) => (
                <Link key={p.id} href={`/product/${p.id}`} className="group block">
                  <div className="aspect-[4/5] overflow-hidden rounded-xl2 bg-mist dark:bg-white/5">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  </div>
                  <h4 className="mt-2 text-sm font-semibold">{p.name}</h4>
                  <span className="text-sm text-graphite">{p.price.toFixed(2)} €</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Zoom modal */}
      <AnimatePresence>
        {zoom && product && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoom(false)}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-8"
          >
            <motion.img
              src={product.images[activeImage]}
              alt={product.name}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-h-full max-w-full rounded-xl2 object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
      <CartDrawer />
    </>
  );
}
