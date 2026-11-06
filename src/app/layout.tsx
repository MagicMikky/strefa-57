import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CookieConsent } from "@/components/cookie-consent";
import { getSiteUrl, siteConfig } from "@/data/site";
import { searchRobots } from "@/lib/seo";
import "./globals.css";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Paintball Strefa 29 | Pole paintballowe koło Gdańska",
    template: "%s | Paintball Strefa 29",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: ["paintball Gdańsk", "paintball Trójmiasto", "paintball Czaple", "integracja firmowa Gdańsk"],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: siteUrl,
    siteName: siteConfig.name,
    title: "Paintball Strefa 29 — wejdź do gry",
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Paintball Strefa 29 — wejdź do gry",
    description: siteConfig.description,
  },
  robots: searchRobots(),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#111510",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      postalCode: siteConfig.address.postalCode,
      addressLocality: siteConfig.address.city,
      addressRegion: siteConfig.address.region,
      addressCountry: siteConfig.address.country,
    },
  };

  return (
    <html lang="pl">
      <body>
        <a className="skip-link" href="#main-content">Przejdź do treści</a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
        <CookieConsent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
