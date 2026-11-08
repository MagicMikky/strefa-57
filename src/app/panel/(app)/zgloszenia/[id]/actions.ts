"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getPublicBusiness } from "@/lib/business/public";
import { cancelInquirySlot, confirmInquirySlot } from "@/lib/confirmed-slots/store";
import { applyInquiryCommand } from "@/lib/inquiries/policy";
import { getInquiryRepository } from "@/lib/inquiries/repository";
import { getPrisma } from "@/lib/prisma";
import { getPublishedSchedule } from "@/lib/schedule/public";
import { requireStaff } from "@/lib/staff/session";

function inquiryPath(id: string): string {
  return "/panel/zgloszenia/" + encodeURIComponent(id);
}

export async function updateInquiryStatus(formData: FormData) {
  const staff = await requireStaff("inquiries.update");
  const id = String(formData.get("id") ?? "");
  const decision = applyInquiryCommand(staff.role, {
    type: "status",
    status: String(formData.get("status") ?? ""),
  });
  const repository = getInquiryRepository();
  if (!decision.ok || decision.command.type !== "status" || !decision.command.status || !repository) {
    redirect(inquiryPath(id) + "?error=status");
  }
  await repository.setStatus(id, decision.command.status, staff);
  redirect(inquiryPath(id));
}

export async function confirmInquiryVisit(formData: FormData) {
  const staff = await requireStaff("inquiries.update");
  const id = String(formData.get("id") ?? "");
  const date = String(formData.get("date") ?? "");
  const slot = String(formData.get("slot") ?? "");
  if (!process.env.DATABASE_URL || !id) redirect(inquiryPath(id) + "?error=confirmation-unavailable");
  const [business, schedule] = await Promise.all([getPublicBusiness(), getPublishedSchedule()]);
  const result = await confirmInquirySlot(getPrisma(), { inquiryId: id, date, slot, actorId: staff.id, now: new Date() }, business.settings, schedule);
  if (!result.ok) redirect(inquiryPath(id) + `?error=${result.error}`);
  revalidatePath("/rezerwacja");
  revalidatePath("/panel/dostepnosc");
  redirect(inquiryPath(id) + "?result=confirmed");
}

export async function cancelInquiryVisit(formData: FormData) {
  const staff = await requireStaff("inquiries.update");
  const id = String(formData.get("id") ?? "");
  if (!process.env.DATABASE_URL || !id) redirect(inquiryPath(id) + "?error=confirmation-unavailable");
  const cancelled = await cancelInquirySlot(getPrisma(), id, staff.id);
  if (!cancelled) redirect(inquiryPath(id) + "?error=missing-confirmation");
  revalidatePath("/rezerwacja");
  revalidatePath("/panel/dostepnosc");
  redirect(inquiryPath(id) + "?result=cancelled");
}

export async function assignInquiry(formData: FormData) {
  const staff = await requireStaff("inquiries.assign");
  const id = String(formData.get("id") ?? "");
  const raw = String(formData.get("assigneeId") ?? "");
  const decision = applyInquiryCommand(staff.role, {
    type: "assign",
    assigneeId: raw === "" ? null : raw,
  });
  const repository = getInquiryRepository();
  const command = decision.ok ? decision.command : null;
  if (!command || command.type !== "assign" || !repository) {
    redirect(inquiryPath(id) + "?error=assign");
  }
  const staffList = await repository.listStaff();
  const assignee = command.assigneeId
    ? staffList.find((member) => member.id === command.assigneeId) ?? null
    : null;
  if (command.assigneeId && !assignee) {
    redirect(inquiryPath(id) + "?error=assign");
  }
  await repository.assign(
    id,
    assignee ? { id: assignee.id, name: assignee.name } : null,
    staff,
  );
  redirect(inquiryPath(id));
}

export async function addInquiryNote(formData: FormData) {
  const staff = await requireStaff("inquiries.note");
  const id = String(formData.get("id") ?? "");
  const decision = applyInquiryCommand(staff.role, {
    type: "note",
    body: String(formData.get("body") ?? ""),
  });
  const repository = getInquiryRepository();
  if (!decision.ok || decision.command.type !== "note" || !decision.command.body || !repository) {
    redirect(inquiryPath(id) + "?error=note");
  }
  await repository.addNote(id, {
    authorId: staff.id,
    authorName: staff.name,
    body: decision.command.body,
  });
  redirect(inquiryPath(id));
}
