const DAY_MS = 24 * 60 * 60 * 1000;

export function retentionCutoff(
  now = new Date(),
  raw = process.env.DATA_RETENTION_DAYS,
): Date | null {
  const value = raw?.trim() ?? "";
  if (!/^\d+$/.test(value)) {
    return null;
  }
  const days = Number(value);
  if (!Number.isInteger(days) || days < 1 || days > 3650) {
    return null;
  }
  return new Date(now.getTime() - days * DAY_MS);
}
