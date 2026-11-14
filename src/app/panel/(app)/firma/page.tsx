import Link from "next/link";

import { saveCompanyDraftAction, publishCompanyAction } from "@/app/panel/(app)/firma/actions";
import { fallbackBusiness, formatBusinessAddress } from "@/lib/business/model";
import { readDraft, readDraftVersion, readPublished } from "@/lib/business/store";
import { getPrisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/staff/session";

export const dynamic = "force-dynamic";

function Field({ name, label, value, hint }: { name: string; label: string; value: string; hint?: string }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 font-normal" name={name} defaultValue={value} />
      {hint ? <span className="mt-1 block text-xs font-normal text-black/60">{hint}</span> : null}
    </label>
  );
}

export default async function CompanyPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const actor = await requireStaff("business.publish");
  const query = await searchParams;
  const db = getPrisma();
  const [storedDraft, draftVersion] = await Promise.all([
    readDraft(db),
    readDraftVersion(db),
  ]);
  const draft = storedDraft ?? fallbackBusiness();
  const published = await readPublished(db);
  const history = await db.configChangeAudit.findMany({
    where: { entity: "company" },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { actor: { select: { name: true, email: true } } },
  });

  return (
    <section className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black">Firma</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-black/70">
          Zapis tworzysz jako wersję roboczą. Publiczna strona widzi dopiero opublikowany zestaw.
          Zalogowany: {actor.name}.
        </p>
      </div>
      {query.saved ? (
        <p className="rounded-2xl bg-[#e7f5ea] px-4 py-3 text-sm" role="status">
          {query.saved === "published" ? "Opublikowano dane firmy." : "Zapisano wersję roboczą."}
        </p>
      ) : null}
      {query.error ? <p className="rounded-2xl bg-[#fff1f0] px-4 py-3 text-sm" role="alert">{query.error}</p> : null}

      <form action={saveCompanyDraftAction} className="grid gap-6">
        <input name="version" type="hidden" value={draftVersion} />
        <fieldset className="grid gap-4 rounded-3xl bg-white p-5 shadow-sm">
          <legend className="text-lg font-black">Dane firmy</legend>
          <Field name="tradeName" label="Nazwa handlowa" value={draft.profile.tradeName} />
          <Field name="legalName" label="Pełna nazwa prawna" value={draft.profile.legalName} hint="Zostaw puste, dopóki nie jest ustalona." />
          <Field name="taxId" label="NIP" value={draft.profile.taxId} hint="10 cyfr albo pusto." />
          <Field name="dataController" label="Administrator danych" value={draft.profile.dataController} />
          <label className="block text-sm font-semibold">
            Opis firmy
            <textarea className="mt-1 min-h-28 w-full rounded-xl border border-black/10 px-3 py-2 font-normal" name="description" defaultValue={draft.profile.description} />
          </label>
        </fieldset>

        <fieldset className="grid gap-4 rounded-3xl bg-white p-5 shadow-sm">
          <legend className="text-lg font-black">Kontakt</legend>
          <Field name="phoneDisplay" label="Telefon" value={draft.contact.phoneDisplay} />
          <Field name="emailDisplay" label="E-mail" value={draft.contact.emailDisplay} />
          <Field name="hours" label="Godziny kontaktu" value={draft.contact.hours} />
          <label className="block text-sm font-semibold">
            Linki społecznościowe
            <textarea className="mt-1 min-h-20 w-full rounded-xl border border-black/10 px-3 py-2 font-normal" name="socialText" defaultValue={draft.contact.socialText} />
            <span className="mt-1 block text-xs font-normal text-black/60">Jeden adres https:// w wierszu.</span>
          </label>
        </fieldset>

        <fieldset className="grid gap-4 rounded-3xl bg-white p-5 shadow-sm">
          <legend className="text-lg font-black">Lokalizacja</legend>
          <Field name="street" label="Ulica" value={draft.profile.street} />
          <p className="text-sm text-black/60">Adres poligonu. Adres rejestrowy firmy podaj osobno, gdy zostanie potwierdzony.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="postalCode" label="Kod pocztowy" value={draft.profile.postalCode} />
            <Field name="city" label="Miejscowość" value={draft.profile.city} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="region" label="Województwo" value={draft.profile.region} />
            <Field name="country" label="Kraj" value={draft.profile.country} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="latitude" label="Szerokość" value={draft.profile.latitude} />
            <Field name="longitude" label="Długość" value={draft.profile.longitude} />
          </div>
          <label className="block text-sm font-semibold">
            Wskazówki dojazdu
            <textarea className="mt-1 min-h-20 w-full rounded-xl border border-black/10 px-3 py-2 font-normal" name="directions" defaultValue={draft.contact.directions} />
          </label>
          <Field name="mapNote" label="Krótka wskazówka na mapę" value={draft.profile.mapNote} />
          <Field name="registeredStreet" label="Ulica rejestrowa firmy" value={draft.profile.registeredStreet} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="registeredPostalCode" label="Kod rejestrowy" value={draft.profile.registeredPostalCode} />
            <Field name="registeredCity" label="Miejscowość rejestrowa" value={draft.profile.registeredCity} />
          </div>
        </fieldset>

        <fieldset className="grid gap-4 rounded-3xl bg-white p-5 shadow-sm">
          <legend className="text-lg font-black">Podstawowe ustawienia</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="minPlayersPerBooking" label="Minimalna grupa" value={String(draft.settings.minPlayersPerBooking)} />
            <Field name="maxPlayersPerTeam" label="Zawodnicy w drużynie" value={String(draft.settings.maxPlayersPerTeam)} />
            <Field name="minTeamsPerMatch" label="Minimum drużyn" value={String(draft.settings.minTeamsPerMatch)} />
            <Field name="maxTeamsPerMatch" label="Maksimum drużyn" value={String(draft.settings.maxTeamsPerMatch)} />
            <Field name="maxPlayersPerSlot" label="Gracze w slocie" value={String(draft.settings.maxPlayersPerSlot)} />
            <Field name="slotDurationMinutes" label="Czas gry (min)" value={String(draft.settings.slotDurationMinutes)} />
            <Field name="slotBufferMinutes" label="Przerwa (min)" value={String(draft.settings.slotBufferMinutes)} />
          </div>
          <Field name="slotStartTimes" label="Godziny startu" value={draft.settings.slotStartTimes.join(",")} hint="Rozdziel przecinkami, na przykład 10:00,12:00,15:00,18:00." />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field name="depositAmount" label="Zadatek za grupę (PLN)" value={draft.settings.depositAmount} />
            <Field name="campfirePrice" label="Ognisko (PLN)" value={draft.settings.campfirePrice} />
            <Field name="grillPrice" label="Grill (PLN)" value={draft.settings.grillPrice} />
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name="allowSharedSlot" defaultChecked={draft.settings.allowSharedSlot} />
            Slot wspólny jest dozwolony
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name="allowPrivateSlot" defaultChecked={draft.settings.allowPrivateSlot} />
            Slot prywatny jest dozwolony
          </label>
          <p className="text-sm text-black/60">
            Liczba zestawów, ceny pakietów, operator płatności oraz zasady anulowania
            pozostają nieustalone i nie da się ich tu włączyć.
          </p>
        </fieldset>

        <div className="flex flex-wrap gap-3">
          <button className="rounded-full bg-[#234c36] px-5 py-3 text-sm font-bold text-white" type="submit">
            Zapisz wersję roboczą
          </button>
          <Link className="rounded-full border border-black/15 px-5 py-3 text-sm font-bold" href="/panel/firma/podglad">
            Podgląd zmian
          </Link>
        </div>
      </form>

      <form action={publishCompanyAction}>
        <button className="rounded-full bg-[#111510] px-5 py-3 text-sm font-bold text-white" type="submit">
          Opublikuj zatwierdzone dane
        </button>
      </form>

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black">Porównanie</h2>
        <p className="mt-2 text-sm">Robocza: {formatBusinessAddress(draft.profile)} · {draft.contact.phoneDisplay}</p>
        <p className="text-sm">Publiczna: {published ? `${formatBusinessAddress(published.profile)} · ${published.contact.phoneDisplay}` : "brak opublikowanego wiersza, strona użyje bezpiecznej kopii startowej"}</p>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black">Historia zmian</h2>
        {history.length === 0 ? <p className="mt-2 text-sm">Brak zapisów.</p> : (
          <ol className="mt-3 grid gap-3">
            {history.map((item) => (
              <li className="text-sm" key={item.id}>
                <span className="font-bold">{item.action === "publish" ? "Publikacja" : "Wersja robocza"}</span>
                {" · "}
                {item.actor?.name ?? "konto usunięte"}
                {" · "}
                {item.createdAt.toLocaleString("pl-PL")}
              </li>
            ))}
          </ol>
        )}
      </section>
    </section>
  );
}
