import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/data/site";

const routes = ["", "/oferta", "/cennik", "/galeria", "/dla-kogo", "/faq", "/kontakt", "/dojazd", "/zapytaj-o-termin", "/regulamin", "/polityka-prywatnosci", "/cookies"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/zapytaj-o-termin" ? 0.9 : 0.7,
  }));
}
