"use client";

import { useEffect, useRef, useState } from "react";
import type { Package } from "@/lib/types";
import { normalizeLogo } from "./logo";

type Company = { id: string; name: string; domain: string | null; logoUrl: string | null };

export function TakeModal({ pkg, onClose, onDone }: { pkg: Package; onClose: () => void; onDone: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Company[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [company, setCompany] = useState<Company | null>(null);
  const [name, setName] = useState("");
  const [logo, setLogo] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [logoBg, setLogoBg] = useState<"light" | "dark">("light");
  const [logoState, setLogoState] = useState<"none" | "loading" | "missing">("none");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Búsqueda en HubSpot con pequeña espera mientras se escribe
  useEffect(() => {
    if (company || query.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      setSearchError(null);
      const res = await fetch(`/api/hubspot/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setSearching(false);
      if (!res.ok) setSearchError(data.error ?? "No se pudo buscar en HubSpot");
      else setResults(data.results);
    }, 300);
    return () => clearTimeout(t);
  }, [query, company]);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  async function applyBlob(blob: Blob) {
    const { png, light } = await normalizeLogo(blob);
    setLogo(png);
    setLogoBg(light ? "dark" : "light");
    setPreview(URL.createObjectURL(png));
  }

  async function pick(c: Company) {
    setCompany(c);
    setName(c.name);
    setResults([]);
    setLogo(null);
    setPreview(null);
    if (!c.logoUrl) {
      setLogoState("missing");
      return;
    }
    setLogoState("loading");
    const res = await fetch(`/api/hubspot/logo?id=${encodeURIComponent(c.id)}`);
    if (!res.ok) {
      setLogoState("missing");
      return;
    }
    try {
      await applyBlob(await res.blob());
      setLogoState("none");
    } catch {
      setLogoState("missing");
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      await applyBlob(f);
      setLogoState("none");
      if (!name) setName(f.name.replace(/\.[^.]+$/, ""));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function reset() {
    setCompany(null);
    setName("");
    setLogo(null);
    setPreview(null);
    setLogoState("none");
  }

  async function save() {
    if (!logo || !name.trim()) return;
    setSaving(true);
    setError(null);
    const body = new FormData();
    body.set("packageId", pkg.id);
    body.set("companyName", name.trim());
    if (company) body.set("hubspotId", company.id);
    body.set("logoBg", logoBg);
    body.set("logo", new File([logo], "logo.png", { type: "image/png" }));
    const res = await fetch("/api/sponsorships", { method: "POST", body });
    setSaving(false);
    if (!res.ok) {
      setError((await res.json()).error ?? "No se pudo guardar");
      return;
    }
    onDone();
  }

  const manualMode = !company && name !== "";

  return (
    <div className="backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="take-title">
        <div>
          <span className="mono" style={{ color: "var(--olive)" }}>
            {pkg.name} · {pkg.sponsorships.length + 1} de {pkg.capacity}
          </span>
          <h2 id="take-title">Marcar como tomado</h2>
        </div>

        {!company && !manualMode && (
          <div className="field">
            <label htmlFor="q">Buscar empresa en HubSpot</label>
            <input
              id="q" className="input" autoFocus placeholder="Ej. Lulo Bank"
              value={query} onChange={(e) => setQuery(e.target.value)}
            />
            {searching && <p className="hint">Buscando…</p>}
            {searchError && <div className="msg err">{searchError}</div>}
            {results.length > 0 && (
              <div className="results">
                {results.map((c) => (
                  <button key={c.id} className="result" onClick={() => pick(c)}>
                    {c.logoUrl ? <img src={c.logoUrl} alt="" /> : <span className="noimg" />}
                    <span>
                      {c.name}
                      <small>{c.domain ?? "sin dominio"}{c.logoUrl ? "" : " · sin logo en HubSpot"}</small>
                    </span>
                  </button>
                ))}
              </div>
            )}
            {query.trim().length >= 2 && !searching && !searchError && results.length === 0 && (
              <p className="hint">No aparece en HubSpot.</p>
            )}
            <p className="hint">
              ¿No está en HubSpot?{" "}
              <a href="#" onClick={(e) => { e.preventDefault(); setName(query || " "); }}>Escribir el nombre y subir el logo</a>
            </p>
          </div>
        )}

        {(company || manualMode) && (
          <>
            <div className="field">
              <label htmlFor="name">Nombre que se muestra</label>
              <input id="name" className="input" value={name.trimStart()} onChange={(e) => setName(e.target.value)} />
            </div>

            {logoState === "loading" && <p className="hint">Trayendo el logo desde HubSpot…</p>}
            {logoState === "missing" && (
              <div className="msg err">Esta empresa no tiene logo en HubSpot. Súbelo manualmente.</div>
            )}

            {preview && (
              <>
                <div className="preview" aria-label="Vista previa del logo">
                  <div className={logoBg === "dark" ? "dark" : undefined}><img src={preview} alt="Así se verá en el brochure" /></div>
                  <div className="gray"><img src={preview} alt="Vista previa sobre gris" /></div>
                </div>
                <div className="bg-choice">
                  <span>Fondo del logo:</span>
                  <button type="button" className={`btn btn-sm btn-ghost${logoBg === "light" ? " on" : ""}`} onClick={() => setLogoBg("light")}>Claro</button>
                  <button type="button" className={`btn btn-sm btn-ghost${logoBg === "dark" ? " on" : ""}`} onClick={() => setLogoBg("dark")}>Oscuro</button>
                </div>
              </>
            )}

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn btn-sm btn-ghost" onClick={() => fileRef.current?.click()}>
                {preview ? "Cambiar logo" : "Subir logo"}
              </button>
              <button className="btn btn-sm btn-ghost" onClick={reset}>Buscar otra empresa</button>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" hidden onChange={onFile} />
            </div>
            <p className="hint">PNG con fondo transparente o SVG se ven mejor. Se recorta solo; si el logo es claro (blanco, amarillo) se sugiere fondo oscuro.</p>
          </>
        )}

        {error && <div className="msg err">{error}</div>}

        <div className="foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn" disabled={!logo || !name.trim() || saving} onClick={save}>
            {saving ? "Guardando…" : "Guardar y publicar"}
          </button>
        </div>
      </div>
    </div>
  );
}
