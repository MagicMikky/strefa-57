"use client";

import { useEffect, useRef, useState } from "react";

import type { BusinessSettingsInput } from "@/lib/business/model";
import type { ScheduleCatalog } from "@/lib/schedule/model";
import { closureReason, evaluateDay, holdSummary, laterDatesInMonth, monthCells, shiftDate, slotsOverlap, weekDates, type DayTone, type SlotUse } from "@/lib/availability/model";

type CalendarSettings = Pick<
  BusinessSettingsInput,
  "minPlayersPerBooking" | "maxPlayersPerTeam" | "maxTeamsPerMatch" | "maxPlayersPerSlot" | "slotStartTimes" | "slotDurationMinutes"
>;

export function AvailabilityCalendar({
  settings,
  schedule,
  today,
  holds = [],
  confirmedSlots = [],
  capacityKnown = true,
  allowPast = false,
  showOperations = false,
}: {
  settings: CalendarSettings;
  schedule: ScheduleCatalog;
  today: string;
  holds?: ReadonlyArray<SlotUse & { date: string; expiresAt?: string }>;
  confirmedSlots?: ReadonlyArray<{ date: string; slot: string; players: number; privateSlot: boolean }>;
  capacityKnown?: boolean;
  allowPast?: boolean;
  showOperations?: boolean;
}) {
  const [cursor, setCursor] = useState(today.slice(0, 7));
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [weekAnchor, setWeekAnchor] = useState(today);
  const [dayAnchor, setDayAnchor] = useState(today);
  const [players, setPlayers] = useState(settings.minPlayersPerBooking);
  const [privateSlot, setPrivateSlot] = useState(true);
  const [selected, setSelected] = useState("");
  const uses = [
    ...holds,
    ...confirmedSlots.flatMap(({ date, slot, players, privateSlot }) => settings.slotStartTimes
      .filter((start) => slotsOverlap(start, slot, settings.slotDurationMinutes))
      .map((start) => ({ date, slot: start, players: start === slot ? players : settings.maxPlayersPerSlot, teams: 1, privateSlot: start === slot ? privateSlot : true, confirmed: true }))),
  ];
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [year, month] = cursor.split("-").map(Number);
  const cells = monthCells(year, month);
  const selectedDay = selected
    ? evaluateDay(selected, settings, schedule, usesOn(uses, selected), { players, privateSlot }, today)
    : null;

  useEffect(() => {
    if (!selected) return;
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected("");
      if (event.key === "Tab") {
        const controls = Array.from(sheetRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]') ?? []);
        if (controls.length === 0) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      openerRef.current?.focus();
    };
  }, [selected]);

  function moveCursor(direction: -1 | 1) {
    if (view === "month") setCursor(shiftMonth(cursor, direction));
    if (view === "week") setWeekAnchor(shiftDate(weekAnchor, direction * 7));
    if (view === "day") setDayAnchor(shiftDate(dayAnchor, direction));
  }

  return (
    <section className="availability" aria-label="Kalendarz dostępności">
      <div className="availability__intro">
        <div>
          <span className="availability__eyebrow">Kalendarz terminów</span>
          <h2>Znajdź dogodny termin</h2>
          <p>Wybierz liczbę graczy i rodzaj gry, a następnie sprawdź godziny dla wybranego dnia.</p>
        </div>
        <span className="availability__intro-mark" aria-hidden="true">29</span>
      </div>
      {capacityKnown ? null : <p className="availability__notice" role="alert">Nie udało się odczytać zajętych terminów. Dostępność jest chwilowo nieznana.</p>}
      {schedule.weekdays.length === 0 ? (
        <p className="availability__notice">Dni tygodnia nie zostały jeszcze opublikowane, więc kalendarz nie oznacza ich jako otwarte.</p>
      ) : null}
      <div className="availability__filters" aria-label="Ustawienia grupy">
        <label>
          <span>Liczba graczy w grupie</span>
          <input min={settings.minPlayersPerBooking} max={settings.maxPlayersPerSlot} type="number" value={players} onChange={(event) => setPlayers(clampPlayers(event.target.value, settings.minPlayersPerBooking, settings.maxPlayersPerSlot))} />
        </label>
        <fieldset>
          <legend>Rodzaj gry</legend>
          <div className="availability__mode-options">
            <label><input checked={privateSlot} name="slot-mode" type="radio" onChange={() => setPrivateSlot(true)} /> <span>Na wyłączność</span></label>
            <label><input checked={!privateSlot} name="slot-mode" type="radio" onChange={() => setPrivateSlot(false)} /> <span>Mogą dołączyć inni (bez dopłaty)</span></label>
          </div>
        </fieldset>
      </div>
      <div className="availability__toolbar">
        <div className="availability__views" aria-label="Widok kalendarza">
          <button type="button" aria-pressed={view === "month"} onClick={() => setView("month")}>Miesiąc</button>
          <button type="button" aria-pressed={view === "week"} onClick={() => setView("week")}>Tydzień</button>
          <button type="button" aria-pressed={view === "day"} onClick={() => setView("day")}>Dzień</button>
        </div>
        <div className="availability__nav">
          <button type="button" aria-label="Poprzedni okres" onClick={() => moveCursor(-1)}>‹</button>
          <strong aria-live="polite">{view === "month" ? monthName(year, month) : view === "week" ? `${weekDates(weekAnchor)[0]} – ${weekDates(weekAnchor)[6]}` : dayAnchor}</strong>
          <button type="button" aria-label="Następny okres" onClick={() => moveCursor(1)}>›</button>
          <button className="availability__today" type="button" onClick={() => { setCursor(today.slice(0, 7)); setWeekAnchor(today); setDayAnchor(today); }}>Dziś</button>
        </div>
      </div>
      <div className="availability__legend">
        <span><i className="is-open" /> Dostępny</span>
        <span><i className="is-limited" /> Mało miejsc</span>
        <span><i className="is-unavailable" /> Niedostępny</span>
        <span><i className="is-undecided" /> Nieustalony</span>
        <span><i className="is-confirmed" /> Potwierdzony slot</span>
      </div>
      {view === "month" ? (
        <>
          <div className="availability__weekdays" aria-hidden="true">
            {["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"].map((day) => <span key={day}>{day}</span>)}
          </div>
          <div className="availability__grid">
            {cells.map((cell, index) => cell.inMonth ? (
              <DayButton key={cell.date} allowPast={allowPast} capacityKnown={capacityKnown} date={cell.date} holds={uses} players={players} privateSlot={privateSlot} schedule={schedule} settings={settings} today={today} onSelect={setSelected} />
            ) : <span className="availability__empty" key={`empty-${index}`} />)}
          </div>
        </>
      ) : (
        <div className="availability__days">
          {(view === "week" ? weekDates(weekAnchor) : [dayAnchor]).map((date) => (
            <DaySlots key={date} capacityKnown={capacityKnown} date={date} holds={uses} players={players} privateSlot={privateSlot} schedule={schedule} settings={settings} showOperations={showOperations} suggest={view === "day"} today={today} />
          ))}
        </div>
      )}
      {selectedDay ? (
        <div className="availability__dialog" role="dialog" aria-modal="true" aria-labelledby="availability-dialog-title">
          <div className="availability__sheet" ref={sheetRef}>
            <button className="availability__close" ref={closeRef} type="button" onClick={() => setSelected("")}>Zamknij <span aria-hidden="true">×</span></button>
            <span className="availability__eyebrow">Dostępność godzin</span>
            <h2 id="availability-dialog-title">{formatDate(selectedDay.date)}</h2>
            <p className="availability__sheet-lead">{capacityKnown ? selectedDay.statusLabel : "Dostępność nieznana"}. {capacityKnown ? "Wybierz godzinę zgodną z wielkością i trybem grupy." : "Spróbuj ponownie później."}</p>
            <ul>
              {selectedDay.slots.map((slot) => (
                <li className="availability__slot" key={slot.start}>
                  <div><strong>{slot.start}–{slot.end}</strong><span className={slot.fitsRequest && capacityKnown ? "availability__slot-state is-open" : "availability__slot-state is-unavailable"}>{capacityKnown ? slot.statusLabel : "Nieznany"}</span></div>
                  <span>{capacityKnown && slot.fitsRequest ? `Wolnych miejsc: ${slot.bookableSeats}` : slot.privateReservation ? "Termin zajęty" : "Brak dostępności dla wybranej grupy"}.{showOperations && slot.closed ? ` Powód: ${closureReason(schedule, selectedDay.date, slot.start) ?? "niepodany"}.` : ""}</span>
                  {capacityKnown && selectedDay.date >= today && slot.fitsRequest ? (
                    <a href={inquiryHref(selectedDay.date, { slot: slot.start, players, privateSlot })}>Zapytaj o ten slot</a>
                  ) : <em>Niedostępny dla wybranej grupy</em>}
                </li>
              ))}
            </ul>
            {showOperations ? <Operations capacityKnown={capacityKnown} date={selectedDay.date} holds={uses} schedule={schedule} /> : null}
            {!capacityKnown || selectedDay.slots.some((slot) => slot.fitsRequest) ? null : (
              <LaterDates date={selectedDay.date} holds={uses} players={players} privateSlot={privateSlot} schedule={schedule} settings={settings} today={today} />
            )}
          </div>
        </div>
      ) : null}
      <p className="availability__footer">Wybranie terminu otwiera zapytanie. Termin jest zajęty dopiero po potwierdzeniu przez obsługę.</p>
    </section>
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
    <article className="availability__day-panel">
      <h2>{formatDate(date)} <small>{capacityKnown ? day.statusLabel : "Dostępność nieznana"}</small></h2>
      <ul>
        {day.slots.map((slot) => (
          <li className="availability__slot" key={slot.start}>
            <div><strong>{slot.start}–{slot.end}</strong><span className={capacityKnown && slot.fitsRequest ? "availability__slot-state is-open" : "availability__slot-state is-unavailable"}>{capacityKnown ? slot.statusLabel : "Nieznany"}</span></div>
            <span>{capacityKnown && slot.fitsRequest ? `Wolnych miejsc dla drużyny: ${slot.bookableSeats}` : slot.confirmed || slot.privateReservation ? "Termin zajęty" : "Brak dostępności dla wybranej grupy"}.{showOperations && slot.closed ? ` Powód: ${closureReason(schedule, date, slot.start) ?? "niepodany"}.` : ""}</span>
            {capacityKnown && date >= today && slot.fitsRequest ? <a href={inquiryHref(date, { slot: slot.start, players, privateSlot })}>Zapytaj o ten slot</a> : <em>Niedostępny dla wybranej grupy</em>}
          </li>
        ))}
      </ul>
      {showOperations ? <Operations capacityKnown={capacityKnown} date={date} holds={holds} schedule={schedule} /> : null}
      {capacityKnown && suggest && !day.slots.some((slot) => slot.fitsRequest) ? (
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
  const confirmations = holds.filter((hold) => hold.date === date && !hold.expiresAt);
  const closures = schedule.blocks.filter((block) => block.date === date);
  return (
    <div>
      <h3>Zajęte terminy i blokady</h3>
      {confirmations.map((item) => <p key={item.slot}>Potwierdzona wizyta: {item.slot} — cały slot zajęty.</p>)}
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
  capacityKnown,
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
  capacityKnown: boolean;
  onSelect: (date: string) => void;
}) {
  const day = evaluateDay(date, settings, schedule, usesOn(holds, date), { players, privateSlot }, today);
  const tone = capacityKnown ? day.tone : "undecided";
  const dayNumber = String(Number(date.slice(-2)));
  const past = date < today && !allowPast;
  return (
    <button className={`${toneClass(tone)}${date === today ? " is-today" : ""}`} disabled={past} type="button" onClick={() => onSelect(date)}>
      <b>{dayNumber}</b>
      <small>{capacityKnown ? shortLabel(tone) : "Nieznany"}</small>
      {capacityKnown && day.confirmedSlots > 0 ? <span className="availability__confirmed-count" aria-hidden="true"><span>{day.confirmedSlots}</span><span className="availability__confirmed-word"> {day.confirmedSlots === 1 ? "zajęty" : "zajęte"}</span></span> : null}
      <span className="sr-only">{formatDate(date)}, {capacityKnown ? day.statusLabel : "Dostępność nieznana"}{capacityKnown && day.confirmedSlots > 0 ? `, ${day.confirmedSlots} potwierdzonych slotów` : ""}</span>
    </button>
  );
}

function inquiryHref(date: string, options: { slot?: string; players: number; privateSlot: boolean }): string {
  const query = [`data=${date}`, `gracze=${options.players}`];
  if (options.slot) query.push(`slot=${options.slot}`);
  query.push(`tryb=${options.privateSlot ? "prywatny" : "wspolny"}`);
  return `/zapytaj-o-termin?${query.join("&")}`;
}

function usesOn(holds: ReadonlyArray<SlotUse & { date: string; expiresAt?: string }>, date: string): SlotUse[] {
  return holds.filter((hold) => hold.date === date).map(({ slot, players, teams, privateSlot, confirmed }) => ({ slot, players, teams, privateSlot, confirmed }));
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

function clampPlayers(value: string, min: number, max: number): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return min;
  return Math.min(max, Math.max(min, parsed));
}

function shiftMonth(cursor: string, delta: number): string {
  const [year, month] = cursor.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthName(year: number, month: number): string {
  return new Intl.DateTimeFormat("pl-PL", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function formatDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("pl-PL", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, day)));
}
