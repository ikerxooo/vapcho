"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/types";

interface ProductsContextValue {
  products: Product[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextValue>({
  products: [],
  loading: true,
  error: null,
  refresh: async () => {},
});

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchProducts() {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, imgRes, varRes] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("product_images").select("*").order("sort_order", { ascending: true }),
        supabase.from("product_variants").select("*"),
      ]);

      if (prodRes.error) throw prodRes.error;

      const imagesMap = new Map<string, string[]>();
      for (const img of imgRes.data || []) {
        const arr = imagesMap.get(img.product_id) || [];
        arr.push(img.url);
        imagesMap.set(img.product_id, arr);
      }

      const variantsMap = new Map<string, any[]>();
      for (const v of varRes.data || []) {
        const arr = variantsMap.get(v.product_id) || [];
        arr.push(v);
        variantsMap.set(v.product_id, arr);
      }

      const mapped: Product[] = (prodRes.data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug || p.id,
        description: p.description,
        fullDescription: p.full_description,
        features: p.features || [],
        specifications: p.specifications || {},
        price: parseFloat(p.price) || 0,
        categoryId: p.category_id,
        categoryName: p.category_name,
        stock: p.stock,
        lowStockThreshold: p.low_stock_threshold,
        featured: p.featured,
        enabled: p.enabled,
        sold: p.sold,
        views: p.views,
        images: imagesMap.get(p.id) || [],
        variants: (variantsMap.get(p.id) || []).map((v: any) => ({
          id: v.id,
          productId: v.product_id,
          name: v.name,
          value: v.value,
          priceAdjustion: parseFloat(v.price_adjustion) || 0,
          stock: v.stock,
        })),
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }));

      setProducts(mapped);
    } catch (err: any) {
      setError(err.message || "Error al cargar productos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProductsContext.Provider
      value={{ products, loading, error, refresh: fetchProducts }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductsContext);
}
