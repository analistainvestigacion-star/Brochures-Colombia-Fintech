"use client";

import { useState } from "react";

export function LoginForm({ linkError }: { linkError?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(linkError ? "El enlace expiró o ya se usó. Pide uno nuevo." : null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "No se pudo enviar el enlace");
      setState("idle");
    } else {
      setState("sent");
    }
  }

  return (
    <form className="card login" onSubmit={submit}>
      <span className="mono" style={{ color: "var(--olive)" }}>Panel interno</span>
      <h1 style={{ margin: 0, fontWeight: 300, fontSize: 32 }}>Ingresar</h1>
      <p className="hint">Te enviamos un enlace de acceso a tu correo de Colombia Fintech.</p>
      <div className="field">
        <label htmlFor="email">Correo</label>
        <input
          id="email" type="email" required className="input" placeholder="nombre@colombiafintech.co"
          value={email} onChange={(e) => setEmail(e.target.value)} disabled={state === "sent"}
        />
      </div>
      {error && <div className="msg err">{error}</div>}
      {state === "sent" ? (
        <div className="msg ok">Listo. Revisa tu correo y abre el enlace desde este mismo navegador.</div>
      ) : (
        <button className="btn" disabled={state === "sending"}>
          {state === "sending" ? "Enviando…" : "Enviarme el enlace"}
        </button>
      )}
    </form>
  );
}
