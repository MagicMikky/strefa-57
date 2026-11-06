import Link from "next/link";

import { readPublishedSite, readSiteDraft } from "@/lib/content/store";
import { getPrisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/staff/session";

export const dynamic = "force-dynamic";

export default async function ContentPreviewPage() {
  await requireStaff("business.publish");
  const db = getPrisma();
  const draft = await readSiteDraft(db);
  const published = await readPublishedSite(db);

  return (
    <section className="grid gap-4">
      <h1 className="text-3xl font-black">Podgląd treści</h1>
      <p className="text-sm text-black/70">Ten widok jest tylko dla właściciela. Wersja robocza nie pojawia się na stronie publicznej.</p>
      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="font-black">Wersja robocza</h2>
          {draft ? (
            <ul className="mt-3 grid gap-2 text-sm">
              <li>FAQ: {draft.seo.faq.title} ({draft.faq.length})</li>
              <li>Oferta: {draft.attractions.map((item) => item.title).join(", ")}</li>
              <li>Pakiety: {draft.packages.map((item) => item.name).join(", ")}</li>
            </ul>
          ) : <p className="mt-3 text-sm">Brak wersji roboczej.</p>}
        </article>
        <article className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="font-black">Opublikowane</h2>
          {published ? <p className="mt-3 text-sm">{published.seo.faq.title}</p> : <p className="mt-3 text-sm">Brak publikacji. Strona używa kopii startowej.</p>}
        </article>
      </div>
      <Link className="text-sm font-bold text-[#234c36]" href="/panel/tresci">Wróć do edycji</Link>
    </section>
  );
}
