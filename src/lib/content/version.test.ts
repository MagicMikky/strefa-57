import { describe, expect, it } from "vitest";

import {
  ContentVersionConflictError,
  expectedVersion,
  isContentVersionConflict,
} from "@/lib/content/version";

describe("content draft versions", () => {
  it("accepts only an explicit non-negative integer version", () => {
    expect(expectedVersion("0")).toBe(0);
    expect(expectedVersion("12")).toBe(12);
    expect(expectedVersion(null)).toBeNull();
    expect(expectedVersion("")).toBeNull();
    expect(expectedVersion("1.5")).toBeNull();
    expect(expectedVersion("-1")).toBeNull();
  });

  it("recognizes optimistic-lock and unique-create conflicts", () => {
    expect(isContentVersionConflict(new ContentVersionConflictError())).toBe(true);
    expect(isContentVersionConflict({ code: "P2002" })).toBe(true);
    expect(isContentVersionConflict(new Error("database unavailable"))).toBe(false);
  });
});
