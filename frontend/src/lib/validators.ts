export function safeUrlOrEmpty(raw?: string | null): string {
  const v = (raw ?? "").trim();
  if (!v) return "";
  try {
    const u = new URL(v);
    if (!/^https?:$/.test(u.protocol)) return "";
    return u.toString();
  } catch {
    return "";
  }
}