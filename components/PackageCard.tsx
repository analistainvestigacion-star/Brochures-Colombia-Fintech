import Image from "next/image";
import type { Package } from "@/lib/types";
import { cop } from "@/lib/format";

// Con más cupos que esto, no se dibujan casillas vacías: se muestra "N disponibles".
const MAX_EMPTY_SLOTS = 4;

const isCutout = (src: string) => src.includes(".cutout.");

/** Fotos del paquete. */
function Media({ pkg }: { pkg: Package }) {
  const images = pkg.images.slice(0, 2);

  // Productos recortados (fondo transparente, p. ej. termos): juntos en un solo panel, sin agrandarlos de más.
  if (images.length && images.every(isCutout)) {
    return (
      <div className="products">
        {images.map((src, i) => (
          <img key={src} src={src} alt={`${pkg.name} — producto ${i + 1}`} />
        ))}
      </div>
    );
  }

  return (
    <>
      {images.map((src, i) => (
        <div key={src} className="ph">
          <Image src={src} alt={`${pkg.name} — foto ${i + 1}`} fill sizes="(max-width: 860px) 100vw, 640px" />
        </div>
      ))}
    </>
  );
}

export function PackageCard({ pkg }: { pkg: Package }) {
  const taken = pkg.sponsorships.length;
  const left = pkg.capacity - taken;
  const full = left <= 0;
  const showEmpty = pkg.capacity <= MAX_EMPTY_SLOTS;

  return (
    <article className={`pkg${full ? " taken" : ""}`} id={pkg.slug}>
      <div className="media">
        <div className="badge-row">
          <span className={`pill ${taken ? "green" : ""}`}>
            {full ? "✓ Patrocinado" : taken ? `${taken} / ${pkg.capacity} tomados` : "Disponible"}
          </span>
        </div>
        <Media pkg={pkg} />
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
              <div className={`slot${s.logo_bg === "dark" ? " dark" : ""}`} key={s.id} title={s.company_name}>
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
