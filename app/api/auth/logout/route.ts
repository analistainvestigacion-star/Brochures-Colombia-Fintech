import { NextResponse } from "next/server";
import { sessionClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const supabase = await sessionClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
}
