import { NextResponse } from "next/server";
import { isAllowed } from "@/lib/auth";
import { sessionClient } from "@/lib/supabase";

// Envía el enlace de acceso solo a correos del equipo CF.
export async function POST(request: Request) {
  const { email } = (await request.json()) as { email?: string };
  if (!isAllowed(email)) {
    return NextResponse.json({ error: "Este correo no tiene acceso al panel." }, { status: 403 });
  }
  const origin = new URL(request.url).origin;
  const supabase = await sessionClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: email!.trim().toLowerCase(),
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
