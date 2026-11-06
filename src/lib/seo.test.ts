import { afterEach, describe, expect, it } from "vitest";
import { isSearchIndexingAllowed } from "./seo";

const originalIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING;
const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

afterEach(() => {
  if (originalIndexing === undefined) {
    delete process.env.NEXT_PUBLIC_ALLOW_INDEXING;
  } else {
    process.env.NEXT_PUBLIC_ALLOW_INDEXING = originalIndexing;
  }
  if (originalSiteUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  }
});

describe("isSearchIndexingAllowed", () => {
  it("stays closed until indexing is explicitly enabled on a public https origin", () => {
    delete process.env.NEXT_PUBLIC_ALLOW_INDEXING;
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
    expect(isSearchIndexingAllowed()).toBe(false);

    process.env.NEXT_PUBLIC_ALLOW_INDEXING = "true";
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
    expect(isSearchIndexingAllowed()).toBe(false);

    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
    expect(isSearchIndexingAllowed()).toBe(true);
  });
});
