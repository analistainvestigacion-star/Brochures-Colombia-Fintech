import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/auth";
import { searchCompanies } from "@/lib/hubspot";

export async function GET(request: Request) {
  if (!(await currentAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });
  try {
    return NextResponse.json({ results: await searchCompanies(q) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
