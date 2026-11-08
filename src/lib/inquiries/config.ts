export function getRateLimitSalt(): string | null {
  const salt = process.env.RATE_LIMIT_SALT?.trim() ?? "";
  return salt.length >= 16 ? salt : null;
}
