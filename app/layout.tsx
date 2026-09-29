import type { Metadata } from "next";
import { Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Sustitutos web de Wasa y PP Supply Mono (licencias comerciales).
// Si CF tiene los archivos de las fuentes, se cambian por next/font/local aquí.
const sans = Hanken_Grotesk({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-sans" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://brochure.colombiafintech.co"),
  title: { default: "Brochures · Colombia Fintech", template: "%s · Colombia Fintech" },
  description: "Oportunidades de patrocinio en los eventos de Colombia Fintech.",
  icons: { icon: "/brand/logo-azul.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
