import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentAdmin } from "@/lib/auth";
import { getActivity, getEvent } from "@/lib/data";
import { Topbar } from "@/components/Topbar";
import { AdminBoard } from "@/components/admin/AdminBoard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Administración", robots: { index: false } };

export default async function AdminEvent({ params }: { params: Promise<{ event: string }> }) {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin");
  const { event: slug } = await params;
  const ev = await getEvent(slug, { includeDrafts: true });
  if (!ev) notFound();
  const activity = await getActivity(ev.id);

  return (
    <>
      <Topbar>
        <Link className="link" href="/admin">Eventos</Link>
        <a className="btn btn-sm btn-mint" href={`/${ev.slug}`} target="_blank">Ver brochure</a>
      </Topbar>
      <main className="wrap admin">
        <span className="mono" style={{ color: "var(--olive)" }}>Panel interno · /{ev.slug}</span>
        <h1>{ev.title} {ev.edition}</h1>
        <div className="admin-grid">
          <AdminBoard packages={ev.packages} />
          <aside className="card log">
            <span className="mono" style={{ color: "var(--olive)" }}>Historial</span>
            <ul style={{ marginTop: 10 }}>
              {activity.length === 0 && <li>Sin movimientos todavía.</li>}
              {activity.map((a) => (
                <li key={a.id}>
                  <b>{a.company_name}</b> {a.action === "tomado" ? "tomó" : "liberó"} {a.package_name}
                  <time>
                    {new Date(a.at).toLocaleString("es-CO", { timeZone: "America/Bogota", dateStyle: "medium", timeStyle: "short" })}
                    {" · "}{a.actor}
                  </time>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </main>
    </>
  );
}
