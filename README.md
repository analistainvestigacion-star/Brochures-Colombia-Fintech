# Brochures Colombia Fintech

`brochure.colombiafintech.co/<evento>`: brochures de patrocinio que se actualizan solos.
El equipo de CF marca un paquete como tomado, elige la empresa en HubSpot y el logo aparece en el brochure para todos.

- **Página pública** `/golf`: un paquete por pantalla, con precios, cupos y "Patrocinado por:". Los paquetes completos se ven en gris.
- **PDF** `/golf/pdf`: generado con la disponibilidad del momento.
- **Panel** `/admin`: solo para los correos de la lista en `lib/auth.ts`. Se entra con un enlace que llega al correo.

## Publicarlo (una sola vez, unos 20 minutos)

Las claves **no se guardan en ningún archivo**. Solo van en Vercel, y la mayoría las pone Vercel solo.

1. **GitHub:** crear un repositorio vacío y subir esta carpeta `brochures-cf`.
2. **Vercel:** *Add New → Project*, elegir ese repositorio y darle *Deploy*.
3. **Supabase desde Vercel:** en el proyecto de Vercel ir a *Storage → Create Database → Supabase*, conectarlo al proyecto y darle *Create*.
   Vercel crea la base de datos y **pone solo** las 3 claves de Supabase.
4. **Tablas:** abrir el proyecto en Supabase (botón *Open in Supabase*), ir a *SQL Editor*, pegar y correr `supabase/schema.sql`. Después hacer lo mismo con `supabase/seed-golf-2026.sql`.
5. **Login por correo:** en Supabase ir a *Authentication → URL Configuration*.
   - Site URL: `https://brochure.colombiafintech.co`
   - Redirect URLs: `https://brochure.colombiafintech.co/auth/callback`
6. **HubSpot (la única clave a mano):** en HubSpot ir a *Settings → Integrations → Private Apps → Create a private app*. En *Scopes*, marcar `crm.objects.companies.read`, crearla y copiar el token.
   En Vercel ir a *Settings → Environment Variables*, agregar el nombre `HUBSPOT_TOKEN` con el token como valor y guardar.
7. **Dominio:** en Vercel ir a *Settings → Domains* y agregar `brochure.colombiafintech.co`. En el DNS, crear el CNAME que muestra Vercel (`brochure` → `cname.vercel-dns.com`).
8. En Vercel ir a *Deployments → Redeploy* para que tome todo.

## Cambios comunes
- **Agregar o quitar gente del panel:** editar la lista en `lib/auth.ts`.
- **Nuevo evento (p. ej. `/crypto`):** copiar `supabase/seed-golf-2026.sql`, cambiar el `slug`, los textos, los paquetes y las imágenes (en `public/events/crypto/`) y correrlo en el SQL Editor.
- **Ver en local sin configurar nada:** `npm install` y luego `npm run dev`. La página sale con datos de muestra y el panel no funciona.
