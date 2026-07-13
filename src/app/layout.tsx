import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AURA | Reputación digital para restaurantes",
  description: "Gestiona las reseñas de Google de tu restaurante con IA. Responde a cada cliente de forma profesional y humana. Mejora tu puntuación y atrae más clientes.",
  keywords: ["reseñas google", "reputación online", "restaurantes", "gestión reseñas", "IA", "AURA"],
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: "AURA — Tu reputación en su mejor momento",
    description: "Respondemos las reseñas de Google de tu restaurante con IA. Rápido, profesional, humano.",
    locale: "es_ES",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400..900&family=Playfair+Display:wght@400;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
