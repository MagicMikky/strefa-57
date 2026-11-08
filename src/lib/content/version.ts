export class ContentVersionConflictError extends Error {
  constructor() {
    super("Ta wersja robocza została w międzyczasie zmieniona. Odśwież stronę i ponów zmiany.");
    this.name = "ContentVersionConflictError";
  }
}

export function expectedVersion(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

export function isContentVersionConflict(error: unknown): boolean {
  return (
    error instanceof ContentVersionConflictError ||
    (typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2002")
  );
}
