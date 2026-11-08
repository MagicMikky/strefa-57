import { describe, expect, it } from "vitest";

import { fallbackBusiness } from "@/lib/business/model";
import { decideHold, type CapacityHold, type HoldRequest } from "@/lib/holds/model";

const settings = fallbackBusiness().settings;
const schedule = { weekdays: ["sb" as const], blocks: [] };
const now = new Date("2026-11-06T10:00:00.000Z");

function request(overrides: Partial<HoldRequest> = {}): HoldRequest {
  return {
    idempotencyKey: "hold-key-1",
    date: "2026-11-14",
    slot: "08:00",
    players: 6,
    teams: 1,
    privateSlot: false,
    holdMinutes: 10,
    now,
    ...overrides,
  };
}

describe("capacity holds", () => {
  it("refuses to invent a hold duration", () => {
    expect(decideHold([], request({ holdMinutes: null }), settings, schedule).ok).toBe(false);
  });

  it("rejects dates with an impossible month or day", () => {
    expect(decideHold([], request({ date: "2026-13-14" }), settings, schedule)).toMatchObject({
      ok: false,
      error: "invalid",
    });
    expect(decideHold([], request({ date: "2026-02-30" }), settings, schedule)).toMatchObject({
      ok: false,
      error: "invalid",
    });
  });

  it("keeps one team inside the published limits", () => {
    const decision = decideHold([], request(), settings, schedule);
    expect(decision.ok).toBe(true);
    if (!decision.ok) return;
    expect(decision.hold.expiresAt).toBe("2026-11-06T10:10:00.000Z");
    expect(decision.hold.teams).toBe(1);
  });

  it("stops a fifth team and a private slot that is already shared", () => {
    const existing: CapacityHold[] = [{
      id: "taken",
      idempotencyKey: "taken-key1",
      date: "2026-11-14",
      slot: "08:00",
      players: 16,
      teams: 4,
      privateSlot: false,
      expiresAt: "2026-11-06T11:00:00.000Z",
    }];
    expect(decideHold(existing, request(), settings, schedule)).toMatchObject({ ok: false, error: "unavailable" });
    expect(decideHold(existing, request({ privateSlot: true, idempotencyKey: "private-1" }), settings, schedule)).toMatchObject({ ok: false, error: "unavailable" });
  });

  it("ignores an expired hold and rejects a second team in one request", () => {
    const expired: CapacityHold[] = [{
      id: "old",
      idempotencyKey: "expired-1",
      date: "2026-11-14",
      slot: "08:00",
      players: 32,
      teams: 4,
      privateSlot: true,
      expiresAt: "2026-11-06T09:00:00.000Z",
    }];
    expect(decideHold(expired, request(), settings, schedule).ok).toBe(true);
    expect(decideHold([], request({ teams: 2 }), settings, schedule)).toMatchObject({ ok: false, error: "too-large" });
  });

  it("replays the same active key without taking another seat", () => {
    const existing: CapacityHold[] = [{
      id: "same",
      idempotencyKey: "hold-key-1",
      date: "2026-11-14",
      slot: "08:00",
      players: 6,
      teams: 1,
      privateSlot: false,
      expiresAt: "2026-11-06T10:10:00.000Z",
    }];
    expect(decideHold(existing, request(), settings, schedule)).toMatchObject({ ok: true, created: false });
  });
});
