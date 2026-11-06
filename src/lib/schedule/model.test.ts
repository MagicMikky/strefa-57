import { describe, expect, it } from "vitest";

import { initialBusinessSettings } from "@/lib/business/model";
import { authorize } from "@/lib/staff/permissions";
import { fallbackSchedule, normalizeSchedule, selectPublishedSchedule } from "@/lib/schedule/model";

const slots = initialBusinessSettings.slotStartTimes;

describe("schedule catalog", () => {
  it("accepts an empty week and a real block without calculating availability", () => {
    const result = normalizeSchedule({
      weekdays: ["sb", "nd"],
      blocks: [{ date: "2026-12-24", slot: "day", reason: "Zamknięte" }],
    }, slots);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.blocks).toHaveLength(1);
    expect(result.value).not.toHaveProperty("freeSeats");
  });

  it("rejects a bad date, an unknown slot, markup and an equipment count", () => {
    expect(normalizeSchedule({ weekdays: [], blocks: [{ date: "2026-02-31", slot: "day", reason: "x" }] }, slots).ok).toBe(false);
    expect(normalizeSchedule({ weekdays: [], blocks: [{ date: "2026-12-24", slot: "09:00", reason: "x" }] }, slots).ok).toBe(false);
    expect(normalizeSchedule({ weekdays: [], blocks: [{ date: "2026-12-24", slot: "08:00", reason: "<b>x</b>" }] }, slots).ok).toBe(false);
    expect(normalizeSchedule({ weekdays: [], blocks: [], equipmentSets: 20 }, slots).ok).toBe(false);
    const twice = normalizeSchedule({
      weekdays: [],
      blocks: [
        { date: "2026-12-24", slot: "08:00", reason: "Serwis" },
        { date: "2026-12-24", slot: "08:00", reason: "Powtórka" },
      ],
    }, slots);
    expect(twice.ok).toBe(false);
  });

  it("keeps an unpublished draft private", () => {
    const fallback = fallbackSchedule();
    expect(selectPublishedSchedule(null, fallback)).toBe(fallback);
    expect(authorize("manager", "business.publish")).toBe("forbidden");
    expect(authorize("employee", "business.publish")).toBe("forbidden");
  });
});
