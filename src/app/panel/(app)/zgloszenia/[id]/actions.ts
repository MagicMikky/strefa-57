"use server";

import { redirect } from "next/navigation";

import { applyInquiryCommand } from "@/lib/inquiries/policy";
import { getInquiryRepository } from "@/lib/inquiries/repository";
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
