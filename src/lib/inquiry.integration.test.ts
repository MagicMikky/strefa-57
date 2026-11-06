import { describe, it, expect } from "vitest";

import { validateInquiry } from "./inquiry";

describe("integration: /api/inquiry", () => {
  it("sanity: validation used by endpoint", () => {
    // Basic sanity check that validateInquiry is exported and callable
    const result = validateInquiry({} as unknown, new Date());
    expect(result.ok).toBe(false);
  });
});
