import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { token, userId } = await req.json();
  const supabase = createServerClient();

  const { error } = await supabase
    .from("invites")
    .update({ used: true, used_by: userId })
    .eq("token", token)
    .eq("used", false);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
