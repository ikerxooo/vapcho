import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("invites")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Invitación no válida" }, { status: 404 });
  }

  if (data.used) {
    return NextResponse.json({ error: "Esta invitación ya ha sido utilizada" }, { status: 400 });
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ error: "La invitación ha expirado" }, { status: 400 });
  }

  return NextResponse.json({ valid: true, invite: { id: data.id, token: data.token } });
}
