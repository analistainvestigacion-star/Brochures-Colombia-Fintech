import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { currentAdmin } from "@/lib/auth";
import { adminClient } from "@/lib/supabase";

const MAX_LOGO_BYTES = 2 * 1024 * 1024;

// Marca un cupo como tomado: sube el logo (PNG ya normalizado en el navegador) y guarda el patrocinio.
export async function POST(request: Request) {
  const actor = await currentAdmin();
  if (!actor) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const form = await request.formData();
  const packageId = String(form.get("packageId") ?? "");
  const companyName = String(form.get("companyName") ?? "").trim();
  const hubspotId = String(form.get("hubspotId") ?? "") || null;
  const logo = form.get("logo");
  const logoBg = form.get("logoBg") === "dark" ? "dark" : "light";

  if (!packageId || !companyName) return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  if (!(logo instanceof File) || logo.type !== "image/png" || logo.size > MAX_LOGO_BYTES) {
    return NextResponse.json({ error: "El logo debe ser una imagen PNG de máximo 2 MB" }, { status: 400 });
  }

  const db = adminClient();
  const { data: pkg } = await db
    .from("packages")
    .select("id, name, capacity, event:events(id, slug, title)")
    .eq("id", packageId)
    .single();
  if (!pkg) return NextResponse.json({ error: "Paquete no encontrado" }, { status: 404 });
  const event = pkg.event as unknown as { id: string; slug: string; title: string };

  const path = `${event.slug}/${crypto.randomUUID()}.png`;
  const upload = await db.storage.from("logos").upload(path, logo, { contentType: "image/png" });
  if (upload.error) return NextResponse.json({ error: upload.error.message }, { status: 500 });
  const logoUrl = db.storage.from("logos").getPublicUrl(path).data.publicUrl;

  const { error } = await db.from("sponsorships").insert({
    package_id: packageId,
    company_name: companyName,
    hubspot_company_id: hubspotId,
    logo_url: logoUrl,
    logo_bg: logoBg,
    created_by: actor,
  });
  if (error) {
    await db.storage.from("logos").remove([path]);
    return NextResponse.json({ error: error.message }, { status: 409 });
  }

  await db.from("activity").insert({
    event_id: event.id, package_name: pkg.name, company_name: companyName, action: "tomado", actor,
  });
  revalidatePath(`/${event.slug}`);
  revalidatePath("/");

  return NextResponse.json({ ok: true });
}
