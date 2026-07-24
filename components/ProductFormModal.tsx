"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { Product } from "@/lib/types";

interface Props {
  initial?: Partial<Product> | null;
  onClose: () => void;
  onSave: (product: Partial<Product>) => void;
}

export default function ProductFormModal({ initial, onClose, onSave }: Props) {
  const isEditing = !!initial?.id;
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.categoryName ?? "");
  const [price, setPrice] = useState(initial?.price?.toString() ?? "");
  const [stock, setStock] = useState(initial?.stock?.toString() ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [fullDescription, setFullDescription] = useState(initial?.fullDescription ?? "");
  const [features, setFeatures] = useState(initial?.features?.join("\n") ?? "");
  const [images, setImages] = useState(initial?.images?.join("\n") ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [enabled, setEnabled] = useState(initial?.enabled ?? true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedImages = images
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    onSave({
      id: initial?.id,
      name: name.trim() || "Producto sin nombre",
      categoryName: category.trim() || "General",
      price: parseFloat(price) || 0,
      stock: parseInt(stock, 10) || 0,
      description: description.trim(),
      fullDescription: fullDescription.trim() || description.trim(),
      features: features.split("\n").map((s) => s.trim()).filter(Boolean),
      images: parsedImages,
      featured,
      enabled,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl3 bg-white p-7 shadow-2xl dark:bg-[#111113]"
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">
            {isEditing ? "Editar producto" : "Añadir producto"}
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-mist dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-graphite">Nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl2 border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-navy dark:border-white/15 dark:bg-white/5"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-graphite">Categoría</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl2 border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-navy dark:border-white/15 dark:bg-white/5"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-graphite">Precio (€)</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl2 border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-navy dark:border-white/15 dark:bg-white/5"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-graphite">Stock disponible</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full rounded-xl2 border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-navy dark:border-white/15 dark:bg-white/5"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-graphite">Descripción corta (catálogo)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-xl2 border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-navy dark:border-white/15 dark:bg-white/5"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-graphite">Descripción completa (página de producto)</label>
            <textarea
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl2 border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-navy dark:border-white/15 dark:bg-white/5"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-graphite">Características (una por línea)</label>
            <textarea
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              rows={3}
              className="w-full rounded-xl2 border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-navy dark:border-white/15 dark:bg-white/5"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-graphite">Imágenes — una URL por línea</label>
            <textarea
              value={images}
              onChange={(e) => setImages(e.target.value)}
              rows={3}
              placeholder="https://…"
              className="w-full rounded-xl2 border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-navy dark:border-white/15 dark:bg-white/5"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-line accent-[#0B1B3B]"
              />
              Producto destacado
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-line accent-[#0B1B3B]"
              />
              Producto visible (habilitado)
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl2 border border-line py-3 text-sm font-semibold transition hover:bg-mist dark:border-white/15 dark:hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl2 bg-ink py-3 text-sm font-semibold text-white transition hover:bg-navy dark:bg-white dark:text-ink"
            >
              Guardar
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
