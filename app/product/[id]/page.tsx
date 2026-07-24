import { cookies } from "next/headers";
import { SITE_COOKIE } from "@/lib/config.server";
import LockScreen from "@/components/LockScreen";
import ProductDetail from "@/components/ProductDetail";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function ProductPage({ params }: { params: { id: string } }) {
  const authed = cookies().get(SITE_COOKIE)?.value === "1";

  if (!authed) {
    return (
      <LockScreen
        endpoint="/api/auth"
        heading="Acceso Privado"
        subheading="Introduce la contraseña para ver el catálogo"
      />
    );
  }

  return <ProductDetail id={params.id} />;
}
