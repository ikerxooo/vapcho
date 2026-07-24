"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import NewsBanner from "./NewsBanner";
import Footer from "./Footer";
import Catalog from "./Catalog";
import FeaturedCarousel from "./FeaturedCarousel";
import CartDrawer from "./CartDrawer";
import LoadingScreen from "./LoadingScreen";
import { useProducts } from "@/context/ProductsContext";

export default function CatalogApp() {
  const { products, loaded } = useProducts();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const featured = products.filter((p) => p.featured);

  return (
    <>
      <LoadingScreen show={showLoading || !loaded} />
      <NewsBanner />
      <Navbar />

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-7xl px-6 pt-16 text-center"
      >
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-graphite">
          Colección privada
        </div>
        <h1 className="mx-auto mt-4 max-w-2xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Diseño esencial, hecho para durar.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-graphite">
          Piezas seleccionadas con cuidado. Sin ruido, sin exceso — solo lo esencial.
        </p>
        <a
          href="#catalogo"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-navy dark:bg-white dark:text-ink"
        >
          Ver catálogo
        </a>
      </motion.section>

      <FeaturedCarousel products={featured} />
      <Catalog />
      <Footer />
      <CartDrawer />
    </>
  );
}
