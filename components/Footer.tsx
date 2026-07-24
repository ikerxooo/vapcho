import React from "react";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line/70 dark:border-white/10">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="font-display text-lg font-bold tracking-tight">TU MARCA</div>
          <p className="text-xs text-graphite">
            Catálogo privado · Acceso restringido · © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
