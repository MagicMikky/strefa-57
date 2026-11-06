import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/data/site";
import { isSearchIndexingAllowed } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  if (!isSearchIndexingAllowed()) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
