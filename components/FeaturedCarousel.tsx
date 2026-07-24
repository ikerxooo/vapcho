"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { Product } from "@/lib/types";

export default function FeaturedCarousel({ products }: { products: Product[] }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const next = useCallback(() => {
    setDirection(1);
    setIndex((i) => (i + 1) % products.length);
  }, [products.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setIndex((i) => (i - 1 + products.length) % products.length);
  }, [products.length]);

  useEffect(() => {
    if (products.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, products.length]);

  if (products.length === 0) return null;

  const product = products[index];

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-6 flex items-center gap-2">
        <Star className="h-4 w-4 fill-navy text-navy dark:fill-white dark:text-white" />
        <h2 className="font-display text-xl font-bold tracking-tight">Productos destacados</h2>
      </div>

      <div className="relative overflow-hidden rounded-xl3">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={index}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative aspect-[21/9] w-full"
          >
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/70">
                {product.categoryName}
              </div>
              <h3 className="mt-2 font-display text-2xl font-bold text-white">{product.name}</h3>
              <p className="mt-1 max-w-md text-sm text-white/80">{product.description}</p>
              <div className="mt-4 font-display text-xl font-bold text-white">
                {product.price.toFixed(2)} €
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {products.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 backdrop-blur transition hover:bg-white dark:bg-ink/70 dark:hover:bg-ink"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 backdrop-blur transition hover:bg-white dark:bg-ink/70 dark:hover:bg-ink"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
              {products.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > index ? 1 : -1);
                    setIndex(i);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    i === index ? "w-6 bg-white" : "w-2 bg-white/40"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
