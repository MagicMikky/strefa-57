import { describe, expect, it } from "vitest";

import { authorize } from "@/lib/staff/permissions";
import {
  attractionsForDisplay,
  fallbackSiteCopy,
  normalizeSiteCopy,
  packagesForDisplay,
  selectPublishedCopy,
} from "@/lib/content/model";

describe("site copy", () => {
  it("accepts the current public copy and keeps package prices unchanged", () => {
    const result = normalizeSiteCopy(fallbackSiteCopy());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const shown = packagesForDisplay(result.value);
    expect(shown.map((item) => item.price)).toEqual([
      "Wycena po zapytaniu",
      "Wycena po zapytaniu",
      "Wycena indywidualna",
    ]);
    expect(shown.map((item) => item.id)).toEqual(["pierwsza-misja", "pelne-natarcie", "wydarzenie"]);
    expect(attractionsForDisplay(result.value)[0]?.icon).toBe("target");
  });

  it("rejects markup, amounts and a changed package id", () => {
    const copy = fallbackSiteCopy();
    expect(normalizeSiteCopy({ ...copy, faq: [{ question: "<b>x</b>", answer: "odpowiedź" }] }).ok).toBe(false);
    const priced = fallbackSiteCopy();
    priced.packages[0].name = "Pakiet 100 zł";
    expect(normalizeSiteCopy(priced).ok).toBe(false);
    const renamed = fallbackSiteCopy();
    renamed.packages[0].id = "inny";
    expect(normalizeSiteCopy(renamed).ok).toBe(false);
  });

  it("does not publish a missing draft and blocks non-owners", () => {
    const fallback = fallbackSiteCopy();
    expect(selectPublishedCopy(null, fallback)).toBe(fallback);
    const published = fallbackSiteCopy();
    published.seo.faq.title = "Opublikowane FAQ";
    expect(selectPublishedCopy(published, fallback).seo.faq.title).toBe("Opublikowane FAQ");
    expect(authorize("manager", "business.publish")).toBe("forbidden");
    expect(authorize(null, "business.publish")).toBe("unauthenticated");
  });
});
