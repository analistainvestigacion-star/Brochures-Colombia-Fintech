import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

// Refresca la sesión de Supabase en las rutas de administración.
export async function middleware(request: NextRequest) {
  // Sin Supabase configurado (primer despliegue / modo demostración) no hay sesión que refrescar
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return NextResponse.next();
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list: { name: string; value: string; options: CookieOptions }[]) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
