"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getAuth, isAuthConfigured } from "@/lib/auth";

export async function logoutStaff() {
  if (isAuthConfigured()) {
    await getAuth().api.signOut({ headers: await headers() });
  }
  redirect("/panel/logowanie");
}
