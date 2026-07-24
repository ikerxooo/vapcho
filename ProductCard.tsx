import React from "react";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line/70 dark:border-white/10">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <div className="font-display text-lg font-bold tracking-tight">TU MARCA</div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-graphite">
              Diseño atemporal y calidad duradera. Catálogo privado para clientes seleccionados.
            </p>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-graphite">
              Catálogo
            </div>
            <ul className="mt-4 space-y-2.5 text-sm text-graphite">
              <li>Novedades</li>
              <li>Destacados</li>
              <li>Categorías</li>
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-graphite">
              Contacto
            </div>
            <ul className="mt-4 space-y-2.5 text-sm text-graphite">
              <li>hola@tumarca.com</li>
              <li>Acceso privado por invitación</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line/70 pt-6 text-xs text-graphite dark:border-white/10 sm:flex-row">
          <span>© {new Date().getFullYear()} Tu Marca. Todos los derechos reservados.</span>
          <span>Acceso restringido — catálogo no público</span>
        </div>
      </div>
    </footer>
  );
}
