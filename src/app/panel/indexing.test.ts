import { describe, expect, it } from "vitest";

import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("panel indexing", () => {
  it("keeps panel routes out of the sitemap", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls.some((url) => url.includes("/panel"))).toBe(false);
  });

  it("disallows the panel when public indexing is enabled", () => {
    const previousIndex = process.env.NEXT_PUBLIC_ALLOW_INDEXING;
    const previousUrl = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";
    process.env.NEXT_PUBLIC_SITE_URL = "https://paintball.example";
    const rules = robots().rules;
    const disallow = Array.isArray(rules) ? rules[0]?.disallow : rules?.disallow;
    expect(disallow).toEqual(expect.arrayContaining(["/panel"]));
    if (previousIndex === undefined) {
      delete process.env.NEXT_PUBLIC_ALLOW_INDEXING;
    } else {
      process.env.NEXT_PUBLIC_ALLOW_INDEXING = previousIndex;
    }
    if (previousUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = previousUrl;
    }
  });
});
