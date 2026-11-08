import { plainText } from "@/lib/business/model";

export const WEEKDAYS = ["pn", "wt", "sr", "cz", "pt", "sb", "nd"] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export interface ScheduleBlock {
  date: string;
  slot: string;
  reason: string;
}

export interface ScheduleCatalog {
  weekdays: Weekday[];
  blocks: ScheduleBlock[];
}

export function fallbackSchedule(): ScheduleCatalog {
  return { weekdays: ["pn", "wt", "sr", "cz", "pt"], blocks: [] };
}

function realDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function normalizeSchedule(
  input: unknown,
  slotStartTimes: readonly string[],
): { ok: true; value: ScheduleCatalog } | { ok: false; error: string } {
  if (!input || typeof input !== "object") return { ok: false, error: "Brak harmonogramu." };
  const source = input as ScheduleCatalog & { equipmentSets?: unknown };
  if ("equipmentSets" in source && source.equipmentSets != null) {
    return { ok: false, error: "Liczba zestawów pozostaje nieustalona." };
  }
  if (!Array.isArray(source.weekdays) || source.weekdays.length > WEEKDAYS.length) {
    return { ok: false, error: "Dni tygodnia mają nieprawidłowy format." };
  }
  const weekdays: Weekday[] = [];
  for (const day of source.weekdays) {
    if (!(WEEKDAYS as readonly string[]).includes(day) || weekdays.includes(day as Weekday)) {
      return { ok: false, error: "Dzień tygodnia jest niedozwolony albo powtórzony." };
    }
    weekdays.push(day as Weekday);
  }
  if (!Array.isArray(source.blocks) || source.blocks.length > 200) {
    return { ok: false, error: "Można zapisać najwyżej 200 blokad." };
  }
  const blocks: ScheduleBlock[] = [];
  const seen = new Set<string>();
  for (const block of source.blocks) {
    if (!block || typeof block.date !== "string" || !realDate(block.date)) {
      return { ok: false, error: "Data blokady musi mieć format RRRR-MM-DD." };
    }
    if (block.slot !== "day" && !slotStartTimes.includes(block.slot)) {
      return { ok: false, error: "Blokada dotyczy całego dnia albo jednego ze skonfigurowanych startów." };
    }
    const reason = plainText(String(block.reason ?? ""), 200, "Powód blokady");
    if (typeof reason !== "string") return { ok: false, error: reason.error };
    if (!reason) return { ok: false, error: "Podaj powód blokady." };
    const key = `${block.date}|${block.slot}`;
    if (seen.has(key)) return { ok: false, error: "Ta data i ten slot są już zablokowane." };
    seen.add(key);
    blocks.push({ date: block.date, slot: block.slot, reason });
  }
  blocks.sort((left, right) => left.date.localeCompare(right.date) || left.slot.localeCompare(right.slot));
  return { ok: true, value: { weekdays, blocks } };
}

export function selectPublishedSchedule(published: ScheduleCatalog | null, fallback: ScheduleCatalog) {
  return published ?? fallback;
}
