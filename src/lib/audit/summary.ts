const areas: Record<string, string> = {
  company: "Firma",
  "site-content": "Treści",
  gallery: "Galeria",
  schedule: "Harmonogram",
};

const actions: Record<string, string> = {
  save_draft: "zapis wersji roboczej",
  publish: "publikacja",
};

export function describeAudit(entry: { entity: string; action: string; createdAt: string }): string {
  const area = areas[entry.entity] ?? "Inny zapis";
  const action = actions[entry.action] ?? "zmiana";
  return `${warsawStamp(entry.createdAt)} · ${area} · ${action}`;
}

function warsawStamp(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const pick = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${pick("year")}-${pick("month")}-${pick("day")} ${pick("hour")}:${pick("minute")}`;
}
