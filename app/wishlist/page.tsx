"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ArrowLeft } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";
import { useProducts } from "@/context/ProductsContext";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function WishlistPage() {
  const { favorites } = useFavorites();
  const { products, loading } = useProducts();

  const favProducts = products.filter((p) => favorites.includes(p.id));

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-graphite transition hover:text-ink dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al catálogo
        </Link>

        <div className="mb-8 flex items-center gap-3">
          <Heart className="h-6 w-6 fill-navy text-navy dark:fill-white dark:text-white" />
          <h1 className="font-display text-2xl font-bold tracking-tight">Favoritos</h1>
          <span className="text-sm text-graphite">({favProducts.length})</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy border-t-transparent" />
          </div>
        ) : favProducts.length === 0 ? (
          <div className="rounded-xl3 border border-dashed border-line py-24 text-center dark:border-white/15">
            <Heart className="mx-auto mb-4 h-10 w-10 text-graphite" />
            <p className="text-sm text-graphite">No tienes productos en favoritos todavía.</p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy dark:bg-white dark:text-ink"
            >
              Explorar catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
