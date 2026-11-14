import { getPrisma } from "@/lib/prisma";
import { readConfirmedSlots } from "@/lib/confirmed-slots/store";

export async function getPublicConfirmedSlots(fromDate?: string) {
  if (!process.env.DATABASE_URL) return { known: false, slots: [] as Array<{ date: string; slot: string; players: number; privateSlot: boolean }> };
  try {
    const slots = await readConfirmedSlots(getPrisma(), fromDate);
    return { known: true, slots: slots.map(({ date, slot, players, privateSlot }) => ({ date, slot, players, privateSlot })) };
  } catch {
    return { known: false, slots: [] as Array<{ date: string; slot: string; players: number; privateSlot: boolean }> };
  }
}
