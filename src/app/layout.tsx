import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Source_Sans_3 } from "next/font/google";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CookieConsent } from "@/components/cookie-consent";
import { getSiteUrl, siteConfig } from "@/data/site";
import { getPublicBusiness } from "@/lib/business/public";
import { getPublishedSiteCopy } from "@/lib/content/public";
import { searchRobots } from "@/lib/seo";
import "./globals.css";

const display = Barlow_Condensed({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const sans = Source_Sans_3({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const siteUrl = getSiteUrl();

export async function generateMetadata(): Promise<Metadata> {
  const copy = await getPublishedSiteCopy();
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: copy.seo.home.title,
      template: "%s | Paintball Strefa 29",
    },
    description: copy.seo.home.description,
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
      description: copy.seo.home.description,
    },
    twitter: {
      card: "summary_large_image",
      title: "Paintball Strefa 29 — wejdź do gry",
      description: copy.seo.home.description,
    },
    robots: searchRobots(),
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#111510",
  colorScheme: "light",
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const business = await getPublicBusiness();
  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: business.profile.tradeName,
    description: business.profile.description,
    url: siteUrl,
    ...(business.contact.phoneHref ? { telephone: business.contact.phoneDisplay } : {}),
    ...(business.contact.emailHref ? { email: business.contact.emailDisplay } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: business.profile.street,
      postalCode: business.profile.postalCode,
      addressLocality: business.profile.city,
      addressRegion: business.profile.region,
      addressCountry: business.profile.country,
    },
  };

  return (
    <html lang="pl" className={`${display.variable} ${sans.variable}`}>
      <body>
        <a className="skip-link" href="#main-content">Przejdź do treści</a>
        <SiteHeader addressLabel={`${business.profile.street}, ${business.profile.city}`} />
        <main id="main-content">{children}</main>
        <SiteFooter business={business} />
        <CookieConsent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
