"use server";

import { redirect } from "next/navigation";

import { getPrisma } from "@/lib/prisma";
import { createStaffMember, setStaffStatus, StaffAccessError } from "@/lib/staff/accounts";
import { requireStaff } from "@/lib/staff/session";

export async function createStaffAction(formData: FormData) {
  const owner = await requireStaff("staff.manage");
  try {
    await createStaffMember({
      actorId: owner.id,
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      role: String(formData.get("role") ?? ""),
    });
  } catch (error) {
    const code = error instanceof StaffAccessError ? error.status : 500;
    redirect("/panel/pracownicy?error=" + code);
  }
  redirect("/panel/pracownicy");
}

export async function setStaffStatusAction(formData: FormData) {
  const owner = await requireStaff("staff.manage");
  const status = formData.get("status") === "disabled" ? "disabled" : "active";
  try {
    await setStaffStatus({
      actorId: owner.id,
      userId: String(formData.get("userId") ?? ""),
      status,
    });
  } catch (error) {
    const code = error instanceof StaffAccessError ? error.status : 500;
    redirect("/panel/pracownicy?error=" + code);
  }
  redirect("/panel/pracownicy");
}

export async function listStaffForOwner() {
  await requireStaff("staff.manage");
  return getPrisma().user.findMany({
    select: { id: true, name: true, email: true, login: true, role: true, status: true },
    orderBy: { createdAt: "asc" },
  });
}
