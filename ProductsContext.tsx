# Tienda Privada

Catálogo de productos privado, protegido con contraseña, construido con
Next.js 14 (App Router), TypeScript, Tailwind CSS y Framer Motion.

## Puesta en marcha local

```bash
npm install
npm run dev
```

Abre http://localhost:3000 — verás la pantalla de acceso privado.

- Contraseña del catálogo (por defecto): `MiMarca2024`
- Contraseña del panel admin (por defecto): `AdminMiMarca2024`

## Cambiar las contraseñas

Edita **una sola vez** el archivo `lib/config.server.ts`:

```ts
export const SITE_PASSWORD = process.env.SITE_PASSWORD || "MiMarca2024";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "AdminMiMarca2024";
```

También puedes definir `SITE_PASSWORD` y `ADMIN_PASSWORD` como variables de
entorno en Vercel/Netlify (recomendado) sin tocar el código — así la
contraseña no queda escrita en el repositorio.

Este archivo **solo se usa en el servidor** (rutas `app/api/*` y páginas de
servidor), nunca se envía al navegador, así que la contraseña no aparece en
el código fuente que puede inspeccionar un visitante.

## Añadir tu logo

En `components/LockScreen.tsx` busca el bloque:

```tsx
<div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-white/25 text-[10px] uppercase tracking-wider text-white/40">
  Tu logo
</div>
```

Sustitúyelo por tu imagen, por ejemplo:

```tsx
<img src="/logo.png" alt="Tu marca" className="mx-auto mb-8 h-16 w-16 object-contain" />
```

y coloca el archivo `logo.png` dentro de la carpeta `public/`.

## Panel de administración

Accesible en `/admin`, con su propia contraseña independiente. Desde ahí
puedes añadir, editar y eliminar productos, cambiar precio, stock,
categoría, imágenes y marcar productos como destacados. Los cambios se
guardan automáticamente.

## Cómo se guardan los productos (importante)

Para mantener el proyecto simple y sin depender de servicios externos, el
catálogo se guarda en el **almacenamiento local del navegador**
(`localStorage`). Esto significa:

- Los cambios que hagas desde `/admin` se guardan automáticamente y
  seguirán ahí la próxima vez que abras la web **desde el mismo navegador**.
- Si accedes desde otro ordenador o navegador, o borras los datos de
  navegación, verás de nuevo el catálogo de ejemplo inicial.
- No es un catálogo "compartido" entre todos los visitantes.

Si más adelante quieres que el catálogo sea el mismo para todos los
visitantes y se gestione desde un único panel, el siguiente paso natural es
conectar una base de datos (por ejemplo Supabase, Vercel Postgres o
Firebase) en lugar de `localStorage`. Puedo ayudarte a hacer ese cambio
cuando quieras.

## Seguridad — qué cubre esto y qué no

- Las contraseñas se validan **en el servidor**, no en el navegador, así
  que no están visibles en el código fuente ni en las herramientas de
  desarrollador.
- El acceso se controla con una cookie de sesión (`httpOnly`), tanto para
  el catálogo como para `/admin`.
- Se ha añadido `robots.txt` y metadatos `noindex` para que buscadores no
  indexen el sitio.
- Aun así, esto es una protección "ligera" pensada para compartir un
  catálogo con clientes o contactos de confianza, no un sistema de
  autenticación de nivel bancario. No subas aquí datos muy sensibles
  (pagos reales, documentos personales, etc.) sin añadir medidas
  adicionales.

## Desplegar en Vercel o Netlify

1. Sube este proyecto a un repositorio (GitHub, GitLab...).
2. Impórtalo en [Vercel](https://vercel.com/new) o
   [Netlify](https://app.netlify.com/start).
3. Define las variables de entorno `SITE_PASSWORD` y `ADMIN_PASSWORD` en la
   configuración del proyecto (opcional pero recomendado).
4. Despliega — Next.js funciona de forma nativa en ambas plataformas.

## Estructura del proyecto

```
app/
  page.tsx              → pantalla de bloqueo o catálogo
  product/[id]/page.tsx → página de producto
  admin/page.tsx        → panel de administración
  api/auth               → valida contraseña del catálogo
  api/admin-auth          → valida contraseña del admin
  api/logout              → cierra sesión
components/              → UI (Navbar, Catalog, ProductCard, Admin...)
context/                  → estado global (productos, carrito, favoritos, tema)
lib/                      → configuración, tipos y datos de ejemplo
```

## Tecnologías

React · Next.js 14 · TypeScript · Tailwind CSS · Framer Motion · lucide-react
