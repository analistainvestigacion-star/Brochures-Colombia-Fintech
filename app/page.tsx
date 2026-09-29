import Image from "next/image";
import Link from "next/link";
import { listEvents } from "@/lib/data";
import { Footer, Topbar } from "@/components/Topbar";

export const revalidate = 300;

export default async function Home() {
  const events = await listEvents();

  return (
    <>
      <Topbar />
      <main className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="mono kicker">Colombia Fintech</span>
              <h2>Brochures de patrocinio</h2>
            </div>
          </div>
          <div className="events-list">
            {events.map((ev) => {
              const total = ev.packages.reduce((n, p) => n + p.capacity, 0);
              const taken = ev.packages.reduce((n, p) => n + Math.min(p.sponsorships.length, p.capacity), 0);
              return (
                <Link key={ev.id} href={`/${ev.slug}`} className="event-card">
                  <div className="ph">
                    {ev.hero_image && <Image src={ev.hero_image} alt="" fill sizes="400px" />}
                  </div>
                  <div className="txt">
                    <span className="mono" style={{ color: "var(--olive)" }}>{ev.date_label}</span>
                    <h3>{ev.title} {ev.edition}</h3>
                    <span style={{ fontSize: 14, color: "var(--muted)" }}>
                      {total - taken} de {total} cupos disponibles
                    </span>
                    <div className="bar"><i style={{ width: `${total ? (taken / total) * 100 : 0}%` }} /></div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
