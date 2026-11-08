import type { PrismaClient } from "@prisma/client";

import type { BusinessSettingsInput } from "@/lib/business/model";
import type { ScheduleCatalog } from "@/lib/schedule/model";
import { decideHold, type CapacityHold, type HoldDecision, type HoldRequest } from "@/lib/holds/model";

type CapacitySettings = Pick<BusinessSettingsInput, "maxPlayersPerTeam" | "maxTeamsPerMatch" | "maxPlayersPerSlot" | "slotStartTimes" | "slotDurationMinutes">;

interface HoldRow {
  id: string;
  idempotencyKey: string;
  date: string;
  slot: string;
  players: number;
  teams: number;
  privateSlot: boolean;
  expiresAt: Date | string;
}

interface HoldDb {
  confirmedSlot: {
    findUnique(args: { where: { date_slot: { date: string; slot: string } } }): Promise<{ id: string } | null>;
  };
  capacityHold: {
    findMany(args: { where: { OR: Array<Record<string, unknown>> } }): Promise<HoldRow[]>;
    create(args: { data: HoldRow }): Promise<HoldRow>;
    update(args: { where: { id: string }; data: HoldRow }): Promise<HoldRow>;
  };
  $executeRaw(query: TemplateStringsArray, ...values: unknown[]): Promise<unknown>;
  $transaction<T>(run: (tx: HoldDb) => Promise<T>): Promise<T>;
}

export async function createCapacityHold(
  db: PrismaClient,
  request: HoldRequest,
  settings: CapacitySettings,
  schedule: ScheduleCatalog,
): Promise<HoldDecision> {
  const client = db as unknown as HoldDb;
  return client.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`${request.date}|${request.slot}`}))`;
    if (await tx.confirmedSlot.findUnique({ where: { date_slot: { date: request.date, slot: request.slot } } })) {
      return { ok: false, error: "unavailable" };
    }
    const rows = await tx.capacityHold.findMany({
      where: {
        OR: [
          { date: request.date, slot: request.slot, expiresAt: { gt: request.now } },
          { idempotencyKey: request.idempotencyKey },
        ],
      },
    });
    const decision = decideHold(rows.map(toHold), request, settings, schedule);
    if (!decision.ok || !decision.created) return decision;
    const data = { ...decision.hold, expiresAt: new Date(decision.hold.expiresAt) };
    const saved = decision.replacedId
      ? await tx.capacityHold.update({ where: { id: decision.replacedId }, data })
      : await tx.capacityHold.create({ data });
    return { ok: true, created: true, replacedId: decision.replacedId, hold: toHold(saved) };
  });
}

export async function readActiveCapacityHolds(db: PrismaClient, now: Date): Promise<CapacityHold[]> {
  const client = db as unknown as HoldDb;
  const rows = await client.capacityHold.findMany({
    where: { OR: [{ expiresAt: { gt: now } }] },
  });
  return rows.map(toHold);
}

function toHold(row: HoldRow): CapacityHold {
  return {
    id: row.id,
    idempotencyKey: row.idempotencyKey,
    date: row.date,
    slot: row.slot,
    players: row.players,
    teams: row.teams,
    privateSlot: row.privateSlot,
    expiresAt: row.expiresAt instanceof Date ? row.expiresAt.toISOString() : row.expiresAt,
  };
}
