"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Moon, Sun, LogOut } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useRouter } from "next/navigation";

export default function Navbar({ favoritesCount }: { favoritesCount?: number }) {
  const { theme, toggleTheme } = useTheme();
  const { count, openCart } = useCart();
  const { favorites } = useFavorites();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scope: "site" }),
    });
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/80 backdrop-blur-xl dark:border-white/10 dark:bg-ink/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="font-display text-lg font-bold tracking-tight">
          TU MARCA
        </Link>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-mist dark:hover:bg-white/10"
          >
            {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>

          <button
            aria-label="Favoritos"
            className="relative flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-mist dark:hover:bg-white/10"
          >
            <Heart className="h-[18px] w-[18px]" />
            {favorites.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-navy text-[10px] font-semibold text-white">
                {favorites.length}
              </span>
            )}
          </button>

          <button
            onClick={openCart}
            aria-label="Carrito"
            className="relative flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-mist dark:hover:bg-white/10"
          >
            <ShoppingBag className="h-[18px] w-[18px]" />
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-navy text-[10px] font-semibold text-white"
              >
                {count}
              </motion.span>
            )}
          </button>

          <button
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-full text-graphite transition hover:bg-mist dark:hover:bg-white/10"
          >
            <LogOut className="h-[17px] w-[17px]" />
          </button>
        </div>
      </div>
    </header>
  );
}
