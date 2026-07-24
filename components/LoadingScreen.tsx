"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-paper dark:bg-ink"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-navy border-t-transparent" />
            <span className="font-display text-sm font-medium tracking-wide text-graphite">
              Cargando catálogo…
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
