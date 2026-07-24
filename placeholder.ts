import { NextRequest, NextResponse } from "next/server";
import { ADMIN_PASSWORD, ADMIN_COOKIE } from "@/lib/config.server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (password === ADMIN_PASSWORD) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 4, // 4 horas
    });
    return res;
  }

  return NextResponse.json({ ok: false }, { status: 401 });
}
