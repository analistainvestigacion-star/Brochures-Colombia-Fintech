-- Torneo de Golf 2026 — contenido tomado del brochure (PPTX)
-- Se puede volver a correr: actualiza el evento y los paquetes sin tocar los patrocinios existentes.

insert into public.events (slug, title, edition, venue, date_label, time_label, tagline, hero_image, sort, content)
values (
  'golf',
  'Torneo de golf',
  '2026',
  'Club Campestre Guaymaral',
  'Noviembre 26, 2026',
  '6:00 a.m. – 5:00 p.m.',
  'Un espacio donde el deporte, las relaciones y los negocios se encuentran para fortalecer el ecosistema fintech.',
  '/events/golf/hero.jpg',
  1,
  $json${
    "extras": {
      "title": "Experiencias adicionales",
      "intro": "Complementos para los patrocinadores de Hoyo. No incluidos en el precio del paquete.",
      "groups": [
        { "name": "Promocionales", "items": [
          { "name": "Kit de golf: tees + marcadores", "detail": "1 activación en campo", "price": "$1M" },
          { "name": "144 × 3 bolas brandeadas", "detail": "1 activación en campo", "price": "$13M" }
        ]},
        { "name": "Hidratación / snacks", "items": [
          { "name": "160 bebidas hidratantes no alcohólicas", "detail": "3 activaciones en campo", "price": "$2M" },
          { "name": "8 botellas de whiskey", "detail": "3 activaciones en campo", "price": "$4M" },
          { "name": "Snacks (Chocorramo o frutos secos)", "detail": "2 activaciones en campo", "price": "$1M" },
          { "name": "1 nevera + hielo", "detail": "", "price": "$100K" }
        ]},
        { "name": "Experiencia", "items": [
          { "name": "Fotógrafo + impresión de fotografía física", "detail": "1 activación en campo", "price": "$3M" },
          { "name": "Exhibición de carro", "detail": "1 activación en campo", "price": "$5M" }
        ]}
      ]
    },
    "combos": {
      "title": "Premios de las rifas",
      "items": [
        { "name": "Combo 1", "items": ["2 talegas PRO TaylorMade", "2 bonos Adidas de $500K", "1 tiquete aéreo", "1 bono de hotel", "2 audífonos de conducción ósea Garmin"] },
        { "name": "Combo 2", "items": ["2 drivers TaylorMade", "2 bonos TaylorMade de $500K", "1 patineta eléctrica", "1 bono de hotel", "1 barra de sonido JBL", "1 AirTags × 4 Apple"] },
        { "name": "Combo 3", "items": ["2 híbridos TaylorMade", "2 parlantes Sonos", "1 AirPods Apple", "1 boleta doble general Estéreo Picnic", "1 putter TaylorMade", "1 barra de sonido JBL"] },
        { "name": "Combo 4", "items": ["2 wedges TaylorMade", "2 Whoop band 5.0", "1 reloj Garmin", "1 máquina de café", "1 AirTags × 4 Apple", "1 putter TaylorMade"] }
      ]
    },
    "contacts": [
      { "name": "Paula Santander", "role": "Account Manager Corporativos", "email": "managersafiliados@colombiafintech.co", "phone": "+57 310 300 3503" },
      { "name": "Helena Posada", "role": "Account Manager Asociados", "email": "fintechmanager@colombiafintech.co", "phone": "+57 316 447 5889" },
      { "name": "Ana María Penagos", "role": "Account Manager Asociados", "email": "managersasociados@colombiafintech.co", "phone": "+57 302 212 3655" }
    ]
  }$json$::jsonb
)
on conflict (slug) do update set
  title = excluded.title, edition = excluded.edition, venue = excluded.venue,
  date_label = excluded.date_label, time_label = excluded.time_label,
  tagline = excluded.tagline, hero_image = excluded.hero_image, content = excluded.content;

with ev as (select id from public.events where slug = 'golf')
insert into public.packages (event_id, slug, name, capacity, price_member, price_non_member, sort, images, benefits, note)
select ev.id, p.slug, p.name, p.capacity, p.pm, p.pnm, p.sort, p.images, p.benefits, p.note
from ev, (values
  ('registro', 'Registro', 1, 30000000, 36000000, 1,
    array['/events/golf/registro-1.jpeg', '/events/golf/registro-2.jpeg'],
    array['144 refrigerios de llegada para jugadores', '1 counter de registro brandeado', 'Backing cobrandeado con CF',
          'Kit de bienvenida brandeado: totebag + 3 bolas', 'Almuerzo + refrigerio staff (1 px)',
          '3 invitaciones para jugadores (incluida tarifa caddie)'], null),
  ('gorras', 'Gorras', 1, 22000000, 27000000, 2,
    array['/events/golf/gorras-1.png', '/events/golf/gorras-2.png'],
    array['144 gorras con el logo de la marca + logo Colombia Fintech',
          '2 invitaciones para jugadores (incluida tarifa caddie)'], null),
  ('termos', 'Termos', 1, 12000000, 15000000, 3,
    array['/events/golf/termos-1.cutout.png', '/events/golf/termos-2.cutout.png'],
    array['144 termos con el logo de la marca + logo Colombia Fintech',
          '1 invitación para jugador (incluida tarifa caddie)'], null),
  ('camisetas', 'Camisetas', 1, 30000000, 36000000, 4,
    array['/events/golf/camisetas-1.jpeg', '/events/golf/camisetas-2.jpeg'],
    array['144 camisetas brandeadas con logo de la marca en la manga + logo CF', 'Almuerzo + refrigerio staff (1 px)',
          '4 invitaciones para jugadores (incluida tarifa caddie)'], null),
  ('refrigerio', 'Refrigerio', 1, 10000000, 14000000, 5,
    array['/events/golf/refrigerio-1.jpeg', '/events/golf/refrigerio-2.jpeg'],
    array['144 refrigerios (kiosko) para jugadores', '144 bebidas no alcohólicas', '5 habladores',
          'Almuerzo + refrigerio staff (1 px)', '1 invitación para jugador (incluida tarifa caddie)'], null),
  ('hoyo-basic', 'Hoyo Basic', 14, 12000000, 14000000, 6,
    array['/events/golf/hoyo-basic-1.jpeg', '/events/golf/hoyo-basic-2.jpeg'],
    array['Backing y counter brandeado', 'Parasol, 1 mesa y 4 sillas', '2 vallas 2×1 con branding', 'Moqueta',
          'Almuerzo + refrigerio staff (2 px)', '2 invitaciones para jugadores (incluida tarifa caddie)'],
    'Adicional: escoger experiencia (no incluida en el precio).'),
  ('hoyo-concurso', 'Hoyo Concurso', 4, 15000000, 18000000, 7,
    array['/events/golf/hoyo-concurso-1.jpeg', '/events/golf/hoyo-concurso-2.jpeg'],
    array['Longest Drive o Closest to the Pin (se define según el hoyo asignado)', 'Backing y counter brandeado',
          'Parasol, 1 mesa y 4 sillas', '2 vallas 2×1 con branding', 'Moqueta', 'Almuerzo + refrigerio staff (2 px)',
          'Premio: driver, híbrido, wedge o putter TaylorMade, según el hoyo',
          '3 invitaciones para jugadores (incluida tarifa caddie)'], null),
  ('caddies', 'Caddies', 1, 10000000, 15000000, 8,
    array['/events/golf/caddies-1.jpeg', '/events/golf/caddies-2.jpeg'],
    array['144 petos brandeados para caddies', '1 invitación para jugador (incluida tarifa caddie)'], null),
  ('almuerzo', 'Almuerzo co-brandeado', 2, 30000000, 36000000, 9,
    array['/events/golf/almuerzo-1.jpeg', '/events/golf/almuerzo-2.jpeg'],
    array['Almuerzo para 144 jugadores', '25 habladores co-brandeados', '2 tótems brandeables', 'Charla de 10 minutos',
          'Almuerzo + refrigerio staff (1 px)', '3 invitaciones para jugadores (incluida tarifa caddie)'], null),
  ('rifas', 'Sponsor Rifas', 4, 17000000, 21000000, 10,
    array['/events/golf/rifas-1.jpeg', '/events/golf/rifas-2.jpeg'],
    array['8 rifas patrocinadas por la marca', 'Mención recurrente del maestro de ceremonias durante la premiación',
          'Backing multilogo + registro fotográfico exclusivo en la entrega de premios',
          'Almuerzo + refrigerio staff (1 px)', '2 invitaciones para jugadores (incluida tarifa caddie)'], null),
  ('carrobar', 'Carrobar', 2, 10000000, 14000000, 11,
    array['/events/golf/carrobar-1.jpeg', '/events/golf/carrobar-2.png'],
    array['Alquiler de carro de golf', '80 snacks, 60 cafés, 100 cervezas y 100 bebidas no alcohólicas', 'Vasos brandeados',
          'Personal de servicio', '1 invitación para jugador (incluida tarifa caddie)'],
    'No incluye bebidas alcohólicas.'),
  ('carros-golf', 'Carros de golf de desplazamiento', 1, 13000000, 16000000, 12,
    array['/events/golf/carros-golf-1.png', '/events/golf/carros-golf-2.png'],
    array['10 carritos con branding para el desplazamiento de marcas', 'Almuerzo + refrigerio staff (2 px)',
          '1 invitación para jugador (incluida tarifa caddie)'], null)
) as p(slug, name, capacity, pm, pnm, sort, images, benefits, note)
on conflict (event_id, slug) do update set
  name = excluded.name, capacity = excluded.capacity, price_member = excluded.price_member,
  price_non_member = excluded.price_non_member, sort = excluded.sort, images = excluded.images,
  benefits = excluded.benefits, note = excluded.note;

-- Patrocinios que ya aparecían en el brochure
insert into public.sponsorships (package_id, company_name, logo_url, created_by)
select pk.id, s.company, s.logo, 'brochure-pptx'
from (values
  ('registro', 'Snowflake', '/events/golf/logos/snowflake.png'),
  ('hoyo-basic', 'Lulo Bank', '/events/golf/logos/lulo-bank.png'),
  ('carros-golf', 'Payments Way', '/events/golf/logos/payments-way.png')
) as s(pkg, company, logo)
join public.packages pk on pk.slug = s.pkg
join public.events ev on ev.id = pk.event_id and ev.slug = 'golf'
where not exists (
  select 1 from public.sponsorships x where x.package_id = pk.id and x.company_name = s.company
);
