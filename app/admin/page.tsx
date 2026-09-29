import Link from "next/link";
import { currentAdmin } from "@/lib/auth";
import { listEvents } from "@/lib/data";
import { Topbar } from "@/components/Topbar";
import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Administración", robots: { index: false } };

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const admin = await currentAdmin();
  const { error } = await searchParams;

  if (!admin) {
    return (
      <>
        <Topbar />
        <main className="wrap">
          {!process.env.NEXT_PUBLIC_SUPABASE_URL && (
            <div className="msg err" style={{ maxWidth: 420, margin: "32px auto 0" }}>
              Modo demostración: falta configurar Supabase en .env.local para usar el panel.
            </div>
          )}
          <LoginForm linkError={error === "enlace"} />
        </main>
      </>
    );
  }

  const events = await listEvents({ includeDrafts: true });
  return (
    <>
      <Topbar>
        <span style={{ fontSize: 14, opacity: 0.8 }}>{admin}</span>
        <form action="/api/auth/logout" method="post">
          <button className="btn btn-sm btn-ghost">Salir</button>
        </form>
      </Topbar>
      <main className="wrap admin">
        <span className="mono" style={{ color: "var(--olive)" }}>Panel interno</span>
        <h1>Eventos</h1>
        <div className="events-list">
          {events.map((ev) => {
            const total = ev.packages.reduce((n, p) => n + p.capacity, 0);
            const taken = ev.packages.reduce((n, p) => n + Math.min(p.sponsorships.length, p.capacity), 0);
            return (
              <Link key={ev.id} href={`/admin/${ev.slug}`} className="event-card">
                <div className="txt">
                  <span className="mono" style={{ color: "var(--olive)" }}>/{ev.slug}{ev.published ? "" : " · borrador"}</span>
                  <h3>{ev.title} {ev.edition}</h3>
                  <span style={{ fontSize: 14, color: "var(--muted)" }}>{taken} de {total} cupos tomados</span>
                  <div className="bar"><i style={{ width: `${total ? (taken / total) * 100 : 0}%` }} /></div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}
