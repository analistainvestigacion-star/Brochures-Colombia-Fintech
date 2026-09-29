import "server-only";
import { adminClient } from "./supabase";
import type { BrochureEvent } from "./types";

const EVENT_SELECT = "*, packages(*, sponsorships(*))";

function normalize(ev: BrochureEvent): BrochureEvent {
  ev.content ??= {};
  ev.packages = (ev.packages ?? []).sort((a, b) => a.sort - b.sort);
  for (const p of ev.packages) {
    p.sponsorships = (p.sponsorships ?? []).sort((a, b) => a.created_at.localeCompare(b.created_at));
  }
  return ev;
}

// Sin Supabase configurado (p. ej. para revisar el diseño en local) se usan datos de muestra, solo lectura.
const DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL;
async function demoEvents(): Promise<BrochureEvent[]> {
  return structuredClone((await import("@/data/demo.json")).default as unknown as BrochureEvent[]);
}

export async function getEvent(slug: string, { includeDrafts = false } = {}) {
  if (DEMO) return (await demoEvents()).find((e) => e.slug === slug) ?? null;
  let q = adminClient().from("events").select(EVENT_SELECT).eq("slug", slug);
  if (!includeDrafts) q = q.eq("published", true);
  const { data, error } = await q.maybeSingle();
  if (error) throw error;
  return data ? normalize(data as BrochureEvent) : null;
}

export async function listEvents({ includeDrafts = false } = {}) {
  if (DEMO) return demoEvents();
  let q = adminClient().from("events").select(EVENT_SELECT).order("sort");
  if (!includeDrafts) q = q.eq("published", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data as BrochureEvent[]).map(normalize);
}

export async function getActivity(eventId: string, limit = 20) {
  if (DEMO) return [];
  const { data } = await adminClient()
    .from("activity")
    .select("*")
    .eq("event_id", eventId)
    .order("at", { ascending: false })
    .limit(limit);
  return (data ?? []) as {
    id: number;
    package_name: string;
    company_name: string;
    action: "tomado" | "liberado";
    actor: string;
    at: string;
  }[];
}
