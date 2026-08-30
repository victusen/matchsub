export function normalizePlayerName(name) {
  if (!name || typeof name !== "string") return "";

  const cleaned = name.trim();

  // T. Malacia → Malacia
  // M. Ødegaard → Ødegaard
  // A. Santos → Santos
  return cleaned.replace(/^[A-ZÀ-ÖØ-Ý]\.\s*/u, "").trim();
}