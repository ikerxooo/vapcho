import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "@/lib/config.server";
import LockScreen from "@/components/LockScreen";
import AdminDashboard from "@/components/AdminDashboard";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  const authed = cookies().get(ADMIN_COOKIE)?.value === "1";

  if (!authed) {
    return (
      <LockScreen
        endpoint="/api/admin-auth"
        heading="Panel de Administración"
        subheading="Acceso restringido — introduce la contraseña"
      />
    );
  }

  return <AdminDashboard />;
}
