"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { fallbackSiteCopy, normalizeSiteCopy } from "@/lib/content/model";
import { publishSiteDraft, saveSiteDraft } from "@/lib/content/store";
import { ContentVersionConflictError, expectedVersion, isContentVersionConflict } from "@/lib/content/version";
import { getPrisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/staff/session";

function text(form: FormData, name: string) {
  return String(form.get(name) ?? "");
}

function copyFromForm(form: FormData) {
  const base = fallbackSiteCopy();
  const faq = [];
  for (let index = 0; index < 12; index += 1) {
    const question = text(form, `faqQuestion_${index}`).trim();
    const answer = text(form, `faqAnswer_${index}`).trim();
    if (!question && !answer) continue;
    faq.push({ question, answer });
  }
  return normalizeSiteCopy({
    seo: {
      home: { title: text(form, "seoHomeTitle"), description: text(form, "seoHomeDescription") },
      faq: { title: text(form, "seoFaqTitle"), description: text(form, "seoFaqDescription") },
      oferta: { title: text(form, "seoOfertaTitle"), description: text(form, "seoOfertaDescription") },
      cennik: { title: text(form, "seoCennikTitle"), description: text(form, "seoCennikDescription") },
    },
    faq,
    attractions: base.attractions.map((_, index) => ({
      title: text(form, `attractionTitle_${index}`),
      description: text(form, `attractionDescription_${index}`),
    })),
    packages: base.packages.map((item, index) => ({
      id: item.id,
      name: text(form, `packageName_${index}`),
      eyebrow: text(form, `packageEyebrow_${index}`),
      description: text(form, `packageDescription_${index}`),
      features: text(form, `packageFeatures_${index}`).split("\n").map((line) => line.trim()).filter(Boolean),
      featured: form.get(`packageFeatured_${index}`) === "on",
    })),
  });
}

function refresh() {
  revalidatePath("/", "layout");
  revalidatePath("/faq");
  revalidatePath("/oferta");
  revalidatePath("/cennik");
  revalidatePath("/zapytaj-o-termin");
}

export async function saveSiteDraftAction(form: FormData) {
  const actor = await requireStaff("business.publish");
  const parsed = copyFromForm(form);
  if (!parsed.ok) redirect(`/panel/tresci?error=${encodeURIComponent(parsed.error)}`);
  const version = expectedVersion(form.get("version"));
  if (version === null) redirect("/panel/tresci?error=Nieprawid%C5%82owa+wersja+formularza.");
  try {
    await saveSiteDraft(getPrisma(), actor.id, parsed.value, version);
  } catch (error) {
    if (isContentVersionConflict(error)) {
      redirect(`/panel/tresci?error=${encodeURIComponent(new ContentVersionConflictError().message)}`);
    }
    throw error;
  }
  redirect("/panel/tresci?saved=draft");
}

export async function publishSiteAction() {
  const actor = await requireStaff("business.publish");
  const result = await publishSiteDraft(getPrisma(), actor.id);
  if (!result.ok) redirect(`/panel/tresci?error=${encodeURIComponent(result.error)}`);
  refresh();
  redirect("/panel/tresci?saved=published");
}
