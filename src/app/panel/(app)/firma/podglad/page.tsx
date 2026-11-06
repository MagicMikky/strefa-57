import Link from "next/link";

import { formatBusinessAddress } from "@/lib/business/model";
import { readDraft, readPublished } from "@/lib/business/store";
import { getPrisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/staff/session";

export const dynamic = "force-dynamic";

export default async function CompanyPreviewPage() {
  await requireStaff("business.publish");
  const db = getPrisma();
  const draft = await readDraft(db);
  const published = await readPublished(db);

  return (
    <section className="grid gap-4">
      <h1 className="text-3xl font-black">Podgląd zmian</h1>
      <p className="text-sm text-black/70">Ten widok jest tylko dla właściciela. Wersja robocza nie jest dostępna na stronie publicznej.</p>
      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="font-black">Wersja robocza</h2>
          {draft ? (
            <dl className="mt-3 grid gap-2 text-sm">
              <div><dt className="font-bold">Nazwa</dt><dd>{draft.profile.tradeName}</dd></div>
              <div><dt className="font-bold">Adres</dt><dd>{formatBusinessAddress(draft.profile)}</dd></div>
              <div><dt className="font-bold">Telefon</dt><dd>{draft.contact.phoneDisplay || "niepodany"}</dd></div>
              <div><dt className="font-bold">E-mail</dt><dd>{draft.contact.emailDisplay || "niepodany"}</dd></div>
              <div><dt className="font-bold">Godziny</dt><dd>{draft.contact.hours}</dd></div>
            </dl>
          ) : <p className="mt-3 text-sm">Brak wersji roboczej.</p>}
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="font-black">Opublikowane</h2>
          {published ? (
            <dl className="mt-3 grid gap-2 text-sm">
              <div><dt className="font-bold">Nazwa</dt><dd>{published.profile.tradeName}</dd></div>
              <div><dt className="font-bold">Adres</dt><dd>{formatBusinessAddress(published.profile)}</dd></div>
              <div><dt className="font-bold">Telefon</dt><dd>{published.contact.phoneDisplay || "niepodany"}</dd></div>
            </dl>
          ) : <p className="mt-3 text-sm">Brak publikacji.</p>}
        </article>
      </div>
      <Link className="text-sm font-bold text-[#234c36]" href="/panel/firma">Wróć do edycji</Link>
    </section>
  );
}
