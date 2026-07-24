"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface LockScreenProps {
  endpoint: "/api/auth" | "/api/admin-auth";
  heading?: string;
  subheading?: string;
}

export default function LockScreen({
  endpoint,
  heading = "Acceso Privado",
  subheading = "Introduce la contraseña para continuar",
}: LockScreenProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password || loading) return;
    setLoading(true);
    setError(false);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        setError(true);
        setPassword("");
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05060A] px-6">
      {/* fondo degradado elegante */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#16305F_0%,_#05060A_55%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute left-1/2 top-0 h-full w-[60%] -translate-x-1/2 animate-sweep bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm rounded-xl3 border border-white/10 bg-white/[0.04] p-10 shadow-lift backdrop-blur-xl"
      >
        {/* espacio para el logo */}
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-white/25 text-[10px] uppercase tracking-wider text-white/40">
          Tu logo
        </div>

        <div className="mb-8 text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <Lock className="h-4 w-4 text-white/70" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-white">
            {heading}
          </h1>
          <p className="mt-2 text-sm text-white/45">{subheading}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div animate={error ? { x: [0, -6, 6, -4, 4, 0] } : {}} transition={{ duration: 0.4 }}>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full rounded-xl2 border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-white/30 focus:bg-white/[0.07]"
            />
          </motion.div>

          <button
            type="submit"
            disabled={loading}
            className="group flex w-full items-center justify-center gap-2 rounded-xl2 bg-white px-4 py-3.5 text-sm font-medium text-ink transition hover:bg-white/90 disabled:opacity-60"
          >
            {loading ? "Comprobando..." : "Entrar"}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </button>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-center text-sm text-red-400"
              >
                Contraseña incorrecta.
              </motion.p>
            )}
          </AnimatePresence>
        </form>
      </motion.div>
    </div>
  );
}
