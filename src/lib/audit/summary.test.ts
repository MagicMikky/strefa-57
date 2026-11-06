import { describe, expect, it } from "vitest";

import { describeAudit } from "./summary";

describe("audit summary", () => {
  it("names the area and action without copying the stored snapshot", () => {
    expect(describeAudit({
      entity: "schedule",
      action: "publish",
      createdAt: "2026-11-06T10:10:00.000Z",
    })).toBe("2026-11-06 11:10 · Harmonogram · publikacja");
    expect(describeAudit({
      entity: "company<script>",
      action: "save_draft",
      createdAt: "2026-11-06T10:10:00.000Z",
    })).toBe("2026-11-06 11:10 · Inny zapis · zapis wersji roboczej");
  });
});
