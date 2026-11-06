import { describeAudit } from "@/lib/audit/summary";
import { getPrisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/staff/session";

export const dynamic = "force-dynamic";

export default async function AuditHistoryPage() {
  await requireStaff("business.publish");
  const loaded = await loadAudits();
  return (
    <section className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black">Historia zmian</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-black/70">
          Ostatnie zapisy i publikacje firmy, treści, galerii i harmonogramu. Lista nie pokazuje treści zmian i nie przywraca wcześniejszej wersji.
        </p>
      </div>
      {loaded.kind === "missing" ? <p>Brak połączenia z bazą. Historia zmian nie została odczytana.</p> : null}
      {loaded.kind === "error" ? <p role="alert">Nie udało się odczytać historii.</p> : null}
      {loaded.kind === "ready" && loaded.rows.length === 0 ? <p>Brak zapisanych zmian.</p> : null}
      {loaded.kind === "ready" && loaded.rows.length > 0 ? (
        <ul className="grid gap-2">
          {loaded.rows.map((row) => (
            <li className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm" key={row.id}>
              <p>{describeAudit(row)}</p>
              <p className="text-black/60">{row.actorName ?? "Nieznany pracownik"}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

async function loadAudits(): Promise<
  | { kind: "missing" }
  | { kind: "error" }
  | { kind: "ready"; rows: Array<{ id: string; entity: string; action: string; createdAt: string; actorName: string | null }> }
> {
  if (!process.env.DATABASE_URL) return { kind: "missing" };
  try {
    const rows = await getPrisma().configChangeAudit.findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
      select: {
        id: true,
        entity: true,
        action: true,
        createdAt: true,
        actor: { select: { name: true } },
      },
    });
    return {
      kind: "ready",
      rows: rows.map((row) => ({
        id: row.id,
        entity: row.entity,
        action: row.action,
        createdAt: row.createdAt.toISOString(),
        actorName: row.actor?.name ?? null,
      })),
    };
  } catch {
    return { kind: "error" };
  }
}
