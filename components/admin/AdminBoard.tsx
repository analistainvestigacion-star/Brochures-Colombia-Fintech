"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Package, Sponsorship } from "@/lib/types";
import { cop } from "@/lib/format";
import { TakeModal } from "./TakeModal";

export function AdminBoard({ packages }: { packages: Package[] }) {
  const router = useRouter();
  const [taking, setTaking] = useState<Package | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function release(pkg: Package, s: Sponsorship) {
    if (!confirm(`¿Liberar el cupo de ${s.company_name} en ${pkg.name}? El logo se quitará del brochure.`)) return;
    setBusy(s.id);
    const res = await fetch(`/api/sponsorships/${s.id}`, { method: "DELETE" });
    setBusy(null);
    if (!res.ok) alert((await res.json()).error ?? "No se pudo liberar");
    router.refresh();
  }

  return (
    <section className="card">
      {packages.map((pkg) => {
        const taken = pkg.sponsorships.length;
        const full = taken >= pkg.capacity;
        return (
          <div className="admin-row" key={pkg.id}>
            <div>
              <h3>{pkg.name}</h3>
              <div className="meta">
                <span className="mono">{taken} / {pkg.capacity} tomados</span>
                {" · "}Miembros {cop(pkg.price_member)} · No miembros {cop(pkg.price_non_member)}
              </div>
              {taken > 0 && (
                <div className="admin-sponsors">
                  {pkg.sponsorships.map((s) => (
                    <div className="admin-sponsor" key={s.id}>
                      <img src={s.logo_url} alt="" />
                      <span>{s.company_name}</span>
                      <button className="btn btn-sm btn-danger" disabled={busy === s.id} onClick={() => release(pkg, s)}>
                        {busy === s.id ? "…" : "Liberar"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {full ? (
              <span className="pill dark">Completo</span>
            ) : (
              <button className="btn btn-sm" onClick={() => setTaking(pkg)}>Marcar como tomado</button>
            )}
          </div>
        );
      })}

      {taking && (
        <TakeModal
          pkg={taking}
          onClose={() => setTaking(null)}
          onDone={() => {
            setTaking(null);
            router.refresh();
          }}
        />
      )}
    </section>
  );
}
