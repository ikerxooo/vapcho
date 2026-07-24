"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowRight, UserPlus, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

function AccountForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, signIn, signUp, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [inviteValid, setInviteValid] = useState<boolean | null>(null);

  useEffect(() => {
    const token = searchParams.get("invite");
    if (token) {
      setInviteToken(token);
      setMode("signup");
      // Validate invite
      fetch("/api/invite/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      }).then((r) => {
        if (r.ok) {
          setInviteValid(true);
        } else {
          setInviteValid(false);
          setError("La invitación no es válida o ha expirado.");
        }
      });
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) router.push("/account/orders");
  }, [user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "signup" && inviteToken) {
      // Validate invite before signup
      const validateRes = await fetch("/api/invite/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: inviteToken }),
      });
      if (!validateRes.ok) {
        setError("La invitación no es válida o ha expirado.");
        return;
      }
    }

    const result = mode === "login" ? await signIn(email, password) : await signUp(email, password);

    if (result.error) {
      setError(result.error);
    } else if (mode === "signup" && inviteToken) {
      // Mark invite as used
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await fetch("/api/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: inviteToken, userId: userData.user.id }),
        });
      }
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05060A] px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#16305F_0%,_#05060A_55%)]" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm rounded-xl3 border border-white/10 bg-white/[0.04] p-10 shadow-lift backdrop-blur-xl"
      >
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
            {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </h1>
          <p className="mt-2 text-sm text-white/45">
            {mode === "login"
              ? "Accede a tu cuenta de cliente"
              : inviteToken
              ? "Invitación válida — Crea tu cuenta"
              : "Solo se permite registro con invitación"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            className="w-full rounded-xl2 border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-white/30 focus:bg-white/[0.07]"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full rounded-xl2 border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-white/30 focus:bg-white/[0.07]"
            required
          />

          <button
            type="submit"
            className="group flex w-full items-center justify-center gap-2 rounded-xl2 bg-white px-4 py-3.5 text-sm font-medium text-ink transition hover:bg-white/90"
          >
            {mode === "login" ? "Entrar" : "Crear cuenta"}
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
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
            }}
            className="flex items-center justify-center gap-1.5 text-xs text-white/50 transition hover:text-white/80"
          >
            {mode === "login" ? (
              <>
                <UserPlus className="h-3.5 w-3.5" /> ¿No tienes cuenta? Regístrate
              </>
                ) : (
              <>
                <LogIn className="h-3.5 w-3.5" /> ¿Ya tienes cuenta? Inicia sesión
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-navy border-t-transparent" /></div>}>
      <AccountForm />
    </Suspense>
  );
}
