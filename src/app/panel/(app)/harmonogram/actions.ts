"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { fallbackBusiness } from "@/lib/business/model";
import { readPublished } from "@/lib/business/store";
import { getPrisma } from "@/lib/prisma";
import { fallbackSchedule, normalizeSchedule, WEEKDAYS, type ScheduleBlock } from "@/lib/schedule/model";
import { publishScheduleDraft, readScheduleSlot, saveScheduleDraft } from "@/lib/schedule/store";
import { requireStaff } from "@/lib/staff/session";

function text(form: FormData, name: string) {
  return String(form.get(name) ?? "");
}

async function slotTimes() {
  try {
    const published = await readPublished(getPrisma());
    return published?.settings.slotStartTimes ?? fallbackBusiness().settings.slotStartTimes;
  } catch {
    return fallbackBusiness().settings.slotStartTimes;
  }
}

function catalogFromForm(form: FormData, existing: ScheduleBlock[]) {
  const weekdays = WEEKDAYS.filter((day) => form.get(`day_${day}`) === "on");
  const kept = existing.filter((block) => form.get(`keep_${block.date}_${block.slot}`) === "on");
  const date = text(form, "newDate").trim();
  const slot = text(form, "newSlot").trim();
  const reason = text(form, "newReason").trim();
  const blocks = date || slot || reason ? [...kept, { date, slot: slot || "day", reason }] : kept;
  return { weekdays, blocks };
}

export async function saveScheduleAction(form: FormData) {
  const actor = await requireStaff("business.publish");
  const times = await slotTimes();
  const current = (await readScheduleSlot(getPrisma(), "draft", times)) ?? fallbackSchedule();
  const parsed = normalizeSchedule(catalogFromForm(form, current.blocks), times);
  if (!parsed.ok) redirect(`/panel/harmonogram?error=${encodeURIComponent(parsed.error)}`);
  await saveScheduleDraft(getPrisma(), actor.id, parsed.value, times);
  redirect("/panel/harmonogram?saved=draft");
}

export async function publishScheduleAction() {
  const actor = await requireStaff("business.publish");
  const result = await publishScheduleDraft(getPrisma(), actor.id, await slotTimes());
  if (!result.ok) redirect(`/panel/harmonogram?error=${encodeURIComponent(result.error)}`);
  revalidatePath("/rezerwacja");
  redirect("/panel/harmonogram?saved=published");
}
