-- Brochures Colombia Fintech — esquema
-- Ejecutar en Supabase → SQL Editor (una sola vez), luego seed-golf-2026.sql

create extension if not exists pgcrypto;

-- Un evento = un brochure (brochure.colombiafintech.co/<slug>)
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,           -- "Torneo de golf"
  edition     text,                    -- "2026"
  venue       text,                    -- "Club Campestre Guaymaral"
  date_label  text,                    -- "Noviembre 26, 2026"
  time_label  text,                    -- "6:00 a.m. – 5:00 p.m."
  tagline     text,
  hero_image  text,
  content     jsonb not null default '{}'::jsonb,  -- extras, combos, contactos
  published   boolean not null default true,
  sort        int not null default 0,
  created_at  timestamptz not null default now()
);

-- Paquetes de patrocinio de cada evento
create table if not exists public.packages (
  id                uuid primary key default gen_random_uuid(),
  event_id          uuid not null references public.events(id) on delete cascade,
  slug              text not null,
  name              text not null,
  benefits          text[] not null default '{}',
  note              text,
  price_member      bigint,
  price_non_member  bigint,
  capacity          int not null default 1 check (capacity > 0),
  images            text[] not null default '{}',
  sort              int not null default 0,
  unique (event_id, slug)
);

-- Cada cupo tomado
create table if not exists public.sponsorships (
  id                  uuid primary key default gen_random_uuid(),
  package_id          uuid not null references public.packages(id) on delete cascade,
  company_name        text not null,
  hubspot_company_id  text,
  logo_url            text not null,
  created_by          text,
  created_at          timestamptz not null default now()
);
create index if not exists sponsorships_package_idx on public.sponsorships(package_id);

-- Historial: quién tomó / liberó qué y cuándo
create table if not exists public.activity (
  id            bigint generated always as identity primary key,
  event_id      uuid references public.events(id) on delete cascade,
  package_name  text,
  company_name  text,
  action        text not null check (action in ('tomado', 'liberado')),
  actor         text,
  at            timestamptz not null default now()
);

-- No se puede exceder el número de cupos de un paquete
create or replace function public.check_capacity() returns trigger
language plpgsql as $$
declare cap int; taken int;
begin
  select capacity into cap from public.packages where id = new.package_id for update;
  select count(*) into taken from public.sponsorships where package_id = new.package_id;
  if taken >= cap then
    raise exception 'Este paquete ya no tiene cupos disponibles';
  end if;
  return new;
end $$;

drop trigger if exists sponsorships_capacity on public.sponsorships;
create trigger sponsorships_capacity before insert on public.sponsorships
  for each row execute function public.check_capacity();

-- Lectura pública; toda escritura pasa por el servidor (service role)
alter table public.events       enable row level security;
alter table public.packages     enable row level security;
alter table public.sponsorships enable row level security;
alter table public.activity     enable row level security;

drop policy if exists "public read events" on public.events;
create policy "public read events" on public.events for select using (published);
drop policy if exists "public read packages" on public.packages;
create policy "public read packages" on public.packages for select using (true);
drop policy if exists "public read sponsorships" on public.sponsorships;
create policy "public read sponsorships" on public.sponsorships for select using (true);

-- Bucket público para los logos
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;
