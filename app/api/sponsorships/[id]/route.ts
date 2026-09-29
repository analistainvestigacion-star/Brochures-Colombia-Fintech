import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { currentAdmin } from "@/lib/auth";
import { adminClient } from "@/lib/supabase";

// Libera un cupo.
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await currentAdmin();
  if (!actor) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;

  const db = adminClient();
  const { data: s } = await db
    .from("sponsorships")
    .select("id, company_name, logo_url, package:packages(id, name, capacity, event:events(id, slug, title))")
    .eq("id", id)
    .single();
  if (!s) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  const pkg = s.package as unknown as {
    id: string; name: string; capacity: number; event: { id: string; slug: string; title: string };
  };

  const { error } = await db.from("sponsorships").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Borra el archivo del logo si vive en nuestro bucket
  const marker = "/storage/v1/object/public/logos/";
  if (s.logo_url.includes(marker)) {
    await db.storage.from("logos").remove([s.logo_url.split(marker)[1]]);
  }

  await db.from("activity").insert({
    event_id: pkg.event.id, package_name: pkg.name, company_name: s.company_name, action: "liberado", actor,
  });
  revalidatePath(`/${pkg.event.slug}`);
  revalidatePath("/");

  return NextResponse.json({ ok: true });
}
