import Link from "next/link";

import { publishScheduleAction, saveScheduleAction } from "@/app/panel/(app)/harmonogram/actions";
import { fallbackBusiness, initialBusinessSettings } from "@/lib/business/model";
import { readPublished } from "@/lib/business/store";
import { getPrisma } from "@/lib/prisma";
import { fallbackSchedule, WEEKDAYS } from "@/lib/schedule/model";
import { readScheduleDraftVersion, readScheduleSlot } from "@/lib/schedule/store";
import { requireStaff } from "@/lib/staff/session";

export const dynamic = "force-dynamic";

const labels: Record<(typeof WEEKDAYS)[number], string> = {
  pn: "Poniedziałek",
  wt: "Wtorek",
  sr: "Środa",
  cz: "Czwartek",
  pt: "Piątek",
  sb: "Sobota",
  nd: "Niedziela",
};

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireStaff("business.publish");
  const query = await searchParams;
  const db = getPrisma();
  const company = (await readPublished(db)) ?? fallbackBusiness();
  const settings = company.settings ?? initialBusinessSettings;
  const [storedDraft, draftVersion] = await Promise.all([
    readScheduleSlot(db, "draft", settings.slotStartTimes),
    readScheduleDraftVersion(db),
  ]);
  const draft = storedDraft ?? fallbackSchedule();

  return (
    <section className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black">Harmonogram</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-black/70">
          Domyślnie dostępne są wszystkie dni tygodnia i cztery sloty dziennie. Tutaj możesz zmienić dni tygodnia
          oraz ręcznie zablokować święta, pojedyncze dni lub godziny. Zmiany wymagają publikacji.
        </p>
      </div>
      {query.saved ? <p className="rounded-2xl bg-[#e7f5ea] px-4 py-3 text-sm" role="status">Zapis przyjęty.</p> : null}
      {query.error ? <p className="rounded-2xl bg-[#fff1f0] px-4 py-3 text-sm" role="alert">{query.error}</p> : null}

      <section className="rounded-3xl bg-white p-5 text-sm shadow-sm">
        <h2 className="text-lg font-black">Limity</h2>
        <p className="mt-2">Drużyna: {settings.maxPlayersPerTeam}. Mecze: {settings.minTeamsPerMatch}–{settings.maxTeamsPerMatch} drużyn. Slot: {settings.maxPlayersPerSlot} graczy.</p>
        <p>Starty: {settings.slotStartTimes.join(", ")}. Gra {settings.slotDurationMinutes} min, przerwa {settings.slotBufferMinutes} min.</p>
        <p className="mt-2">Liczba zestawów: nieustalona. Nie da się jej tu włączyć.</p>
        <Link className="mt-3 inline-block font-bold text-[#234c36]" href="/panel/firma">Zmień limity w danych firmy</Link>
      </section>

      <form action={saveScheduleAction} className="grid gap-4 rounded-3xl bg-white p-5 shadow-sm">
        <input name="version" type="hidden" value={draftVersion} />
        <fieldset>
          <legend className="text-lg font-black">Dni tygodnia</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {WEEKDAYS.map((day) => (
              <label className="flex items-center gap-2 text-sm font-semibold" key={day}>
                <input type="checkbox" name={`day_${day}`} defaultChecked={draft.weekdays.includes(day)} />
                {labels[day]}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="grid gap-3">
          <legend className="text-lg font-black">Blokady</legend>
          {draft.blocks.length === 0 ? <p className="text-sm">Brak blokad w wersji roboczej.</p> : draft.blocks.map((block) => (
            <label className="flex items-center gap-2 text-sm" key={`${block.date}-${block.slot}`}>
              <input type="checkbox" name={`keep_${block.date}_${block.slot}`} defaultChecked />
              {block.date} · {block.slot === "day" ? "cały dzień" : block.slot} · {block.reason}
            </label>
          ))}
          <div className="grid gap-2 sm:grid-cols-3">
            <input className="rounded-xl border px-3 py-2" name="newDate" type="date" />
            <select className="rounded-xl border px-3 py-2" name="newSlot" defaultValue="day">
              <option value="day">Cały dzień</option>
              {settings.slotStartTimes.map((time) => <option key={time} value={time}>{time}</option>)}
            </select>
            <input className="rounded-xl border px-3 py-2" name="newReason" placeholder="Powód blokady" />
          </div>
        </fieldset>
        <button className="w-fit rounded-full bg-[#234c36] px-5 py-3 text-sm font-bold text-white" type="submit">Zapisz wersję roboczą</button>
      </form>
      <form action={publishScheduleAction}>
        <button className="rounded-full bg-[#111510] px-5 py-3 text-sm font-bold text-white" type="submit">Opublikuj harmonogram</button>
      </form>
    </section>
  );
}
