import type { BusinessSettingsInput } from "@/lib/business/model";
import type { ScheduleCatalog } from "@/lib/schedule/model";

export function slotsOverlap(a: string, b: string, duration: number): boolean {
  if (!/^\d{2}:\d{2}$/.test(a) || !/^\d{2}:\d{2}$/.test(b)) return false;
  const minute = (time: string) => { const [hour, part] = time.split(":").map(Number); return hour * 60 + part; };
  return minute(a) < minute(b) + duration && minute(b) < minute(a) + duration;
}

export interface SlotUse {
  slot: string;
  players: number;
  teams: number;
  privateSlot: boolean;
  confirmed?: boolean;
}

export interface AvailabilityRequest {
  players: number;
  privateSlot: boolean;
}

export type DayTone = "open" | "limited" | "unavailable" | "undecided";

export interface SlotAvailability {
  start: string;
  end: string;
  closed: boolean;
  privateReservation: boolean;
  confirmed: boolean;
  freePhysicalSeats: number;
  bookableSeats: number;
  fitsRequest: boolean;
  statusLabel: string;
}

export interface DayAvailability {
  date: string;
  tone: DayTone;
  statusLabel: string;
  occupiedPlayers: number;
  confirmedSlots: number;
  activeCapacity: number;
  slots: SlotAvailability[];
}

const weekdayByIndex = ["nd", "pn", "wt", "sr", "cz", "pt", "sb"] as const;

export function warsawDate(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function addMinutes(start: string, minutes: number): string {
  const [hourText, minuteText] = start.split(":");
  const total = Number(hourText) * 60 + Number(minuteText) + minutes;
  const hour = Math.floor(total / 60) % 24;
  const minute = total % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function weekdayCode(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return weekdayByIndex[new Date(Date.UTC(year, month - 1, day, 12)).getUTCDay()];
}

export function shiftDate(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days, 12)).toISOString().slice(0, 10);
}

export function weekDates(anchor: string): string[] {
  const [year, month, day] = anchor.split("-").map(Number);
  const noon = new Date(Date.UTC(year, month - 1, day, 12));
  const monday = new Date(noon);
  monday.setUTCDate(noon.getUTCDate() - ((noon.getUTCDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, index) => shiftDate(monday.toISOString().slice(0, 10), index));
}

export function closureReason(schedule: ScheduleCatalog, date: string, slot: string): string | null {
  const match = schedule.blocks.find((block) => block.date === date && (block.slot === slot || block.slot === "day"));
  return match?.reason ?? null;
}

export function holdSummary(hold: { slot: string; players: number; teams: number; privateSlot: boolean; expiresAt: string }): string {
  const mode = hold.privateSlot ? "slot prywatny" : "gra wspólna";
  return `${hold.slot}: ${hold.players} graczy, drużyny: ${hold.teams}, ${mode}, wygasa ${warsawStamp(hold.expiresAt)}`;
}

function warsawStamp(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const pick = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${pick("year")}-${pick("month")}-${pick("day")} ${pick("hour")}:${pick("minute")}`;
}

export function laterDatesInMonth(
  date: string,
  settings: Pick<BusinessSettingsInput, "minPlayersPerBooking" | "maxPlayersPerTeam" | "maxTeamsPerMatch" | "maxPlayersPerSlot" | "slotStartTimes" | "slotDurationMinutes">,
  schedule: ScheduleCatalog,
  holds: readonly (SlotUse & { date: string })[],
  request: AvailabilityRequest,
  today: string,
  limit = 3,
): string[] {
  const [year, month] = date.split("-").map(Number);
  const found: string[] = [];
  for (const cell of monthCells(year, month)) {
    if (!cell.inMonth || cell.date <= date || cell.date < today) continue;
    const uses = holds.filter((hold) => hold.date === cell.date).map(({ slot, players, teams, privateSlot }) => ({ slot, players, teams, privateSlot }));
    const day = evaluateDay(cell.date, settings, schedule, uses, request, today);
    if (day.tone !== "unavailable" && day.slots.some((slot) => slot.fitsRequest)) found.push(cell.date);
    if (found.length >= limit) break;
  }
  return found;
}

export function monthCells(year: number, month: number): Array<{ date: string; inMonth: boolean }> {
  const first = (new Date(Date.UTC(year, month - 1, 1, 12)).getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(year, month, 0, 12)).getUTCDate();
  const cells: Array<{ date: string; inMonth: boolean }> = [];
  for (let index = 0; index < first; index += 1) cells.push({ date: "", inMonth: false });
  for (let day = 1; day <= days; day += 1) {
    cells.push({
      date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      inMonth: true,
    });
  }
  while (cells.length % 7 !== 0) cells.push({ date: "", inMonth: false });
  return cells;
}

function blocked(schedule: ScheduleCatalog, date: string, slot: string, duration: number): boolean {
  return schedule.blocks.some((block) => block.date === date && (block.slot === "day" || slotsOverlap(block.slot, slot, duration)));
}

export function evaluateDay(
  date: string,
  settings: Pick<BusinessSettingsInput, "minPlayersPerBooking" | "maxPlayersPerTeam" | "maxTeamsPerMatch" | "maxPlayersPerSlot" | "slotStartTimes" | "slotDurationMinutes">,
  schedule: ScheduleCatalog,
  reservations: readonly SlotUse[],
  request: AvailabilityRequest,
  today = warsawDate(),
): DayAvailability {
  const dayOpen = date >= today && schedule.weekdays.includes(weekdayCode(date) as ScheduleCatalog["weekdays"][number]);
  const slots = settings.slotStartTimes.map((start) => {
    const use = reservations.filter((item) => item.slot === start);
    const closed = blocked(schedule, date, start, settings.slotDurationMinutes);
    const usedPlayers = use.reduce((sum, item) => sum + item.players, 0);
    const privateReservation = use.some((item) => item.privateSlot);
    const confirmed = use.some((item) => item.confirmed);
    const freePhysicalSeats = closed || privateReservation ? 0 : Math.max(0, settings.maxPlayersPerSlot - usedPlayers);
    const bookableSeats = closed || privateReservation ? 0 : freePhysicalSeats;
    const fitsRequest = dayOpen && (request.privateSlot
      ? !closed && usedPlayers === 0 && request.players >= settings.minPlayersPerBooking && request.players <= settings.maxPlayersPerSlot
      : bookableSeats >= request.players && request.players >= settings.minPlayersPerBooking && request.players <= settings.maxPlayersPerSlot);
    return {
      start,
      end: addMinutes(start, settings.slotDurationMinutes),
      closed,
      privateReservation,
      confirmed,
      freePhysicalSeats,
      bookableSeats,
      fitsRequest,
      statusLabel: !closed && !dayOpen
        ? date < today ? "Termin minął" : schedule.weekdays.length === 0 ? "Harmonogram nieustalony" : "Dzień zamknięty"
        : slotLabel(closed, privateReservation, confirmed, bookableSeats, freePhysicalSeats, settings.maxPlayersPerSlot),
    };
  });
  const active = slots.filter((slot) => !slot.closed);
  const activeCapacity = active.length * settings.maxPlayersPerSlot;
  const occupiedPlayers = active.reduce((sum, slot) => {
    if (slot.privateReservation) return sum + settings.maxPlayersPerSlot;
    const used = reservations.filter((item) => item.slot === slot.start).reduce((total, item) => total + item.players, 0);
    return sum + used;
  }, 0);
  const tone = dayTone(date, schedule, slots, occupiedPlayers, activeCapacity, today);
  return { date, tone, statusLabel: dayLabel(tone), occupiedPlayers, confirmedSlots: slots.filter((slot) => slot.confirmed).length, activeCapacity, slots };
}

function slotLabel(closed: boolean, privateReservation: boolean, confirmed: boolean, bookable: number, physical: number, capacity: number): string {
  if (closed) return "Zablokowany";
  if (privateReservation) return "Slot prywatny";
  if (bookable <= 0) return "Brak miejsca dla kolejnej drużyny";
  if (physical < capacity) return "Częściowo zajęty";
  return "Wolny";
}

function dayTone(
  date: string,
  schedule: ScheduleCatalog,
  slots: readonly SlotAvailability[],
  occupied: number,
  activeCapacity: number,
  today: string,
): DayTone {
  if (date < today) return "unavailable";
  if (schedule.weekdays.length === 0) {
    return slots.length > 0 && slots.every((slot) => slot.closed) ? "unavailable" : "undecided";
  }
  if (!schedule.weekdays.includes(weekdayCode(date) as ScheduleCatalog["weekdays"][number])) return "unavailable";
  if (!slots.some((slot) => slot.fitsRequest)) return "unavailable";
  return occupied < activeCapacity / 2 ? "open" : "limited";
}

function dayLabel(tone: DayTone): string {
  if (tone === "open") return "Dostępny";
  if (tone === "limited") return "Ograniczona dostępność";
  if (tone === "undecided") return "Harmonogram nieustalony";
  return "Niedostępny";
}
