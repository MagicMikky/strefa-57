export const CONSENT_STORAGE_KEY = "strefa29-cookie-consent-v1";

export type ConsentPreferences = {
  essential: true;
  analytics: boolean;
  updatedAt: string;
};

export type AnalyticsEventName =
  | "inquiry_start"
  | "inquiry_submit_success"
  | "inquiry_submit_error"
  | "contact_phone_click"
  | "contact_email_click"
  | "directions_click"
  | "pricing_view"
  | "package_inquiry_click"
  | "gallery_view";

const sensitiveAnalyticsKeys = new Set(["email", "phone", "name", "message"]);

export function publicAnalyticsProperties(
  properties: Record<string, string | number | boolean>,
): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(properties).filter(([key]) => !sensitiveAnalyticsKeys.has(key.toLowerCase())),
  );
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function readConsent(): ConsentPreferences | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentPreferences>;
    if (parsed.essential !== true || typeof parsed.analytics !== "boolean") return null;
    return {
      essential: true,
      analytics: parsed.analytics,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveConsent(analytics: boolean): ConsentPreferences {
  const preferences: ConsentPreferences = {
    essential: true,
    analytics,
    updatedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(preferences));
  window.dispatchEvent(new CustomEvent("strefa29:consent-change", { detail: preferences }));
  return preferences;
}

export function trackEvent(event: AnalyticsEventName, properties: Record<string, string | number | boolean> = {}) {
  if (typeof window === "undefined" || readConsent()?.analytics !== true) return;

  const payload = { event, ...publicAnalyticsProperties(properties) };
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);
  window.dispatchEvent(new CustomEvent("strefa29:analytics", { detail: payload }));
}
