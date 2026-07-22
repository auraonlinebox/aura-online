import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "AURA | Reputación digital para tu negocio",
  description: "Gestiona las reseñas de Google de tu negocio con AURA. Responde a cada cliente de forma profesional y humana. Mejora tu puntuación y atrae más clientes.",
  keywords: ["reseñas google", "reputación online", "gestión reseñas", "AURA"],
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: "AURA — Tu reputación en su mejor momento",
    description: "Respondemos las reseñas de Google de tu negocio con AURA. Rápido, profesional, humano.",
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
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-TRZKLVKPVT" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-TRZKLVKPVT');`}
        </Script>
      </head>
      <body className="antialiased">
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js');
            });
          }
        `}} />
        {children}
      </body>
    </html>
  );
}
