
export default function reformPostName(name) {
  if (!name || typeof name !== "string") return name;

  const words = name.trim().split(/\s+/).filter(Boolean);

  if (!words.length) return "";

  const cleaned = words.filter((word) => {
    const token = word.replace(/[.,]/g, "");

    // e.g 1. FC Köln -> FC Köln
    if (/^\d+$/.test(token)) {
      return false;
    }

    // e.g RB Leipzig -> Leipzig
    if (/^[A-Z]{1,3}\.?$/.test(word)) {
      return false;
    }

    return true;
  });

  return cleaned.length ? cleaned.join(" ") : name.trim();
}
