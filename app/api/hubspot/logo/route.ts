import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/auth";
import { getCompany } from "@/lib/hubspot";

// Descarga el logo de una empresa de HubSpot (por id, nunca por URL arbitraria)
// para que el navegador lo pueda procesar sin problemas de CORS.
export async function GET(request: Request) {
  if (!(await currentAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

  const company = await getCompany(id).catch(() => null);
  if (!company?.logoUrl) return NextResponse.json({ error: "La empresa no tiene logo en HubSpot" }, { status: 404 });

  const img = await fetch(company.logoUrl, { cache: "no-store" });
  const type = img.headers.get("content-type") ?? "";
  if (!img.ok || !type.startsWith("image/")) {
    return NextResponse.json({ error: "No se pudo descargar el logo" }, { status: 502 });
  }
  return new NextResponse(await img.arrayBuffer(), {
    headers: { "Content-Type": type, "Cache-Control": "private, max-age=300" },
  });
}
