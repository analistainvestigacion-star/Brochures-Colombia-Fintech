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
  if (error) {
    const msg = /rate limit/i.test(error.message)
      ? "Se alcanzó el límite de correos de acceso por hora. Espera un rato e inténtalo de nuevo, o usa el último enlace que te llegó."
      : error.message;
    return NextResponse.json({ error: msg }, { status: 429 });
  }
  return NextResponse.json({ ok: true });
}
