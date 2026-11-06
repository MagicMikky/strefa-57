"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getAuth } from "@/lib/auth";
import { passwordProblem } from "@/lib/staff/permissions";
import { requireStaff } from "@/lib/staff/session";

export async function changeOwnPassword(formData: FormData) {
  await requireStaff();
  const next = String(formData.get("newPassword") ?? "");
  const problem = passwordProblem(next);
  if (problem) {
    redirect("/panel/ustawienia?error=password");
  }
  try {
    await getAuth().api.changePassword({
      body: {
        currentPassword: String(formData.get("currentPassword") ?? ""),
        newPassword: next,
        revokeOtherSessions: true,
      },
      headers: await headers(),
    });
  } catch {
    redirect("/panel/ustawienia?error=password");
  }
  redirect("/panel/ustawienia?saved=1");
}
