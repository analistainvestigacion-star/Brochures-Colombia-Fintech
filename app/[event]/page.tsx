import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getEvent } from "@/lib/data";
import { PackageCard } from "@/components/PackageCard";
import { Footer, Topbar } from "@/components/Topbar";

// Se regenera al instante cuando el equipo toma/libera un cupo (revalidatePath);
// esto es solo una red de seguridad.
export const revalidate = 300;

type Props = { params: Promise<{ event: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ev = await getEvent((await params).event);
  if (!ev) return {};
  const title = `${ev.title} ${ev.edition ?? ""}`.trim();
  return {
    title: `Brochure ${title}`,
    description: ev.tagline ?? undefined,
    openGraph: { title: `Brochure ${title} · Colombia Fintech`, images: ev.hero_image ? [ev.hero_image] : [] },
  };
}

export default async function EventPage({ params }: Props) {
  const { event: slug } = await params;
  const ev = await getEvent(slug);
  if (!ev) notFound();

  const { extras, combos, contacts } = ev.content;
  const totalSlots = ev.packages.reduce((n, p) => n + p.capacity, 0);
  const takenSlots = ev.packages.reduce((n, p) => n + Math.min(p.sponsorships.length, p.capacity), 0);
  const pdfHref = `/${ev.slug}/pdf`;

  return (
    <>
      <Topbar>
        <a className="link" href="#paquetes">Paquetes</a>
        {extras && <a className="link" href="#experiencias">Experiencias</a>}
        {contacts?.length ? <a className="link" href="#contacto">Contacto</a> : null}
        <a className="btn btn-mint btn-sm" href={pdfHref}>Descargar PDF</a>
      </Topbar>

      <section className="hero">
        <img className="symbol" src="/brand/simbolo-mint.png" alt="" />
        <div className="wrap">
          <div>
            <span className="mono kicker">Brochure · {ev.edition}</span>
            <h1>{ev.title}</h1>
            <p className="by">by Colombia Fintech</p>
            <div className="facts">
              {ev.venue && <span className="chip">{ev.venue}</span>}
              {ev.date_label && <span className="chip">{ev.date_label}</span>}
            </div>
            <div className="actions">
              <a className="btn btn-mint" href="#paquetes">Ver patrocinios</a>
              <a className="btn btn-ghost" href={pdfHref}>Descargar PDF</a>
            </div>
          </div>
          {ev.hero_image && (
            <div className="photo">
              <Image src={ev.hero_image} alt="" fill priority sizes="(max-width: 860px) 100vw, 480px" style={{ objectFit: "cover" }} />
            </div>
          )}
        </div>
      </section>

      {(ev.date_label || ev.tagline) && (
        <section className="std">
          <div className="wrap">
            <div>
              <span className="mono">Save the date</span>
              <div className="date">
                {ev.date_label}
                {ev.time_label && <small>{ev.time_label}</small>}
              </div>
            </div>
            {ev.tagline && <p>{ev.tagline}</p>}
          </div>
        </section>
      )}

      <section className="section" id="paquetes">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="mono kicker">Oportunidades de patrocinio</span>
              <h2>Paquetes</h2>
            </div>
            <div className="summary">
              <span className="chip">{ev.packages.length} paquetes</span>
              <span className="chip">{totalSlots - takenSlots} de {totalSlots} cupos disponibles</span>
            </div>
          </div>
          <div className="packages">
            {ev.packages.map((p, i) => (
              <PackageCard key={p.id} pkg={p} index={i} total={ev.packages.length} />
            ))}
          </div>
        </div>
      </section>

      {extras && (
        <section className="section band-navy" id="experiencias">
          <div className="wrap">
            <div className="section-head">
              <div>
                <span className="mono kicker">Adicionales</span>
                <h2>{extras.title}</h2>
              </div>
              {extras.intro && <p className="intro">{extras.intro}</p>}
            </div>
            <div className="grid-3">
              {extras.groups.map((g) => (
                <div className="panel" key={g.name}>
                  <h3 className="mono">{g.name}</h3>
                  {g.items.map((it) => (
                    <div className="extra" key={it.name}>
                      <div>
                        {it.name}
                        {it.detail && <small>{it.detail}</small>}
                      </div>
                      {it.price && <span className="price-tag">{it.price}</span>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {combos && (
        <section className="section">
          <div className="wrap">
            <div className="section-head">
              <div>
                <span className="mono kicker">Rifas</span>
                <h2>{combos.title}</h2>
              </div>
            </div>
            <div className="grid-4">
              {combos.items.map((c) => (
                <div className="combo" key={c.name}>
                  <h3>{c.name}</h3>
                  <ul>
                    {c.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {contacts?.length ? (
        <section className="section contacts" id="contacto" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="section-head">
              <div>
                <span className="mono kicker">¿Le interesa un paquete?</span>
                <h2>Contactos</h2>
              </div>
            </div>
            <div className="grid-3">
              {contacts.map((c) => (
                <div className="person" key={c.email}>
                  <span className="mono">{c.role}</span>
                  <h3>{c.name}</h3>
                  <a href={`mailto:${c.email}?subject=${encodeURIComponent(`Patrocinio ${ev.title} ${ev.edition ?? ""}`)}`}>{c.email}</a>
                  {c.phone && <span>{c.phone}</span>}
                  <div className="row">
                    <a className="btn btn-sm" href={`mailto:${c.email}`}>Escribir</a>
                    {c.phone && (
                      <a className="btn btn-sm btn-ghost" href={`https://wa.me/${c.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <Footer />
    </>
  );
}
