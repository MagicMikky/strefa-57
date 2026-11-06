"use client";

import { useEffect, useRef, useState } from "react";

import type { BusinessSettingsInput } from "@/lib/business/model";
import type { ScheduleCatalog } from "@/lib/schedule/model";
import { closureReason, evaluateDay, holdSummary, laterDatesInMonth, monthCells, shiftDate, weekDates, type DayTone, type SlotUse } from "@/lib/availability/model";

type CalendarSettings = Pick<
  BusinessSettingsInput,
  "maxPlayersPerTeam" | "maxTeamsPerMatch" | "maxPlayersPerSlot" | "slotStartTimes" | "slotDurationMinutes"
>;

export function AvailabilityCalendar({
  settings,
  schedule,
  today,
  holds = [],
  capacityKnown = true,
  allowPast = false,
  showOperations = false,
}: {
  settings: CalendarSettings;
  schedule: ScheduleCatalog;
  today: string;
  holds?: ReadonlyArray<SlotUse & { date: string; expiresAt?: string }>;
  capacityKnown?: boolean;
  allowPast?: boolean;
  showOperations?: boolean;
}) {
  const [cursor, setCursor] = useState(today.slice(0, 7));
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [weekAnchor, setWeekAnchor] = useState(today);
  const [dayAnchor, setDayAnchor] = useState(today);
  const [players, setPlayers] = useState(4);
  const [privateSlot, setPrivateSlot] = useState(false);
  const [selected, setSelected] = useState("");
  const closeRef = useRef<HTMLButtonElement>(null);
  const [year, month] = cursor.split("-").map(Number);
  const cells = monthCells(year, month);
  const selectedDay = selected
    ? evaluateDay(selected, settings, schedule, usesOn(holds, selected), { players, privateSlot }, today)
    : null;

  useEffect(() => {
    if (!selected) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected("");
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected]);

  function moveCursor(direction: -1 | 1) {
    if (view === "month") setCursor(shiftMonth(cursor, direction));
    if (view === "week") setWeekAnchor(shiftDate(weekAnchor, direction * 7));
    if (view === "day") setDayAnchor(shiftDate(dayAnchor, direction));
  }

  return (
    <div className="availability">
      <p className="availability__notice">Ten widok nie tworzy rezerwacji, blokady terminu ani płatności. Wybrany slot otwiera zwykłe zapytanie.</p>
      {capacityKnown ? null : <p className="availability__notice">Nie udało się odczytać blokad pojemności. Kolory nie potwierdzają wolnych miejsc.</p>}
      {schedule.weekdays.length === 0 ? (
        <p className="availability__notice">Dni tygodnia nie zostały jeszcze opublikowane, więc kalendarz nie oznacza ich jako otwarte.</p>
      ) : null}
      <div className="availability__filters">
        <label>
          Gracze w jednej drużynie
          <input min={1} max={settings.maxPlayersPerTeam} type="number" value={players} onChange={(event) => setPlayers(clampPlayers(event.target.value, settings.maxPlayersPerTeam))} />
        </label>
        <fieldset>
          <legend>Rodzaj gry</legend>
          <label><input checked={!privateSlot} name="slot-mode" type="radio" onChange={() => setPrivateSlot(false)} /> Gra wspólna</label>
          <label><input checked={privateSlot} name="slot-mode" type="radio" onChange={() => setPrivateSlot(true)} /> Prywatny slot</label>
        </fieldset>
      </div>
      <div className="availability__nav">
        <button type="button" aria-pressed={view === "month"} onClick={() => setView("month")}>Miesiąc</button>
        <button type="button" aria-pressed={view === "week"} onClick={() => setView("week")}>Tydzień</button>
        <button type="button" aria-pressed={view === "day"} onClick={() => setView("day")}>Dzień</button>
        <button type="button" onClick={() => moveCursor(-1)}>Poprzedni</button>
        <strong>{view === "month" ? monthName(year, month) : view === "week" ? `${weekDates(weekAnchor)[0]} – ${weekDates(weekAnchor)[6]}` : dayAnchor}</strong>
        <button type="button" onClick={() => { setCursor(today.slice(0, 7)); setWeekAnchor(today); setDayAnchor(today); }}>Dziś</button>
        <button type="button" onClick={() => moveCursor(1)}>Następny</button>
      </div>
      <div className="availability__legend">
        <span><i className="is-open" /> Dostępny</span>
        <span><i className="is-limited" /> Od połowy pojemności</span>
        <span><i className="is-unavailable" /> Niedostępny</span>
        <span><i className="is-undecided" /> Nieustalony</span>
      </div>
      {view === "month" ? (
        <>
          <div className="availability__weekdays" aria-hidden="true">
            {["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"].map((day) => <span key={day}>{day}</span>)}
          </div>
          <div className="availability__grid">
            {cells.map((cell, index) => cell.inMonth ? (
              <DayButton key={cell.date} allowPast={allowPast} date={cell.date} holds={holds} players={players} privateSlot={privateSlot} schedule={schedule} settings={settings} today={today} onSelect={setSelected} />
            ) : <span key={`empty-${index}`} />)}
          </div>
        </>
      ) : (
        <div className="availability__days">
          {(view === "week" ? weekDates(weekAnchor) : [dayAnchor]).map((date) => (
            <DaySlots key={date} capacityKnown={capacityKnown} date={date} holds={holds} players={players} privateSlot={privateSlot} schedule={schedule} settings={settings} showOperations={showOperations} suggest={view === "day"} today={today} />
          ))}
        </div>
      )}
      {selectedDay ? (
        <div className="availability__dialog" role="dialog" aria-modal="true" aria-labelledby="availability-dialog-title">
          <div className="availability__sheet">
            <button ref={closeRef} type="button" onClick={() => setSelected("")}>Zamknij</button>
            <h2 id="availability-dialog-title">{selectedDay.date}</h2>
            <p>{selectedDay.statusLabel}. Zajęte {selectedDay.occupiedPlayers} z {selectedDay.activeCapacity} miejsc w otwartych slotach.</p>
            <ul>
              {selectedDay.slots.map((slot) => (
                <li key={slot.start}>
                  <strong>{slot.start}–{slot.end}</strong>
                  <span>{slot.statusLabel}. Wolne fizycznie: {slot.freePhysicalSeats}/{settings.maxPlayersPerSlot}. Dla kolejnej drużyny: {slot.bookableSeats}.{showOperations && slot.closed ? ` Powód: ${closureReason(schedule, selectedDay.date, slot.start) ?? "niepodany"}.` : ""}</span>
                  {selectedDay.date >= today && slot.fitsRequest ? (
                    <a href={inquiryHref(selectedDay.date, { slot: slot.start, players, privateSlot })}>Zapytaj o ten slot</a>
                  ) : <em>Niedostępny dla wybranej grupy</em>}
                </li>
              ))}
            </ul>
            {showOperations ? <Operations capacityKnown={capacityKnown} date={selectedDay.date} holds={holds} schedule={schedule} /> : null}
            {selectedDay.slots.some((slot) => slot.fitsRequest) ? null : (
              <LaterDates date={selectedDay.date} holds={holds} players={players} privateSlot={privateSlot} schedule={schedule} settings={settings} today={today} />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DaySlots({
  date,
  settings,
  schedule,
  holds,
  players,
  privateSlot,
  today,
  suggest,
  showOperations,
  capacityKnown,
}: {
  date: string;
  settings: CalendarSettings;
  schedule: ScheduleCatalog;
  holds: ReadonlyArray<SlotUse & { date: string; expiresAt?: string }>;
  players: number;
  privateSlot: boolean;
  today: string;
  suggest: boolean;
  showOperations: boolean;
  capacityKnown: boolean;
}) {
  const day = evaluateDay(date, settings, schedule, usesOn(holds, date), { players, privateSlot }, today);
  return (
    <article>
      <h2>{date} <small>{day.statusLabel}</small></h2>
      <ul>
        {day.slots.map((slot) => (
          <li key={slot.start}>
            <span>{slot.start}–{slot.end}. {date < today ? "Dzień minął" : slot.statusLabel}. Wolne fizycznie: {slot.freePhysicalSeats}/{settings.maxPlayersPerSlot}. Dla kolejnej drużyny: {slot.bookableSeats}.{showOperations && slot.closed ? ` Powód: ${closureReason(schedule, date, slot.start) ?? "niepodany"}.` : ""}</span>
            {date >= today && slot.fitsRequest ? <a href={inquiryHref(date, { slot: slot.start, players, privateSlot })}>Zapytaj o ten slot</a> : <em>Niedostępny dla wybranej grupy</em>}
          </li>
        ))}
      </ul>
      {showOperations ? <Operations capacityKnown={capacityKnown} date={date} holds={holds} schedule={schedule} /> : null}
      {suggest && !day.slots.some((slot) => slot.fitsRequest) ? (
        <LaterDates date={date} holds={holds} players={players} privateSlot={privateSlot} schedule={schedule} settings={settings} today={today} />
      ) : null}
    </article>
  );
}

function Operations({
  date,
  schedule,
  holds,
  capacityKnown,
}: {
  date: string;
  schedule: ScheduleCatalog;
  holds: ReadonlyArray<SlotUse & { date: string; expiresAt?: string }>;
  capacityKnown: boolean;
}) {
  const lines = holds.filter((hold) => hold.date === date && hold.expiresAt).map((hold) => holdSummary({ ...hold, expiresAt: hold.expiresAt ?? "" }));
  const closures = schedule.blocks.filter((block) => block.date === date);
  return (
    <div>
      <h3>Blokady pojemności</h3>
      {capacityKnown ? lines.length === 0 ? <p>Brak niewygasłych blokad pojemności.</p> : <ul>{lines.map((line, index) => <li key={`${line}-${index}`}>{line}</li>)}</ul> : <p>Odczyt blokad pojemności nie powiódł się.</p>}
      {closures.map((block) => <p key={`${block.slot}-${block.reason}`}>Zamknięcie {block.slot === "day" ? "całego dnia" : block.slot}: {block.reason}</p>)}
    </div>
  );
}

function LaterDates({
  date,
  settings,
  schedule,
  holds,
  players,
  privateSlot,
  today,
}: {
  date: string;
  settings: CalendarSettings;
  schedule: ScheduleCatalog;
  holds: ReadonlyArray<SlotUse & { date: string }>;
  players: number;
  privateSlot: boolean;
  today: string;
}) {
  const dates = laterDatesInMonth(date, settings, schedule, holds, { players, privateSlot }, today);
  if (dates.length === 0) return <p>W tym miesiącu nie ma późniejszego dnia dla tej grupy.</p>;
  return (
    <div>
      <p>Inne dni w tym samym miesiącu</p>
      <ul>
        {dates.map((item) => <li key={item}><a href={inquiryHref(item, { players, privateSlot })}>Zapytaj o {item}</a></li>)}
      </ul>
    </div>
  );
}

function DayButton({
  date,
  settings,
  schedule,
  holds,
  players,
  privateSlot,
  today,
  allowPast,
  onSelect,
}: {
  date: string;
  settings: CalendarSettings;
  schedule: ScheduleCatalog;
  holds: ReadonlyArray<SlotUse & { date: string }>;
  players: number;
  privateSlot: boolean;
  today: string;
  allowPast: boolean;
  onSelect: (date: string) => void;
}) {
  const day = evaluateDay(date, settings, schedule, usesOn(holds, date), { players, privateSlot }, today);
  const dayNumber = String(Number(date.slice(-2)));
  const past = date < today && !allowPast;
  return (
    <button className={toneClass(day.tone)} disabled={past} type="button" onClick={() => onSelect(date)}>
      <b>{dayNumber}</b>
      <small>{shortLabel(day.tone)}</small>
      <span className="sr-only">{date}, {day.statusLabel}</span>
    </button>
  );
}

function inquiryHref(date: string, options: { slot?: string; players: number; privateSlot: boolean }): string {
  const query = [`data=${date}`, `gracze=${options.players}`];
  if (options.slot) query.push(`slot=${options.slot}`);
  if (options.privateSlot) query.push("tryb=prywatny");
  return `/zapytaj-o-termin?${query.join("&")}`;
}

function usesOn(holds: ReadonlyArray<SlotUse & { date: string; expiresAt?: string }>, date: string): SlotUse[] {
  return holds.filter((hold) => hold.date === date).map(({ slot, players, teams, privateSlot }) => ({ slot, players, teams, privateSlot }));
}

function toneClass(tone: DayTone): string {
  return `availability__day is-${tone}`;
}

function shortLabel(tone: DayTone): string {
  if (tone === "open") return "Dostępny";
  if (tone === "limited") return "Częściowo";
  if (tone === "undecided") return "Nieustalony";
  return "Niedostępny";
}

function clampPlayers(value: string, max: number): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return 1;
  return Math.min(max, Math.max(1, parsed));
}

function shiftMonth(cursor: string, delta: number): string {
  const [year, month] = cursor.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthName(year: number, month: number): string {
  return new Intl.DateTimeFormat("pl-PL", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, 1)));
}
