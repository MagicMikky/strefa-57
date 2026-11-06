import { describe, expect, it } from "vitest";
import { publicAnalyticsProperties } from "./consent";

describe("publicAnalyticsProperties", () => {
  it("removes personal fields before an analytics event is recorded", () => {
    expect(
      publicAnalyticsProperties({
        status: 422,
        email: "anna@example.com",
        phone: "+48123123123",
        name: "Anna",
        message: "Treść wiadomości",
      }),
    ).toEqual({ status: 422 });
  });
});
