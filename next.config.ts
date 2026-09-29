import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "*.supabase.co";

const config: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer"],
  // pdfkit carga sus tipografías estándar de forma dinámica y Vercel no las detecta solo
  outputFileTracingIncludes: {
    "/[event]/pdf": ["./node_modules/pdfkit/js/standard-fonts/**", "./node_modules/pdfkit/js/data/**"],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: supabaseHost }],
  },
};

export default config;
