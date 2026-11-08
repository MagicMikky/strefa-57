import { evaluateDay, warsawDate, type SlotUse } from "@/lib/availability/model";
import type { BusinessSettingsInput } from "@/lib/business/model";
import type { ScheduleCatalog } from "@/lib/schedule/model";

export interface CapacityHold {
  id: string;
  idempotencyKey: string;
  date: string;
  slot: string;
  players: number;
  teams: number;
  privateSlot: boolean;
  expiresAt: string;
}

export interface HoldRequest {
  idempotencyKey: string;
  date: string;
  slot: string;
  players: number;
  teams: number;
  privateSlot: boolean;
  holdMinutes: number | null;
  now: Date;
}

export type HoldDecision =
  | { ok: true; hold: CapacityHold; created: boolean; replacedId?: string }
  | { ok: false; error: "hold-duration-unapproved" | "invalid" | "too-large" | "unavailable" };

type CapacitySettings = Pick<BusinessSettingsInput, "maxPlayersPerTeam" | "maxTeamsPerMatch" | "maxPlayersPerSlot" | "slotStartTimes" | "slotDurationMinutes">;

const keyPattern = /^[A-Za-z0-9_-]{8,80}$/;

export function activeHolds(holds: readonly CapacityHold[], now: Date): CapacityHold[] {
  const cutoff = now.toISOString();
  return holds.filter((hold) => hold.expiresAt > cutoff);
}

export function decideHold(
  existing: readonly CapacityHold[],
  request: HoldRequest,
  settings: CapacitySettings,
  schedule: ScheduleCatalog,
): HoldDecision {
  if (request.holdMinutes == null) return { ok: false, error: "hold-duration-unapproved" };
  if (!keyPattern.test(request.idempotencyKey) || !realDate(request.date) || !settings.slotStartTimes.includes(request.slot)) {
    return { ok: false, error: "invalid" };
  }
  if (!Number.isInteger(request.holdMinutes) || request.holdMinutes < 1 || request.holdMinutes > 240) {
    return { ok: false, error: "invalid" };
  }
  if (!Number.isInteger(request.players) || !Number.isInteger(request.teams) || request.teams !== 1 || request.players < 1 || request.players > settings.maxPlayersPerTeam) {
    return { ok: false, error: "too-large" };
  }
  const prior = existing.find((hold) => hold.idempotencyKey === request.idempotencyKey);
  if (prior && prior.expiresAt > request.now.toISOString()) {
    return sameParty(prior, request) ? { ok: true, hold: prior, created: false } : { ok: false, error: "invalid" };
  }
  if (request.date < warsawDate(request.now) || schedule.weekdays.length === 0 || !schedule.weekdays.includes(weekday(request.date))) {
    return { ok: false, error: "unavailable" };
  }
  const uses: SlotUse[] = activeHolds(existing, request.now)
    .filter((hold) => hold.date === request.date && hold.idempotencyKey !== request.idempotencyKey)
    .map((hold) => ({ slot: hold.slot, players: hold.players, teams: hold.teams, privateSlot: hold.privateSlot }));
  const day = evaluateDay(request.date, settings, schedule, uses, { players: request.players, privateSlot: request.privateSlot }, warsawDate(request.now));
  const slot = day.slots.find((item) => item.start === request.slot);
  if (!slot?.fitsRequest) return { ok: false, error: "unavailable" };
  return {
    ok: true,
    created: true,
    replacedId: prior?.id,
    hold: {
      id: prior?.id ?? request.idempotencyKey,
      idempotencyKey: request.idempotencyKey,
      date: request.date,
      slot: request.slot,
      players: request.players,
      teams: 1,
      privateSlot: request.privateSlot,
      expiresAt: new Date(request.now.getTime() + request.holdMinutes * 60_000).toISOString(),
    },
  };
}

function sameParty(hold: CapacityHold, request: HoldRequest): boolean {
  return hold.date === request.date && hold.slot === request.slot && hold.players === request.players && hold.teams === request.teams && hold.privateSlot === request.privateSlot;
}

function realDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function weekday(date: string): ScheduleCatalog["weekdays"][number] {
  const [year, month, day] = date.split("-").map(Number);
  return ["nd", "pn", "wt", "sr", "cz", "pt", "sb"][new Date(Date.UTC(year, month - 1, day, 12)).getUTCDay()] as ScheduleCatalog["weekdays"][number];
}
