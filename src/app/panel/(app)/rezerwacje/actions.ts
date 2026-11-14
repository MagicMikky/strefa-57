"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getPublicBusiness } from "@/lib/business/public";
import { cancelPhoneBooking, createPhoneBooking, updatePhoneBooking, type PhoneBookingInput } from "@/lib/confirmed-slots/store";
import { getPrisma } from "@/lib/prisma";
import { getPublishedSchedule } from "@/lib/schedule/public";
import { requireStaff } from "@/lib/staff/session";

function formInput(form: FormData, actorId: string): PhoneBookingInput {
  return {
    date: String(form.get("date") ?? ""), slot: String(form.get("slot") ?? ""),
    players: Number(form.get("players")), privateSlot: form.get("mode") !== "shared",
    contactName: String(form.get("contactName") ?? ""), contactPhone: String(form.get("contactPhone") ?? ""),
    notes: String(form.get("notes") ?? ""), actorId, now: new Date(),
  };
}
function refresh() {
  revalidatePath("/rezerwacja");
  revalidatePath("/panel/dostepnosc");
  revalidatePath("/panel/rezerwacje");
}
function go(error?: string, result?: string) {
  redirect(`/panel/rezerwacje?${error ? `error=${encodeURIComponent(error)}` : `result=${encodeURIComponent(result ?? "saved")}`}`);
}
export async function createPhoneBookingAction(form: FormData) {
  const staff = await requireStaff("inquiries.update");
  if (form.get("mode") !== "private" && form.get("mode") !== "shared") go("Wybierz tryb rezerwacji.");
  if (!process.env.DATABASE_URL) go("Brak połączenia z bazą danych.");
  const [business, schedule] = await Promise.all([getPublicBusiness(), getPublishedSchedule()]);
  const result = await createPhoneBooking(getPrisma(), formInput(form, staff.id), business.settings, schedule);
  if (!result.ok) go(result.error === "unavailable" ? "Termin jest zajęty lub grupa przekracza pozostałą pojemność." : "Sprawdź dane, datę i godzinę rezerwacji.");
  refresh();
  go(undefined, "created");
}
export async function updatePhoneBookingAction(form: FormData) {
  const staff = await requireStaff("inquiries.update");
  if (form.get("mode") !== "private" && form.get("mode") !== "shared") go("Wybierz tryb rezerwacji.");
  if (!process.env.DATABASE_URL) go("Brak połączenia z bazą danych.");
  const [business, schedule] = await Promise.all([getPublicBusiness(), getPublishedSchedule()]);
  const result = await updatePhoneBooking(getPrisma(), { ...formInput(form, staff.id), id: String(form.get("id") ?? "") }, business.settings, schedule);
  if (!result.ok) go(result.error === "unavailable" ? "Nowy termin jest zajęty lub grupa przekracza pozostałą pojemność." : "Nie udało się zmienić rezerwacji. Sprawdź wpisane dane.");
  refresh();
  go(undefined, "updated");
}
export async function cancelPhoneBookingAction(form: FormData) {
  const staff = await requireStaff("inquiries.update");
  if (!process.env.DATABASE_URL) go("Brak połączenia z bazą danych.");
  const cancelled = await cancelPhoneBooking(getPrisma(), String(form.get("id") ?? ""), staff.id);
  if (!cancelled) go("Rezerwacja została już anulowana lub nie istnieje.");
  refresh();
  go(undefined, "cancelled");
}
