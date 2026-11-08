import { pendingGalleryAssets } from "@/data/gallery";
import { publishGalleryAction, saveGalleryAction, uploadGalleryAction } from "@/app/panel/(app)/galeria/actions";
import { fallbackGallery } from "@/lib/gallery/model";
import { readGalleryDraft, readGalleryDraftVersion, readPublishedGallery } from "@/lib/gallery/store";
import { getPrisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/staff/session";

export const dynamic = "force-dynamic";

const categories = [
  ["atrakcje", "Atrakcje"],
  ["teren", "Teren"],
  ["okopy-i-bunkry", "Okopy i bunkry"],
] as const;

export default async function GalleryAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireStaff("business.publish");
  const query = await searchParams;
  const db = getPrisma();
  const [storedDraft, draftVersion, published] = await Promise.all([
    readGalleryDraft(db),
    readGalleryDraftVersion(db),
    readPublishedGallery(db),
  ]);
  const draft = storedDraft ?? fallbackGallery();

  return (
    <section className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black">Galeria</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-black/70">
          Kolejność, kategoria, podpis i widoczność zapisują się jako wersja robocza. Rolka publiczna zmienia się dopiero po publikacji.
          Zdjęcia z rozpoznawalnymi osobami nie są dostępne do publikacji.
        </p>
      </div>
      {query.saved ? <p className="rounded-2xl bg-[#e7f5ea] px-4 py-3 text-sm" role="status">Zapis przyjęty.</p> : null}
      {query.error ? <p className="rounded-2xl bg-[#fff1f0] px-4 py-3 text-sm" role="alert">{query.error}</p> : null}

      <form action={saveGalleryAction} className="grid gap-4">
        <input name="version" type="hidden" value={draftVersion} />
        {draft.map((photo) => (
          <fieldset className="grid gap-3 rounded-3xl bg-white p-5 shadow-sm" key={photo.id}>
            <legend className="font-black">{photo.title || photo.id}</legend>
            {photo.storageName ? (
              // Owner-only preview of a file that is not public yet.
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="" className="h-28 w-auto rounded-xl" src={`/panel/galeria/plik/${photo.storageName}`} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="" className="h-28 w-auto rounded-xl" src={photo.src} />
            )}
            <label className="text-sm font-semibold">Tytuł<input className="mt-1 w-full rounded-xl border px-3 py-2 font-normal" name={`title_${photo.id}`} defaultValue={photo.title} /></label>
            <label className="text-sm font-semibold">Podpis<input className="mt-1 w-full rounded-xl border px-3 py-2 font-normal" name={`label_${photo.id}`} defaultValue={photo.label} /></label>
            <label className="text-sm font-semibold">Opis alternatywny<textarea className="mt-1 min-h-16 w-full rounded-xl border px-3 py-2 font-normal" name={`alt_${photo.id}`} defaultValue={photo.alt} /></label>
            <label className="text-sm font-semibold">Kategoria
              <select className="mt-1 w-full rounded-xl border px-3 py-2 font-normal" name={`category_${photo.id}`} defaultValue={photo.category}>
                {categories.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name={`visible_${photo.id}`} defaultChecked={photo.visible} />Widoczne po publikacji</label>
            <label className="flex items-center gap-2 text-sm font-semibold"><input type="radio" name="cover" value={photo.id} defaultChecked={photo.cover} />Okładka rolki</label>
          </fieldset>
        ))}
        <button className="w-fit rounded-full bg-[#234c36] px-5 py-3 text-sm font-bold text-white" type="submit">Zapisz wersję roboczą</button>
      </form>

      <form action={publishGalleryAction}>
        <button className="rounded-full bg-[#111510] px-5 py-3 text-sm font-bold text-white" type="submit">Opublikuj galerię</button>
      </form>

      <form action={uploadGalleryAction} className="grid gap-3 rounded-3xl bg-white p-5 shadow-sm">
        <input name="version" type="hidden" value={draftVersion} />
        <h2 className="text-lg font-black">Dodaj zdjęcie</h2>
        <input accept="image/jpeg,image/png,image/webp" name="file" type="file" required />
        <input className="rounded-xl border px-3 py-2" name="title" placeholder="Tytuł" required />
        <input className="rounded-xl border px-3 py-2" name="label" placeholder="Podpis" required />
        <textarea className="min-h-16 rounded-xl border px-3 py-2" name="alt" placeholder="Opis alternatywny" required />
        <select className="rounded-xl border px-3 py-2" name="category" defaultValue="teren">
          {categories.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input name="rights" type="checkbox" required />
          Potwierdzam, że na kadrze nie ma rozpoznawalnej osoby albo mam zgodę na publikację.
        </label>
        <button className="w-fit rounded-full border border-black/15 px-5 py-3 text-sm font-bold" type="submit">Dodaj do wersji roboczej</button>
      </form>

      <section className="rounded-3xl bg-white p-5 text-sm shadow-sm">
        <h2 className="text-lg font-black">Niepublikowane materiały</h2>
        <p className="mt-2">Publicznie: {published ? `${published.filter((item) => item.visible).length} zdjęć` : "kopia startowa, 3 zdjęcia"}.</p>
        <ul className="mt-3 grid gap-2">
          {pendingGalleryAssets.map((item) => <li key={item.file}>{item.file}: {item.reason}</li>)}
        </ul>
      </section>
    </section>
  );
}
