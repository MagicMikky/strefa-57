import Link from "next/link";

import {
  INQUIRY_STATUSES,
  INQUIRY_STATUS_LABELS,
  parseInquiryListQuery,
} from "@/lib/inquiries/model";
import { getInquiryRepository } from "@/lib/inquiries/repository";
import { requireStaff } from "@/lib/staff/session";

export const dynamic = "force-dynamic";

export default async function InquiryListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireStaff("inquiries.read");
  const repository = getInquiryRepository();
  const query = parseInquiryListQuery(await searchParams);
  if (!repository) {
    return <p>Baza zgłoszeń nie jest skonfigurowana.</p>;
  }
  const result = await repository.list(query);
  const pages = Math.max(1, Math.ceil(result.total / query.pageSize));

  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-black">Zgłoszenia</h2>
      <form className="grid gap-3 rounded-3xl border border-black/10 bg-white p-4 md:grid-cols-4" method="get">
        <label className="grid gap-1 text-sm font-semibold">
          Szukaj
          <input className="rounded-xl border border-black/15 px-3 py-2" name="q" defaultValue={query.q} maxLength={80} />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Status
          <select className="rounded-xl border border-black/15 px-3 py-2" name="status" defaultValue={query.status}>
            <option value="">Wszystkie</option>
            {INQUIRY_STATUSES.map((status) => (
              <option key={status} value={status}>
                {INQUIRY_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Sortowanie
          <select className="rounded-xl border border-black/15 px-3 py-2" name="sort" defaultValue={query.sort}>
            <option value="createdAt">Data wpływu</option>
            <option value="updatedAt">Ostatnia zmiana</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Kierunek
          <select className="rounded-xl border border-black/15 px-3 py-2" name="direction" defaultValue={query.direction}>
            <option value="desc">Od najnowszych</option>
            <option value="asc">Od najstarszych</option>
          </select>
        </label>
        <button className="rounded-full bg-[var(--forest)] px-4 py-2 font-semibold text-white md:col-span-4 md:w-fit" type="submit">
          Filtruj
        </button>
      </form>
      <p className="text-sm text-[var(--muted)]">{result.total} zgłoszeń</p>
      <ul className="grid gap-3">
        {result.items.map((item) => (
          <li key={item.id}>
            <Link className="block rounded-2xl border border-black/10 bg-white px-4 py-3" href={"/panel/zgloszenia/" + item.id}>
              <strong>{item.name}</strong> · {item.email}
              <p className="text-sm text-[var(--muted)]">
                {INQUIRY_STATUS_LABELS[item.status]} · {item.preferredDate} · {item.playerCount} graczy · {item.packageId}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      <nav aria-label="Strony listy" className="flex gap-3">
        {query.page > 1 ? (
          <Link href={pageHref(query, query.page - 1)}>Poprzednia</Link>
        ) : null}
        <span>
          {query.page} / {pages}
        </span>
        {query.page < pages ? <Link href={pageHref(query, query.page + 1)}>Następna</Link> : null}
      </nav>
    </div>
  );
}

function pageHref(
  query: ReturnType<typeof parseInquiryListQuery>,
  page: number,
): string {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.status) params.set("status", query.status);
  params.set("sort", query.sort);
  params.set("direction", query.direction);
  params.set("page", String(page));
  return "/panel/zgloszenia?" + params.toString();
}
