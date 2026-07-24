import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "@/lib/config.server";
import { createServerClient } from "@/lib/supabase";

function checkAdmin() {
  return cookies().get(ADMIN_COOKIE)?.value === "1";
}

function generateToken() {
  return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
}

export async function GET() {
  if (!checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServerClient();
  const { data, error } = await supabase.from("invites").select("*").order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const invites = (data || []).map((i: any) => ({
    id: i.id,
    token: i.token,
    email: i.email,
    used: i.used,
    expiresAt: i.expires_at,
    createdAt: i.created_at,
  }));

  return NextResponse.json({ invites });
}

export async function POST() {
  if (!checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServerClient();
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase.from("invites").insert({
    token,
    expires_at: expiresAt,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ invite: data });
}
