"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { useProducts } from "@/context/ProductsContext";
import ProductCard from "./ProductCard";
import { SortOption } from "@/lib/types";

const SORT_LABELS: Record<SortOption, string> = {
  relevance: "Relevancia",
  "price-asc": "Precio: menor a mayor",
  "price-desc": "Precio: mayor a menor",
  "best-selling": "Más vendidos",
  newest: "Novedades",
};

export default function Catalog() {
  const { products } = useProducts();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("Todas");
  const [sort, setSort] = useState<SortOption>("relevance");

  const categories = useMemo(
    () => ["Todas", ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const matchesQuery =
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "Todas" || p.category === category;
      return matchesQuery && matchesCategory;
    });

    switch (sort) {
      case "price-asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "best-selling":
        list = [...list].sort((a, b) => b.sold - a.sold);
        break;
      case "newest":
        list = [...list].sort((a, b) => b.createdAt - a.createdAt);
        break;
    }

    return list;
  }, [products, query, category, sort]);

  return (
    <section id="catalogo" className="mx-auto max-w-7xl px-6 py-14">
      <div className="mb-8 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold tracking-tight">Catálogo</h2>
          <span className="text-sm text-graphite">{filtered.length} productos</span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar productos…"
              className="w-full rounded-xl2 border border-line bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-navy dark:border-white/15 dark:bg-white/5 dark:focus:border-white/40"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl2 border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-navy dark:border-white/15 dark:bg-white/5"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-xl2 border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-navy dark:border-white/15 dark:bg-white/5"
          >
            {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
              <option key={key} value={key}>
                {SORT_LABELS[key]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl3 border border-dashed border-line py-24 text-center text-sm text-graphite dark:border-white/15"
          >
            No se ha encontrado ningún producto con esos criterios.
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
