import { createHash } from "node:crypto";
export interface ProvenanceSegment {
  start: number;
  end: number;
  text: string;
  digest: string;
}
/** Offsets are UTF-16 code units into the exact original text; no normalization. */
export function segmentText(source: string, max = 2400, overlap = 200): ProvenanceSegment[] {
  if (
    typeof source !== "string" ||
    source.length > 2_000_000 ||
    !Number.isSafeInteger(max) ||
    !Number.isSafeInteger(overlap) ||
    max < 2 ||
    max > 64_000 ||
    overlap < 0 ||
    overlap >= max - 1
  )
    throw Error("SEGMENT_CONFIG");
  // Reject malformed Unicode rather than hashing UTF-8 replacement characters.
  for (let i = 0; i < source.length; i++) {
    const code = source.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      const low = source.charCodeAt(++i);
      if (!(low >= 0xdc00 && low <= 0xdfff)) throw Error("SEGMENT_UNICODE");
    } else if (code >= 0xdc00 && code <= 0xdfff) throw Error("SEGMENT_UNICODE");
  }
  const out: ProvenanceSegment[] = [];
  let start = 0;
  while (start < source.length) {
    let end = Math.min(source.length, start + max);
    const last = source.charCodeAt(end - 1);
    if (end < source.length && last >= 0xd800 && last <= 0xdbff) end--;
    if (end <= start || out.length >= 10_000) throw Error("SEGMENT_BUDGET");
    const text = source.slice(start, end);
    const digest = createHash("sha256")
      .update(JSON.stringify(["original-utf16-v1", start, end, text]))
      .digest("hex");
    out.push({ start, end, text, digest });
    if (end === source.length) break;
    let next = Math.max(start + 1, end - overlap);
    const code = source.charCodeAt(next);
    if (code >= 0xdc00 && code <= 0xdfff) next--;
    if (next <= start) next = end;
    start = next;
  }
  return out;
}
