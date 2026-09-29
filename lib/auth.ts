import "server-only";
import { sessionClient } from "./supabase";

// Quiénes pueden entrar al panel /admin. Para agregar o quitar a alguien, edite esta lista.
const ADMIN_EMAILS = [
  "managerasociados@colombiafintech.co",
  "managerafiliados@colombiafintech.co",
  "fintechmanager@colombiafintech.co",
  "analistainvestigacion@colombiafintech.co",
  "headinvestigacion@colombiafintech.co",
  "mariamercedes@colombiafintech.co",
];

export function isAllowed(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

/** Correo del administrador con sesión activa, o null. */
export async function currentAdmin(): Promise<string | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const supabase = await sessionClient();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email ?? null;
  return isAllowed(email) ? email!.toLowerCase() : null;
}
