import { NextRequest, NextResponse } from "next/server";
import { SITE_COOKIE, ADMIN_COOKIE } from "@/lib/config.server";

export async function POST(req: NextRequest) {
  const { scope } = await req.json().catch(() => ({ scope: "site" }));
  const cookieName = scope === "admin" ? ADMIN_COOKIE : SITE_COOKIE;

  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
