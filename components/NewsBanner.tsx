"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const DEFAULT_MESSAGES = [
  "✦ Nueva colección disponible — Explora el catálogo",
  "✦ Envío gratuito en pedidos superiores a 200€",
  "✦ Acceso privado — Solo clientes invitados",
];

export default function NewsBanner() {
  const [visible, setVisible] = useState(true);
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIndex((i) => (i + 1) % DEFAULT_MESSAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="relative overflow-hidden bg-navy text-white dark:bg-navylight"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-center px-6 py-2.5">
            <AnimatePresence mode="wait">
              <motion.p
                key={msgIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="text-xs font-medium tracking-wide"
              >
                {DEFAULT_MESSAGES[msgIndex]}
              </motion.p>
            </AnimatePresence>
            <button
              onClick={() => setVisible(false)}
              className="absolute right-4 flex h-6 w-6 items-center justify-center rounded-full transition hover:bg-white/10"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
