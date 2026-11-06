import { randomUUID } from "node:crypto";

import type { Prisma, PrismaClient } from "@prisma/client";

import {
  BUSINESS_SLOT,
  type BusinessBundle,
  type BusinessProfileInput,
  type BusinessSettingsInput,
} from "@/lib/business/model";

type Db = PrismaClient | Prisma.TransactionClient;

function profileData(profile: BusinessProfileInput, version: number, actorId: string) {
  return {
    tradeName: profile.tradeName,
    legalName: profile.legalName,
    taxId: profile.taxId,
    street: profile.street,
    postalCode: profile.postalCode,
    city: profile.city,
    region: profile.region,
    country: profile.country,
    dataController: profile.dataController,
    description: profile.description,
    latitude: profile.latitude || null,
    longitude: profile.longitude || null,
    mapNote: profile.mapNote,
    version,
    updatedById: actorId,
  };
}

function contactData(contact: BusinessBundle["contact"], version: number, actorId: string) {
  return {
    phoneDisplay: contact.phoneDisplay,
    phoneHref: contact.phoneHref,
    emailDisplay: contact.emailDisplay,
    emailHref: contact.emailHref,
    hours: contact.hours,
    socialText: contact.socialText,
    directions: contact.directions,
    version,
    updatedById: actorId,
  };
}

function settingsData(settings: BusinessSettingsInput, version: number, actorId: string) {
  return {
    maxPlayersPerTeam: settings.maxPlayersPerTeam,
    minTeamsPerMatch: settings.minTeamsPerMatch,
    maxTeamsPerMatch: settings.maxTeamsPerMatch,
    maxPlayersPerSlot: settings.maxPlayersPerSlot,
    slotStartTimes: settings.slotStartTimes.join(","),
    slotDurationMinutes: settings.slotDurationMinutes,
    slotBufferMinutes: settings.slotBufferMinutes,
    allowSharedSlot: settings.allowSharedSlot,
    allowPrivateSlot: settings.allowPrivateSlot,
    equipmentSets: null,
    depositAmount: null,
    privateSlotSurcharge: null,
    paymentProvider: null,
    cancellationPolicy: null,
    commercialApproved: false,
    version,
    updatedById: actorId,
  };
}

export function toBundle(profile: {
  tradeName: string;
  legalName: string;
  taxId: string;
  street: string;
  postalCode: string;
  city: string;
  region: string;
  country: string;
  dataController: string;
  description: string;
  latitude: string | null;
  longitude: string | null;
  mapNote: string;
}, contact: {
  phoneDisplay: string;
  phoneHref: string;
  emailDisplay: string;
  emailHref: string;
  hours: string;
  socialText: string;
  directions: string;
}, settings: {
  maxPlayersPerTeam: number;
  minTeamsPerMatch: number;
  maxTeamsPerMatch: number;
  maxPlayersPerSlot: number;
  slotStartTimes: string;
  slotDurationMinutes: number;
  slotBufferMinutes: number;
  allowSharedSlot: boolean;
  allowPrivateSlot: boolean;
}): BusinessBundle {
  return {
    profile: {
      ...profile,
      latitude: profile.latitude ?? "",
      longitude: profile.longitude ?? "",
    },
    contact,
    settings: {
      maxPlayersPerTeam: settings.maxPlayersPerTeam,
      minTeamsPerMatch: settings.minTeamsPerMatch,
      maxTeamsPerMatch: settings.maxTeamsPerMatch,
      maxPlayersPerSlot: settings.maxPlayersPerSlot,
      slotStartTimes: settings.slotStartTimes.split(",").filter(Boolean),
      slotDurationMinutes: settings.slotDurationMinutes,
      slotBufferMinutes: settings.slotBufferMinutes,
      allowSharedSlot: settings.allowSharedSlot,
      allowPrivateSlot: settings.allowPrivateSlot,
    },
  };
}

async function readSlot(db: Db, slot: string): Promise<BusinessBundle | null> {
  const [profile, contact, settings] = await Promise.all([
    db.businessProfile.findUnique({ where: { id: slot } }),
    db.businessContact.findUnique({ where: { id: slot } }),
    db.businessSettings.findUnique({ where: { id: slot } }),
  ]);
  if (!profile || !contact || !settings) return null;
  return toBundle(profile, contact, settings);
}

export function readDraft(db: Db) {
  return readSlot(db, BUSINESS_SLOT.draft);
}

export function readPublished(db: Db) {
  return readSlot(db, BUSINESS_SLOT.published);
}

async function writeSlot(db: Db, slot: string, bundle: BusinessBundle, version: number, actorId: string) {
  await db.businessProfile.upsert({
    where: { id: slot },
    create: { id: slot, ...profileData(bundle.profile, version, actorId) },
    update: profileData(bundle.profile, version, actorId),
  });
  await db.businessContact.upsert({
    where: { id: slot },
    create: { id: slot, ...contactData(bundle.contact, version, actorId) },
    update: contactData(bundle.contact, version, actorId),
  });
  await db.businessSettings.upsert({
    where: { id: slot },
    create: { id: slot, ...settingsData(bundle.settings, version, actorId) },
    update: settingsData(bundle.settings, version, actorId),
  });
}

export async function saveCompanyDraft(db: PrismaClient, actorId: string, next: BusinessBundle) {
  const before = await readDraft(db);
  await db.$transaction(async (tx) => {
    const current = await tx.businessProfile.findUnique({ where: { id: BUSINESS_SLOT.draft }, select: { version: true } });
    const nextVersion = (current?.version ?? 0) + 1;
    await writeSlot(tx, BUSINESS_SLOT.draft, next, nextVersion, actorId);
    await tx.contentRevision.create({
      data: {
        id: randomUUID(),
        entity: "company",
        version: nextVersion,
        status: BUSINESS_SLOT.draft,
        snapshot: next as unknown as Prisma.InputJsonValue,
        actorId,
      },
    });
    await tx.configChangeAudit.create({
      data: {
        id: randomUUID(),
        actorId,
        entity: "company",
        action: "save_draft",
        before: (before ?? undefined) as Prisma.InputJsonValue | undefined,
        after: next as unknown as Prisma.InputJsonValue,
      },
    });
  });
}

export async function publishCompanyDraft(db: PrismaClient, actorId: string) {
  const draft = await readDraft(db);
  if (!draft) {
    return { ok: false as const, error: "Brak wersji roboczej do publikacji." };
  }
  const before = await readPublished(db);
  await db.$transaction(async (tx) => {
    const current = await tx.businessProfile.findUnique({ where: { id: BUSINESS_SLOT.published }, select: { version: true } });
    const nextVersion = (current?.version ?? 0) + 1;
    await writeSlot(tx, BUSINESS_SLOT.published, draft, nextVersion, actorId);
    await tx.contentRevision.create({
      data: {
        id: randomUUID(),
        entity: "company",
        version: nextVersion,
        status: BUSINESS_SLOT.published,
        snapshot: draft as unknown as Prisma.InputJsonValue,
        actorId,
      },
    });
    await tx.configChangeAudit.create({
      data: {
        id: randomUUID(),
        actorId,
        entity: "company",
        action: "publish",
        before: (before ?? undefined) as Prisma.InputJsonValue | undefined,
        after: draft as unknown as Prisma.InputJsonValue,
      },
    });
  });
  return { ok: true as const };
}
