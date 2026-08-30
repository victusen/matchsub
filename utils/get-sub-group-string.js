import reformPostName from "./reform-post-name.js"

export default function getSubGroupString(events) {
  if (!Array.isArray(events) || !events.length) {
    return "";
  }

  const firstMinute = events[0]?.time?.elapsed ?? "";

  const subOut = events
    .map(e => reformPostName(e.player?.name ?? ""))
    .filter(Boolean)
    .join(", ");

  const subIn = events
    .map(e => reformPostName(e.assist?.name ?? ""))
    .filter(Boolean)
    .join(", ");

  return `⬆️ Sub-out: ${subOut} (${firstMinute}')\n\n⬇️ Sub-in: ${subIn}`;
}

/* function getSubString(ev) {
  let subStr = "";
  if (Array.isArray(ev)) {
    ev.forEach(e => {
      subStr += `⬆️ Sub-out: ${e.player?.name ?? ""} (${e.time.elapsed}') \n⬇️ Sub-in: ${e.assist?.name ?? ""}\n\n`
    })
  }
  return subStr;
} */
// space-grouped sub post logic