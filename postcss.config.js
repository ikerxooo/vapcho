import { NextRequest, NextResponse } from "next/server";
import { SITE_COOKIE, ADMIN_COOKIE } from "@/lib/config.server";

export async function POST(req: NextRequest) {
  const { scope } = await req.json().catch(() => ({ scope: "site" }));
  const res = NextResponse.json({ ok: true });

  if (scope === "admin") {
    res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  } else {
    res.cookies.set(SITE_COOKIE, "", { path: "/", maxAge: 0 });
  }

  return res;
}
