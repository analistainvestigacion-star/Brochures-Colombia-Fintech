import { NextResponse } from "next/server";
import { sessionClient } from "@/lib/supabase";

// Destino del enlace mágico: canjea el código por una sesión.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (code) {
    const supabase = await sessionClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/admin", url.origin));
  }
  return NextResponse.redirect(new URL("/admin?error=enlace", url.origin));
}
