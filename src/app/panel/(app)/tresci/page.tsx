import Link from "next/link";

import { publishSiteAction, saveSiteDraftAction } from "@/app/panel/(app)/tresci/actions";
import { fallbackSiteCopy } from "@/lib/content/model";
import { readPublishedSite, readSiteDraft } from "@/lib/content/store";
import { getPrisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/staff/session";

export const dynamic = "force-dynamic";

function Field({ name, label, value }: { name: string; label: string; value: string }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 font-normal" name={name} defaultValue={value} />
    </label>
  );
}

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireStaff("business.publish");
  const query = await searchParams;
  const db = getPrisma();
  const draft = (await readSiteDraft(db)) ?? fallbackSiteCopy();
  const published = await readPublishedSite(db);
  const history = await db.configChangeAudit.findMany({
    where: { entity: "site-content" },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { actor: { select: { name: true } } },
  });
  const faqSlots = [...draft.faq];
  while (faqSlots.length < 8) faqSlots.push({ question: "", answer: "" });

  return (
    <section className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black">Treści strony</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-black/70">
          Zapis jest wersją roboczą. Publicznie widać dopiero opublikowane FAQ, opisy atrakcji, teksty pakietów i SEO.
          Kwot nie da się tu ustawić.
        </p>
      </div>
      {query.saved ? (
        <p className="rounded-2xl bg-[#e7f5ea] px-4 py-3 text-sm" role="status">
          {query.saved === "published" ? "Opublikowano treści." : "Zapisano wersję roboczą."}
        </p>
      ) : null}
      {query.error ? <p className="rounded-2xl bg-[#fff1f0] px-4 py-3 text-sm" role="alert">{query.error}</p> : null}

      <form action={saveSiteDraftAction} className="grid gap-6">
        <fieldset className="grid gap-4 rounded-3xl bg-white p-5 shadow-sm">
          <legend className="text-lg font-black">SEO</legend>
          <Field name="seoHomeTitle" label="Strona główna — tytuł" value={draft.seo.home.title} />
          <Field name="seoHomeDescription" label="Strona główna — opis" value={draft.seo.home.description} />
          <Field name="seoFaqTitle" label="FAQ — tytuł" value={draft.seo.faq.title} />
          <Field name="seoFaqDescription" label="FAQ — opis" value={draft.seo.faq.description} />
          <Field name="seoOfertaTitle" label="Oferta — tytuł" value={draft.seo.oferta.title} />
          <Field name="seoOfertaDescription" label="Oferta — opis" value={draft.seo.oferta.description} />
          <Field name="seoCennikTitle" label="Cennik — tytuł" value={draft.seo.cennik.title} />
          <Field name="seoCennikDescription" label="Cennik — opis" value={draft.seo.cennik.description} />
        </fieldset>

        <fieldset className="grid gap-4 rounded-3xl bg-white p-5 shadow-sm">
          <legend className="text-lg font-black">FAQ</legend>
          {faqSlots.map((item, index) => (
            <div className="grid gap-2" key={`faq-${index}`}>
              <Field name={`faqQuestion_${index}`} label={`Pytanie ${index + 1}`} value={item.question} />
              <label className="block text-sm font-semibold">
                Odpowiedź {index + 1}
                <textarea className="mt-1 min-h-20 w-full rounded-xl border border-black/10 px-3 py-2 font-normal" name={`faqAnswer_${index}`} defaultValue={item.answer} />
              </label>
            </div>
          ))}
        </fieldset>

        <fieldset className="grid gap-4 rounded-3xl bg-white p-5 shadow-sm">
          <legend className="text-lg font-black">Atrakcje</legend>
          {draft.attractions.map((item, index) => (
            <div className="grid gap-2" key={`attraction-${index}`}>
              <Field name={`attractionTitle_${index}`} label={`Atrakcja ${index + 1}`} value={item.title} />
              <label className="block text-sm font-semibold">
                Opis
                <textarea className="mt-1 min-h-20 w-full rounded-xl border border-black/10 px-3 py-2 font-normal" name={`attractionDescription_${index}`} defaultValue={item.description} />
              </label>
            </div>
          ))}
        </fieldset>

        <fieldset className="grid gap-4 rounded-3xl bg-white p-5 shadow-sm">
          <legend className="text-lg font-black">Pakiety</legend>
          <p className="text-sm text-black/60">Cena zostaje „wycena po zapytaniu”. Identyfikatory pakietów są stałe.</p>
          {draft.packages.map((item, index) => (
            <div className="grid gap-2" key={item.id}>
              <Field name={`packageName_${index}`} label="Nazwa" value={item.name} />
              <Field name={`packageEyebrow_${index}`} label="Etykieta" value={item.eyebrow} />
              <label className="block text-sm font-semibold">
                Opis
                <textarea className="mt-1 min-h-20 w-full rounded-xl border border-black/10 px-3 py-2 font-normal" name={`packageDescription_${index}`} defaultValue={item.description} />
              </label>
              <label className="block text-sm font-semibold">
                Punkty, jeden w wierszu
                <textarea className="mt-1 min-h-20 w-full rounded-xl border border-black/10 px-3 py-2 font-normal" name={`packageFeatures_${index}`} defaultValue={item.features.join("\n")} />
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" name={`packageFeatured_${index}`} defaultChecked={item.featured} />
                Wyróżniony
              </label>
            </div>
          ))}
        </fieldset>

        <div className="flex flex-wrap gap-3">
          <button className="rounded-full bg-[#234c36] px-5 py-3 text-sm font-bold text-white" type="submit">Zapisz wersję roboczą</button>
          <Link className="rounded-full border border-black/15 px-5 py-3 text-sm font-bold" href="/panel/tresci/podglad">Podgląd zmian</Link>
        </div>
      </form>

      <form action={publishSiteAction}>
        <button className="rounded-full bg-[#111510] px-5 py-3 text-sm font-bold text-white" type="submit">Opublikuj zatwierdzone treści</button>
      </form>

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black">Porównanie</h2>
        <p className="mt-2 text-sm">Robocze FAQ: {draft.seo.faq.title}</p>
        <p className="text-sm">Publiczne FAQ: {published?.seo.faq.title ?? "kopia startowa z kodu"}</p>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black">Historia zmian</h2>
        {history.length === 0 ? <p className="mt-2 text-sm">Brak zapisów.</p> : (
          <ol className="mt-3 grid gap-3">
            {history.map((item) => (
              <li className="text-sm" key={item.id}>
                <span className="font-bold">{item.action === "publish" ? "Publikacja" : "Wersja robocza"}</span>
                {" · "}{item.actor?.name ?? "konto usunięte"}{" · "}{item.createdAt.toLocaleString("pl-PL")}
              </li>
            ))}
          </ol>
        )}
      </section>
    </section>
  );
}
