"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Sparkles } from "lucide-react";

export default function NewsBanner() {
  const [visible, setVisible] = useState(true);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden bg-navy text-white"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-6 py-2.5 text-sm">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span>Nueva colección disponible — descubre las últimas incorporaciones</span>
            <button
              onClick={() => setVisible(false)}
              aria-label="Cerrar aviso"
              className="ml-3 rounded-full p-1 transition hover:bg-white/10"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
