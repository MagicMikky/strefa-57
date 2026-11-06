"use client";

import { useEffect, useRef, useState } from "react";

import type { BusinessSettingsInput } from "@/lib/business/model";
import type { ScheduleCatalog } from "@/lib/schedule/model";
import { evaluateDay, monthCells, type DayTone } from "@/lib/availability/model";

type CalendarSettings = Pick<
  BusinessSettingsInput,
  "maxPlayersPerTeam" | "maxTeamsPerMatch" | "maxPlayersPerSlot" | "slotStartTimes" | "slotDurationMinutes"
>;

export function AvailabilityCalendar({
  settings,
  schedule,
  today,
}: {
  settings: CalendarSettings;
  schedule: ScheduleCatalog;
  today: string;
}) {
  const [cursor, setCursor] = useState(today.slice(0, 7));
  const [players, setPlayers] = useState(4);
  const [privateSlot, setPrivateSlot] = useState(false);
  const [selected, setSelected] = useState("");
  const closeRef = useRef<HTMLButtonElement>(null);
  const [year, month] = cursor.split("-").map(Number);
  const cells = monthCells(year, month);
  const selectedDay = selected
    ? evaluateDay(selected, settings, schedule, [], { players, privateSlot }, today)
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

  return (
    <div className="availability">
      <p className="availability__notice">Ten widok nie tworzy rezerwacji, blokady terminu ani płatności. Wybrany slot otwiera zwykłe zapytanie.</p>
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
        <button type="button" onClick={() => setCursor(shiftMonth(cursor, -1))}>Poprzedni</button>
        <strong>{monthName(year, month)}</strong>
        <button type="button" onClick={() => setCursor(today.slice(0, 7))}>Dziś</button>
        <button type="button" onClick={() => setCursor(shiftMonth(cursor, 1))}>Następny</button>
      </div>
      <div className="availability__legend">
        <span><i className="is-open" /> Dostępny</span>
        <span><i className="is-limited" /> Od połowy pojemności</span>
        <span><i className="is-unavailable" /> Niedostępny</span>
        <span><i className="is-undecided" /> Nieustalony</span>
      </div>
      <div className="availability__weekdays" aria-hidden="true">
        {["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"].map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="availability__grid">
        {cells.map((cell, index) => cell.inMonth ? (
          <DayButton key={cell.date} date={cell.date} players={players} privateSlot={privateSlot} schedule={schedule} settings={settings} today={today} onSelect={setSelected} />
        ) : <span key={`empty-${index}`} />)}
      </div>
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
                  <span>{slot.statusLabel}. Wolne fizycznie: {slot.freePhysicalSeats}/{settings.maxPlayersPerSlot}. Dla kolejnej drużyny: {slot.bookableSeats}.</span>
                  {slot.fitsRequest ? (
                    <a href={`/zapytaj-o-termin?data=${selectedDay.date}`}>Zapytaj o ten slot</a>
                  ) : <em>Niedostępny dla wybranej grupy</em>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DayButton({
  date,
  settings,
  schedule,
  players,
  privateSlot,
  today,
  onSelect,
}: {
  date: string;
  settings: CalendarSettings;
  schedule: ScheduleCatalog;
  players: number;
  privateSlot: boolean;
  today: string;
  onSelect: (date: string) => void;
}) {
  const day = evaluateDay(date, settings, schedule, [], { players, privateSlot }, today);
  const dayNumber = String(Number(date.slice(-2)));
  return (
    <button className={toneClass(day.tone)} type="button" onClick={() => onSelect(date)}>
      <b>{dayNumber}</b>
      <small>{shortLabel(day.tone)}</small>
      <span className="sr-only">{date}, {day.statusLabel}</span>
    </button>
  );
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
