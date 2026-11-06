import { describe, expect, it } from "vitest";

import { fallbackBusiness } from "@/lib/business/model";
import { fallbackSchedule } from "@/lib/schedule/model";
import { evaluateDay, monthCells, warsawDate, weekDates } from "@/lib/availability/model";

const settings = fallbackBusiness().settings;

describe("availability calendar", () => {
  it("keeps an unpublished weekday rhythm undecided", () => {
    const day = evaluateDay("2026-11-14", settings, fallbackSchedule(), [], { players: 4, privateSlot: false }, "2026-11-06");
    expect(day.tone).toBe("undecided");
    expect(day.slots).toHaveLength(3);
    expect(day.slots[0]).toMatchObject({ start: "08:00", end: "10:00", bookableSeats: 8, freePhysicalSeats: 32, statusLabel: "Wolny" });
  });

  it("turns a published open day green when less than half is occupied", () => {
    const day = evaluateDay("2026-11-14", settings, { weekdays: ["sb"], blocks: [] }, [], { players: 4, privateSlot: false }, "2026-11-06");
    expect(day.tone).toBe("open");
    expect(day.activeCapacity).toBe(96);
  });

  it("turns the day blue once half of the active capacity is occupied", () => {
    const day = evaluateDay("2026-11-14", settings, { weekdays: ["sb"], blocks: [] }, [
      { slot: "08:00", players: 24, teams: 3, privateSlot: false },
      { slot: "11:00", players: 24, teams: 3, privateSlot: false },
    ], { players: 4, privateSlot: false }, "2026-11-06");
    expect(day.tone).toBe("limited");
    expect(day.occupiedPlayers).toBe(48);
  });

  it("separates physical seats from seats bookable by another team", () => {
    const day = evaluateDay("2026-11-14", settings, { weekdays: ["sb"], blocks: [] }, [
      { slot: "08:00", players: 16, teams: 4, privateSlot: false },
    ], { players: 4, privateSlot: false }, "2026-11-06");
    expect(day.slots[0]).toMatchObject({ freePhysicalSeats: 16, bookableSeats: 0, fitsRequest: false });
    expect(day.slots[1].fitsRequest).toBe(true);
  });

  it("counts a private party as the whole slot", () => {
    const day = evaluateDay("2026-11-14", settings, { weekdays: ["sb"], blocks: [] }, [
      { slot: "08:00", players: 8, teams: 1, privateSlot: true },
    ], { players: 4, privateSlot: false }, "2026-11-06");
    expect(day.occupiedPlayers).toBe(32);
    expect(day.slots[0].fitsRequest).toBe(false);
    expect(day.slots[1].fitsRequest).toBe(true);
    expect(day.tone).toBe("open");
  });

  it("marks an administratively closed day unavailable without calling it reserved", () => {
    const day = evaluateDay("2026-11-14", settings, { weekdays: ["sb"], blocks: [{ date: "2026-11-14", slot: "day", reason: "Przerwa" }] }, [], { players: 4, privateSlot: false }, "2026-11-06");
    expect(day.tone).toBe("unavailable");
    expect(day.slots.every((slot) => slot.statusLabel === "Zablokowany")).toBe(true);
  });

  it("labels a partly filled slot and a private reservation", () => {
    const day = evaluateDay("2026-11-14", settings, { weekdays: ["sb"], blocks: [] }, [
      { slot: "08:00", players: 8, teams: 1, privateSlot: false },
      { slot: "11:00", players: 10, teams: 1, privateSlot: true },
    ], { players: 4, privateSlot: false }, "2026-11-06");
    expect(day.slots[0].statusLabel).toBe("Częściowo zajęty");
    expect(day.slots[1]).toMatchObject({ statusLabel: "Slot prywatny", fitsRequest: false, freePhysicalSeats: 0 });
  });

  it("rejects a past day, a closed weekday and a group above one team", () => {
    expect(evaluateDay("2026-11-01", settings, { weekdays: ["sb", "nd"], blocks: [] }, [], { players: 4, privateSlot: false }, "2026-11-06").tone).toBe("unavailable");
    expect(evaluateDay("2026-11-16", settings, { weekdays: ["sb"], blocks: [] }, [], { players: 4, privateSlot: false }, "2026-11-06").tone).toBe("unavailable");
    expect(evaluateDay("2026-11-14", settings, { weekdays: ["sb"], blocks: [] }, [], { players: 9, privateSlot: true }, "2026-11-06").slots[0].fitsRequest).toBe(false);
  });

  it("formats the Warsaw calendar date", () => {
    expect(warsawDate(new Date("2026-11-06T23:30:00.000Z"))).toBe("2026-11-07");
  });

  it("builds a Monday-first week around a Friday", () => {
    expect(weekDates("2026-11-06")).toEqual([
      "2026-11-02",
      "2026-11-03",
      "2026-11-04",
      "2026-11-05",
      "2026-11-06",
      "2026-11-07",
      "2026-11-08",
    ]);
  });

  it("builds a Monday-first month", () => {
    expect(monthCells(2026, 11)[0].date).toBe("");
    expect(monthCells(2026, 11).find((cell) => cell.date === "2026-11-01")).toBeTruthy();
  });
});
