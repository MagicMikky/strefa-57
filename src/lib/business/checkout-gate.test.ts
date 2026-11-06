import { describe, expect, it } from "vitest";

import { checkoutReadiness } from "@/lib/business/checkout-gate";

describe("checkout gate", () => {
  it("stays closed when no commercial value has been approved", () => {
    const result = checkoutReadiness();
    expect(result.enabled).toBe(false);
    expect(result.missing.map((item) => item.id)).toEqual(expect.arrayContaining(["D-05", "D-07", "D-10", "D-18"]));
  });

  it("does not open when the stored money fields and the approval flag are filled", () => {
    const result = checkoutReadiness({
      depositAmount: "1",
      privateSlotSurcharge: "1",
      paymentProvider: "test",
      cancellationPolicy: "test",
      commercialApproved: true,
    });
    expect(result.enabled).toBe(false);
    const ids = result.missing.map((item) => item.id);
    expect(ids).toEqual(expect.arrayContaining(["D-05", "D-12", "D-17", "D-18", "D-25", "commercial-approved"]));
    expect(ids).not.toContain("D-07");
    expect(ids).not.toContain("D-10");
  });
});
