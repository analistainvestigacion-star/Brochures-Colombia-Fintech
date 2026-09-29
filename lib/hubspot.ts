import "server-only";

const API = "https://api.hubapi.com";

export type HubspotCompany = {
  id: string;
  name: string;
  domain: string | null;
  logoUrl: string | null;
};

async function hs(path: string, init?: RequestInit) {
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) throw new Error("Falta HUBSPOT_TOKEN");
  const res = await fetch(API + path, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HubSpot ${res.status}: ${await res.text()}`);
  return res.json();
}

type RawCompany = { id: string; properties: { name?: string; domain?: string; hs_logo_url?: string } };

function toCompany(c: RawCompany): HubspotCompany {
  return {
    id: c.id,
    name: c.properties.name ?? "(sin nombre)",
    domain: c.properties.domain || null,
    logoUrl: c.properties.hs_logo_url || null,
  };
}

export async function searchCompanies(query: string): Promise<HubspotCompany[]> {
  const data = await hs("/crm/v3/objects/companies/search", {
    method: "POST",
    body: JSON.stringify({ query, limit: 8, properties: ["name", "domain", "hs_logo_url"] }),
  });
  return (data.results as RawCompany[]).map(toCompany);
}

export async function getCompany(id: string): Promise<HubspotCompany> {
  const data = await hs(`/crm/v3/objects/companies/${encodeURIComponent(id)}?properties=name,domain,hs_logo_url`);
  return toCompany(data);
}
