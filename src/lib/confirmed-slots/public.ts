import { getPrisma } from "@/lib/prisma";
import { readConfirmedSlots } from "@/lib/confirmed-slots/store";

export async function getPublicConfirmedSlots(fromDate?: string) {
  if (!process.env.DATABASE_URL) return { known: true, slots: [] as Array<{ date: string; slot: string }> };
  try {
    const slots = await readConfirmedSlots(getPrisma(), fromDate);
    return { known: true, slots: slots.map(({ date, slot }) => ({ date, slot })) };
  } catch {
    return { known: false, slots: [] as Array<{ date: string; slot: string }> };
  }
}
