"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Product } from "@/lib/types";
import { useFavorites } from "@/context/FavoritesContext";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addItem } = useCart();
  const favorite = isFavorite(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.3) }}
    >
      <Link href={`/product/${product.id}`} className="group block">
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="overflow-hidden rounded-xl3 border border-line/70 bg-white shadow-soft transition-shadow duration-300 group-hover:shadow-card dark:border-white/10 dark:bg-white/[0.03]"
        >
          <div className="relative aspect-[4/5] overflow-hidden bg-mist dark:bg-white/5">
            <motion.img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover"
              whileHover={{ scale: 1.06 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
            {product.stock <= 3 && product.stock > 0 && (
              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink">
                Últimas unidades
              </span>
            )}
            {product.stock === 0 && (
              <span className="absolute left-3 top-3 rounded-full bg-ink/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                Agotado
              </span>
            )}
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleFavorite(product.id);
              }}
              aria-label="Añadir a favoritos"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur transition hover:scale-110 dark:bg-ink/70"
            >
              <Heart
                className="h-4 w-4"
                strokeWidth={1.75}
                fill={favorite ? "#0B1B3B" : "none"}
                stroke={favorite ? "#0B1B3B" : "currentColor"}
              />
            </button>
          </div>

          <div className="p-5">
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-graphite">
              {product.category}
            </div>
            <h3 className="font-display text-[15px] font-semibold leading-tight">{product.name}</h3>
            <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-graphite">
              {product.description}
            </p>

            <div className="mt-4 flex items-center justify-between">
              <span className="font-display text-base font-bold">{product.price.toFixed(2)} €</span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  addItem({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.images[0],
                  });
                }}
                disabled={product.stock === 0}
                className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white transition hover:bg-navy disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-ink"
              >
                Comprar
              </button>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
