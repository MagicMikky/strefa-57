import { describe, expect, it } from "vitest";
import { fallbackBusiness } from "@/lib/business/model";
import { fallbackSchedule } from "@/lib/schedule/model";
import { evaluateDay, laterDatesInMonth, monthCells, slotsOverlap, warsawDate, weekDates } from "@/lib/availability/model";

const settings = fallbackBusiness().settings;
const schedule = fallbackSchedule();
const today = "2026-11-06";
const day = "2026-11-14";
const request = { players: 8, privateSlot: true };

describe("availability calendar", () => {
  it("opens four slots on all seven days, including weekends and holidays", () => {
    for (const date of ["2026-11-09", "2026-11-10", "2026-11-11", "2026-11-12", "2026-11-13", "2026-11-14", "2026-11-15"]) {
      const result = evaluateDay(date, settings, schedule, [], request, today);
      expect(result.tone).toBe("open");
      expect(result.slots.map((slot) => slot.start)).toEqual(["10:00", "12:00", "15:00", "18:00"]);
      expect(result.slots.every((slot) => slot.fitsRequest)).toBe(true);
    }
  });
  it("enforces the group minimum and maximum", () => {
    expect(evaluateDay(day, settings, schedule, [], { players: 7, privateSlot: true }, today).tone).toBe("unavailable");
    expect(evaluateDay(day, settings, schedule, [], { players: 50, privateSlot: true }, today).tone).toBe("open");
    expect(evaluateDay(day, settings, schedule, [], { players: 51, privateSlot: true }, today).tone).toBe("unavailable");
  });
  it("honors a manually blocked day or slot and legacy overlapping blocks", () => {
    const closedDay = evaluateDay(day, settings, { ...schedule, blocks: [{ date: day, slot: "day", reason: "Zamknięte" }] }, [], request, today);
    expect(closedDay.slots.every((slot) => !slot.fitsRequest)).toBe(true);
    const oneSlot = evaluateDay(day, settings, { ...schedule, blocks: [{ date: day, slot: "15:00", reason: "Przerwa" }] }, [], request, today);
    expect(oneSlot.slots.map((slot) => slot.fitsRequest)).toEqual([true, true, false, true]);
    const legacy = evaluateDay(day, settings, { ...schedule, blocks: [{ date: day, slot: "11:00", reason: "Stara blokada" }] }, [], request, today);
    expect(legacy.slots.map((slot) => slot.fitsRequest)).toEqual([false, false, true, true]);
  });
  it("makes a confirmed exclusive booking occupy its whole slot", () => {
    const result = evaluateDay(day, settings, schedule, [{ slot: "10:00", players: 8, teams: 1, privateSlot: true, confirmed: true }], request, today);
    expect(result.slots[0]).toMatchObject({ fitsRequest: false, freePhysicalSeats: 0, statusLabel: "Slot prywatny" });
    expect(result.slots[1].fitsRequest).toBe(true);
    expect(result.occupiedPlayers).toBe(50);
  });
  it("allows shared groups until fifty people and prevents an exclusive join", () => {
    const uses = [{ slot: "10:00", players: 42, teams: 1, privateSlot: false, confirmed: true }];
    expect(evaluateDay(day, settings, schedule, uses, { players: 8, privateSlot: false }, today).slots[0]).toMatchObject({ fitsRequest: true, bookableSeats: 8, statusLabel: "Częściowo zajęty" });
    expect(evaluateDay(day, settings, schedule, uses, { players: 9, privateSlot: false }, today).slots[0].fitsRequest).toBe(false);
    expect(evaluateDay(day, settings, schedule, uses, request, today).slots[0].fitsRequest).toBe(false);
  });
  it("keeps past and administratively closed weekdays unavailable", () => {
    expect(evaluateDay("2026-11-01", settings, schedule, [], request, today).tone).toBe("unavailable");
    expect(evaluateDay(day, settings, { weekdays: ["pn"], blocks: [] }, [], request, today).tone).toBe("unavailable");
  });
  it("finds later matching dates and handles Warsaw dates", () => {
    const saturdayOnly = { weekdays: ["sb" as const], blocks: [{ date: day, slot: "day", reason: "Przerwa" }] };
    expect(laterDatesInMonth(day, settings, saturdayOnly, [], request, today)).toEqual(["2026-11-21", "2026-11-28"]);
    expect(warsawDate(new Date("2026-11-06T23:30:00.000Z"))).toBe("2026-11-07");
    expect(weekDates("2026-11-06")[0]).toBe("2026-11-02");
    expect(monthCells(2026, 11).find((cell) => cell.date === "2026-11-01")).toBeTruthy();
  });
  it("recognizes old overlapping slots without blocking adjacent slots", () => {
    expect(slotsOverlap("11:00", "10:00", 120)).toBe(true);
    expect(slotsOverlap("11:00", "12:00", 120)).toBe(true);
    expect(slotsOverlap("10:00", "12:00", 120)).toBe(false);
  });
});
