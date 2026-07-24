"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/lib/types";

export default function FeaturedCarousel({ products }: { products: Product[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  function scroll(dir: 1 | -1) {
    scrollerRef.current?.scrollBy({ left: dir * 340, behavior: "smooth" });
  }

  return (
    <section className="mx-auto max-w-7xl px-6 pt-12">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold tracking-tight">Destacados</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line transition hover:bg-mist dark:border-white/15 dark:hover:bg-white/10"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll(1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line transition hover:bg-mist dark:border-white/15 dark:hover:bg-white/10"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((p) => (
          <Link key={p.id} href={`/product/${p.id}`} className="snap-start shrink-0">
            <motion.div
              whileHover={{ y: -6 }}
              className="relative h-80 w-60 overflow-hidden rounded-xl3 shadow-card"
            >
              <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-white/70">
                  {p.category}
                </div>
                <div className="font-display text-sm font-semibold">{p.name}</div>
                <div className="mt-0.5 text-sm font-bold">{p.price.toFixed(2)} €</div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </section>
  );
}
