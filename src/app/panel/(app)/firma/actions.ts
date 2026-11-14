"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { normalizeBusiness, type BusinessBundle } from "@/lib/business/model";
import { publishCompanyDraft, saveCompanyDraft } from "@/lib/business/store";
import { ContentVersionConflictError, expectedVersion, isContentVersionConflict } from "@/lib/content/version";
import { getPrisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/staff/session";

function text(form: FormData, name: string) {
  return String(form.get(name) ?? "");
}

function bundleFromForm(form: FormData): { ok: true; value: BusinessBundle } | { ok: false; error: string } {
  return normalizeBusiness({
    profile: {
      tradeName: text(form, "tradeName"),
      legalName: text(form, "legalName"),
      taxId: text(form, "taxId"),
      street: text(form, "street"),
      registeredStreet: text(form, "registeredStreet"),
      registeredPostalCode: text(form, "registeredPostalCode"),
      registeredCity: text(form, "registeredCity"),
      postalCode: text(form, "postalCode"),
      city: text(form, "city"),
      region: text(form, "region"),
      country: text(form, "country"),
      dataController: text(form, "dataController"),
      description: text(form, "description"),
      latitude: text(form, "latitude"),
      longitude: text(form, "longitude"),
      mapNote: text(form, "mapNote"),
    },
    contact: {
      phoneDisplay: text(form, "phoneDisplay"),
      emailDisplay: text(form, "emailDisplay"),
      hours: text(form, "hours"),
      socialText: text(form, "socialText"),
      directions: text(form, "directions"),
    },
    settings: {
      minPlayersPerBooking: Number(form.get("minPlayersPerBooking")),
      maxPlayersPerTeam: Number(form.get("maxPlayersPerTeam")),
      minTeamsPerMatch: Number(form.get("minTeamsPerMatch")),
      maxTeamsPerMatch: Number(form.get("maxTeamsPerMatch")),
      maxPlayersPerSlot: Number(form.get("maxPlayersPerSlot")),
      slotStartTimes: text(form, "slotStartTimes").split(",").map((item) => item.trim()).filter(Boolean),
      slotDurationMinutes: Number(form.get("slotDurationMinutes")),
      slotBufferMinutes: Number(form.get("slotBufferMinutes")),
      allowSharedSlot: form.get("allowSharedSlot") === "on",
      allowPrivateSlot: form.get("allowPrivateSlot") === "on",
      depositAmount: text(form, "depositAmount"),
      campfirePrice: text(form, "campfirePrice"),
      grillPrice: text(form, "grillPrice"),
    },
  });
}

function refreshPublicPages() {
  revalidatePath("/", "layout");
  revalidatePath("/kontakt");
  revalidatePath("/dojazd");
  revalidatePath("/zapytaj-o-termin");
}

export async function saveCompanyDraftAction(form: FormData) {
  const actor = await requireStaff("business.publish");
  const parsed = bundleFromForm(form);
  if (!parsed.ok) redirect(`/panel/firma?error=${encodeURIComponent(parsed.error)}`);
  const version = expectedVersion(form.get("version"));
  if (version === null) redirect("/panel/firma?error=Nieprawid%C5%82owa+wersja+formularza.");
  try {
    await saveCompanyDraft(getPrisma(), actor.id, parsed.value, version);
  } catch (error) {
    if (isContentVersionConflict(error)) {
      redirect(`/panel/firma?error=${encodeURIComponent(new ContentVersionConflictError().message)}`);
    }
    throw error;
  }
  redirect("/panel/firma?saved=draft");
}

export async function publishCompanyAction() {
  const actor = await requireStaff("business.publish");
  const result = await publishCompanyDraft(getPrisma(), actor.id);
  if (!result.ok) redirect(`/panel/firma?error=${encodeURIComponent(result.error)}`);
  refreshPublicPages();
  redirect("/panel/firma?saved=published");
}
