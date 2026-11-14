import { describe, expect, it } from "vitest";

import { authorize, can } from "@/lib/staff/permissions";
import {
  fallbackBusiness,
  normalizeBusiness,
  selectPublicBundle,
  type BusinessBundle,
} from "@/lib/business/model";

function sample(): BusinessBundle {
  const base = fallbackBusiness();
  return {
    ...base,
    profile: { ...base.profile, tradeName: "Paintball Strefa 29", latitude: "", longitude: "" },
    contact: { ...base.contact, phoneDisplay: "Numer telefonu do potwierdzenia", emailDisplay: "E-mail do potwierdzenia" },
  };
}

describe("company configuration", () => {
  it("lets only the owner publish company data", () => {
    expect(can("owner", "business.publish")).toBe(true);
    expect(can("manager", "business.publish")).toBe(false);
    expect(can("employee", "business.publish")).toBe(false);
    expect(authorize(null, "business.publish")).toBe("unauthenticated");
    expect(authorize("manager", "business.publish")).toBe("forbidden");
  });

  it("rejects markup and scripts in company fields", () => {
    const input = sample();
    const result = normalizeBusiness({
      ...input,
      profile: { ...input.profile, description: "<script>alert(1)</script>" },
    });
    expect(result.ok).toBe(false);
  });

  it("accepts owner-approved operational prices without enabling checkout", () => {
    const input = sample();
    const result = normalizeBusiness({
      ...input,
      contact: { ...input.contact, phoneDisplay: "+48 500 600 700", emailDisplay: "biuro@example.com" },
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.contact.phoneHref).toBe("tel:+48500600700");
    expect(result.value.contact.emailHref).toBe("mailto:biuro@example.com");
    expect(result.value.settings.depositAmount).toBe("500.00");
    expect(result.value.settings.maxPlayersPerSlot).toBe(50);
  });

  it("rejects a slot that cannot hold the declared teams", () => {
    const input = sample();
    const result = normalizeBusiness({
      ...input,
      settings: { ...input.settings, maxPlayersPerTeam: 8, maxTeamsPerMatch: 4, maxPlayersPerSlot: 40 },
    });
    expect(result.ok).toBe(false);
  });

  it("shows the published snapshot and never a missing draft", () => {
    const published = sample();
    published.profile.tradeName = "Opublikowane";
    const fallback = sample();
    expect(selectPublicBundle(published, fallback).profile.tradeName).toBe("Opublikowane");
    expect(selectPublicBundle(null, fallback).profile.tradeName).toBe(fallback.profile.tradeName);
  });
});
