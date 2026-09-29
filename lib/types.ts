export type Sponsorship = {
  id: string;
  package_id: string;
  company_name: string;
  hubspot_company_id: string | null;
  logo_url: string;
  logo_bg: "light" | "dark";
  created_by: string | null;
  created_at: string;
};

export type Package = {
  id: string;
  event_id: string;
  slug: string;
  name: string;
  benefits: string[];
  note: string | null;
  price_member: number | null;
  price_non_member: number | null;
  capacity: number;
  images: string[];
  sort: number;
  sponsorships: Sponsorship[];
};

export type ExtraItem = { name: string; detail?: string; price?: string };

export type EventContent = {
  extras?: { title: string; intro?: string; groups: { name: string; items: ExtraItem[] }[] };
  combos?: { title: string; items: { name: string; items: string[] }[] };
  contacts?: { name: string; role: string; email: string; phone?: string }[];
};

export type BrochureEvent = {
  id: string;
  slug: string;
  title: string;
  edition: string | null;
  venue: string | null;
  date_label: string | null;
  time_label: string | null;
  tagline: string | null;
  hero_image: string | null;
  content: EventContent;
  published: boolean;
  packages: Package[];
};
