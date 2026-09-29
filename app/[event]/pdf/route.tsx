import { Document, Image, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { getEvent } from "@/lib/data";
import { cop } from "@/lib/format";
import type { BrochureEvent, Package } from "@/lib/types";

export const dynamic = "force-dynamic";

const C = { navy: "#2b3241", mint: "#add5c2", mint2: "#9dc4ac", stone: "#dbd6d7", olive: "#888d71", paper: "#f5f4f2", muted: "#6b7080", gray: "#9a9ea8" };

const s = StyleSheet.create({
  page: { backgroundColor: "#ffffff", color: C.navy, fontFamily: "Helvetica", fontSize: 10, padding: 36 },
  cover: { backgroundColor: C.navy, color: "#ffffff", padding: 48, justifyContent: "space-between" },
  kicker: { fontFamily: "Courier", fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: C.olive },
  h1: { fontSize: 54, marginTop: 12, lineHeight: 1 },
  h2: { fontSize: 30, marginBottom: 10 },
  row: { flexDirection: "row" },
  pkg: { borderRadius: 10, borderWidth: 1, borderColor: "#e3e0de", padding: 18, marginBottom: 12 },
  photo: { width: 380, height: 300, objectFit: "cover", borderRadius: 6, marginRight: 14 },
  li: { flexDirection: "row", marginBottom: 5 },
  dot: { width: 5, height: 5, backgroundColor: C.mint2, marginTop: 3, marginRight: 6 },
  price: { backgroundColor: C.paper, borderRadius: 6, padding: 8, marginRight: 8, width: 150 },
  logoBox: { width: 96, height: 44, borderWidth: 1, borderColor: "#e3e0de", borderRadius: 6, padding: 5, marginRight: 8, marginTop: 6, justifyContent: "center", alignItems: "center" },
  logo: { maxWidth: 84, maxHeight: 34, objectFit: "contain" },
  small: { fontSize: 8, color: C.muted },
});

type Img = { data: Buffer; format: "png" | "jpg" };

/** Descarga imágenes una sola vez; las fotos pasan por el optimizador de Next para no inflar el PDF. */
async function fetchImage(url: string, origin: string, width?: number): Promise<Img | null> {
  try {
    const abs = url.startsWith("http") ? url : origin + url;
    const target = width && !url.startsWith("http") ? `${origin}/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=70` : abs;
    const res = await fetch(target, { headers: { Accept: "image/jpeg,image/png" } });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "";
    const format = type.includes("png") ? "png" : type.includes("jpeg") || type.includes("jpg") ? "jpg" : null;
    if (!format) return null;
    return { data: Buffer.from(await res.arrayBuffer()), format };
  } catch {
    return null;
  }
}

function PackageBlock({ pkg, photo, logos }: { pkg: Package; photo: Img | null; logos: Map<string, Img | null> }) {
  const taken = pkg.sponsorships.length;
  const full = taken >= pkg.capacity;
  const tone = full ? { color: C.gray } : {};
  return (
    <View style={[s.pkg, full ? { backgroundColor: "#f0efed" } : {}]} wrap={false}>
      <View style={s.row}>
        {photo && <Image src={photo} style={[s.photo, full ? { opacity: 0.45 } : {}]} />}
        <View style={{ flex: 1 }}>
          <View style={[s.row, { justifyContent: "flex-end" }]}>
            <Text style={[s.kicker, { color: full ? C.navy : C.olive }]}>
              {full ? "Patrocinado" : `${taken} / ${pkg.capacity} tomados`}
            </Text>
          </View>
          <Text style={[s.h2, tone]}>{pkg.name}</Text>
          {pkg.benefits.map((b) => (
            <View style={s.li} key={b}>
              <View style={[s.dot, full ? { backgroundColor: C.stone } : {}]} />
              <Text style={[{ flex: 1 }, tone]}>{b}</Text>
            </View>
          ))}
          {pkg.note && <Text style={[s.small, { marginTop: 3 }]}>{pkg.note}</Text>}
        </View>
      </View>
      <View style={[s.row, { marginTop: 10, alignItems: "flex-end", flexWrap: "wrap" }]}>
        <View style={s.price}>
          <Text style={s.small}>MIEMBROS</Text>
          <Text style={[{ fontSize: 12 }, tone]}>{cop(pkg.price_member)} + IVA</Text>
        </View>
        <View style={s.price}>
          <Text style={s.small}>NO MIEMBROS</Text>
          <Text style={[{ fontSize: 12 }, tone]}>{cop(pkg.price_non_member)} + IVA</Text>
        </View>
      </View>
      <View style={{ marginTop: 10 }}>
        <Text style={[s.kicker, { color: taken ? C.navy : C.muted }]}>
          {taken ? "Patrocinado por:" : pkg.capacity > 1 ? `${pkg.capacity} cupos disponibles` : "Disponible"}
        </Text>
        <View style={[s.row, { flexWrap: "wrap", alignItems: "center" }]}>
          {pkg.sponsorships.map((sp) => {
            const img = logos.get(sp.id);
            return (
              <View style={[s.logoBox, { backgroundColor: sp.logo_bg === "dark" ? C.navy : "#ffffff" }]} key={sp.id}>
                {img ? <Image src={img} style={s.logo} /> : <Text style={{ fontSize: 8 }}>{sp.company_name}</Text>}
              </View>
            );
          })}
          {taken > 0 && !full && (
            <Text style={[s.small, { marginTop: 6 }]}>
              + {pkg.capacity - taken} {pkg.capacity - taken === 1 ? "cupo disponible" : "cupos disponibles"}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

function Brochure({ ev, photos, logos, logoCF }: { ev: BrochureEvent; photos: (Img | null)[]; logos: Map<string, Img | null>; logoCF: Img | null }) {
  const { extras, combos, contacts } = ev.content;
  const stamp = new Date().toLocaleDateString("es-CO", { timeZone: "America/Bogota", dateStyle: "long" });
  return (
    <Document title={`Brochure ${ev.title} ${ev.edition ?? ""}`} author="Colombia Fintech">
      <Page size="A4" orientation="landscape" style={[s.page, s.cover]}>
        <View>
          {logoCF && <Image src={logoCF} style={{ width: 160 }} />}
        </View>
        <View>
          <Text style={[s.kicker, { color: C.mint }]}>Brochure · {ev.edition}</Text>
          <Text style={s.h1}>{ev.title}</Text>
          <Text style={{ fontSize: 16, marginTop: 8, opacity: 0.8 }}>by Colombia Fintech</Text>
          <Text style={{ fontSize: 13, marginTop: 28 }}>{ev.venue}</Text>
          <Text style={{ fontSize: 13, marginTop: 4 }}>{ev.date_label} · {ev.time_label}</Text>
          {ev.tagline && <Text style={{ fontSize: 12, marginTop: 20, maxWidth: 340, opacity: 0.8 }}>{ev.tagline}</Text>}
        </View>
        <Text style={[s.kicker, { color: C.mint }]}>Disponibilidad actualizada al {stamp}</Text>
      </Page>

      {/* Un paquete por página, para que no se lean como combo */}
      {ev.packages.map((p, i) => (
        <Page key={p.id} size="A4" orientation="landscape" style={s.page}>
          <Text style={[s.kicker, { marginBottom: 10 }]}>Oportunidades de patrocinio</Text>
          <PackageBlock pkg={p} photo={photos[i]} logos={logos} />
        </Page>
      ))}

      {(extras || combos || contacts) && (
        <Page size="A4" orientation="landscape" style={s.page}>
          {extras && (
            <View style={{ marginBottom: 20 }}>
              <Text style={s.kicker}>Adicionales</Text>
              <Text style={[s.h2, { fontSize: 24 }]}>{extras.title}</Text>
              {extras.intro && <Text style={[s.small, { marginBottom: 8 }]}>{extras.intro}</Text>}
              {extras.groups.map((g) => (
                <View key={g.name} style={{ marginBottom: 8 }}>
                  <Text style={[s.kicker, { color: C.navy, marginBottom: 4 }]}>{g.name}</Text>
                  {g.items.map((it) => (
                    <View key={it.name} style={[s.row, { justifyContent: "space-between", borderTopWidth: 1, borderColor: "#eee", paddingVertical: 4 }]}>
                      <Text>{it.name}{it.detail ? `  ·  ${it.detail}` : ""}</Text>
                      <Text style={{ fontFamily: "Courier" }}>{it.price}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}
          {combos && (
            <View style={{ marginBottom: 20 }} wrap={false}>
              <Text style={s.kicker}>Rifas</Text>
              <Text style={[s.h2, { fontSize: 24 }]}>{combos.title}</Text>
              <View style={[s.row, { flexWrap: "wrap" }]}>
                {combos.items.map((c) => (
                  <View key={c.name} style={[s.pkg, { width: "48%", marginRight: "2%" }]}>
                    <Text style={{ fontSize: 13, marginBottom: 4 }}>{c.name}</Text>
                    {c.items.map((it) => <Text key={it} style={{ marginBottom: 2 }}>· {it}</Text>)}
                  </View>
                ))}
              </View>
            </View>
          )}
          {contacts && (
            <View wrap={false}>
              <Text style={s.kicker}>Contacto</Text>
              <View style={[s.row, { marginTop: 6 }]}>
                {contacts.map((c) => (
                  <View key={c.email} style={{ flex: 1, marginRight: 10 }}>
                    <Text style={{ fontSize: 12 }}>{c.name}</Text>
                    <Text style={s.small}>{c.role}</Text>
                    <Text style={{ fontSize: 9, marginTop: 3 }}>{c.email}</Text>
                    <Text style={{ fontSize: 9 }}>{c.phone}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Page>
      )}
    </Document>
  );
}

export async function GET(request: Request, ctx: { params: Promise<{ event: string }> }) {
  try {
    return await buildPdf(request, ctx);
  } catch (e) {
    console.error("Error generando el PDF", e);
    return new Response(`No se pudo generar el PDF: ${(e as Error).message}`, { status: 500 });
  }
}

async function buildPdf(request: Request, { params }: { params: Promise<{ event: string }> }) {
  const { event: slug } = await params;
  const ev = await getEvent(slug);
  if (!ev) return new Response("No encontrado", { status: 404 });
  const origin = new URL(request.url).origin;

  const sponsorships = ev.packages.flatMap((p) => p.sponsorships);
  const [photos, logoList, logoCF] = await Promise.all([
    Promise.all(ev.packages.map((p) => (p.images[0] ? fetchImage(p.images[0], origin, 828) : null))),
    Promise.all(sponsorships.map((sp) => fetchImage(sp.logo_url, origin))),
    fetchImage("/brand/logo-cf-claro.png", origin),
  ]);
  const logos = new Map(sponsorships.map((sp, i) => [sp.id, logoList[i]]));

  const pdf = await renderToBuffer(<Brochure ev={ev} photos={photos} logos={logos} logoCF={logoCF} />);
  const filename = `Brochure ${ev.title} ${ev.edition ?? ""} - Colombia Fintech.pdf`.replace(/\s+/g, " ");
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="brochure-${ev.slug}.pdf"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "no-store",
    },
  });
}
