import { NextRequest, NextResponse } from "next/server";
import { SITE_PASSWORD, SITE_COOKIE } from "@/lib/config.server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (password === SITE_PASSWORD) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SITE_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 horas
    });
    return res;
  }

  return NextResponse.json({ ok: false }, { status: 401 });
}
