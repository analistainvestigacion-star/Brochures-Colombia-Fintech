import Image from "next/image";
import type { Package } from "@/lib/types";
import { cop, pad2 } from "@/lib/format";

// Con más cupos que esto, no se dibujan casillas vacías: se muestra "N disponibles".
const MAX_EMPTY_SLOTS = 4;

export function PackageCard({ pkg, index, total }: { pkg: Package; index: number; total: number }) {
  const taken = pkg.sponsorships.length;
  const left = pkg.capacity - taken;
  const full = left <= 0;
  const showEmpty = pkg.capacity <= MAX_EMPTY_SLOTS;

  return (
    <article className={`pkg${full ? " taken" : ""}`} id={pkg.slug}>
      <div className="media">
        <div className="badge-row">
          <span className="pill">{pad2(index + 1)} / {pad2(total)}</span>
          <span className={`pill ${full ? "dark" : left < pkg.capacity ? "mint" : ""}`}>
            {full ? "Patrocinado" : `${taken} / ${pkg.capacity} tomados`}
          </span>
        </div>
        {pkg.images.slice(0, 2).map((src, i) => (
          <div key={src} className={src.includes(".cutout.") ? "ph contain" : "ph"}>
            <Image src={src} alt={`${pkg.name} — foto ${i + 1}`} fill sizes="(max-width: 860px) 100vw, 640px" />
          </div>
        ))}
      </div>

      <div className="content">
      <div className="body">
        <h3>{pkg.name}</h3>
        <ul>
          {pkg.benefits.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        {pkg.note && <p className="note">{pkg.note}</p>}
        <div className="prices">
          <div className="price">
            <div className="mono">Miembros</div>
            <b>{cop(pkg.price_member)}</b>
            <span>+ IVA</span>
          </div>
          <div className="price">
            <div className="mono">No miembros</div>
            <b>{cop(pkg.price_non_member)}</b>
            <span>+ IVA</span>
          </div>
        </div>
      </div>

      <div className="sponsors">
        <span className="label mono">
          {taken ? "Patrocinado por:" : pkg.capacity > 1 ? `${pkg.capacity} cupos disponibles` : "Disponible"}
        </span>
        <div className="slots">
          {pkg.sponsorships.map((s) => (
            <div className="slot" key={s.id} title={s.company_name}>
              <img src={s.logo_url} alt={s.company_name} loading="lazy" />
            </div>
          ))}
          {!full && showEmpty &&
            Array.from({ length: left }, (_, i) => (
              <div className="slot empty" key={`e${i}`}>
                Disponible
              </div>
            ))}
          {!full && !showEmpty && taken > 0 && (
            <span className="more">
              + {left} {left === 1 ? "cupo disponible" : "cupos disponibles"}
            </span>
          )}
          {!full && !showEmpty && taken === 0 && <div className="slot empty">Tu marca aquí</div>}
        </div>
      </div>
      </div>
    </article>
  );
}
