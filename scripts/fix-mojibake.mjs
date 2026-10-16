import { readFileSync, writeFileSync } from "node:fs";

const CP1252_TO_UNICODE = {
  0x80: 0x20AC, 0x82: 0x201A, 0x83: 0x0192, 0x84: 0x201E, 0x85: 0x2026,
  0x86: 0x2020, 0x87: 0x2021, 0x88: 0x02C6, 0x89: 0x2030, 0x8A: 0x0160,
  0x8B: 0x2039, 0x8C: 0x0152, 0x8E: 0x017D, 0x91: 0x2018, 0x92: 0x2019,
  0x93: 0x201C, 0x94: 0x201D, 0x95: 0x2022, 0x96: 0x2013, 0x97: 0x2014,
  0x98: 0x02DC, 0x99: 0x2122, 0x9A: 0x0161, 0x9B: 0x203A, 0x9C: 0x0153,
  0x9E: 0x017E, 0x9F: 0x0178,
};

const UNICODE_TO_CP1252 = Object.fromEntries(
  Object.entries(CP1252_TO_UNICODE).map(([b, u]) => [u, Number(b)])
);

const MARKER = /[ÃÂð]/;
function toCp1252Bytes(s) {
  const bytes = [];
  for (const ch of s) {
    const cp = ch.codePointAt(0);
    if (cp <= 0x7F) {
      bytes.push(cp);
    } else if (cp >= 0x80 && cp <= 0x9F) {
      bytes.push(cp);
    } else if (cp <= 0xFF) {
      bytes.push(cp);
    } else if (UNICODE_TO_CP1252[cp] !== undefined) {
      bytes.push(UNICODE_TO_CP1252[cp]);
    } else {
      return null;
    }
  }
  return Buffer.from(bytes);
}

function reverseOne(s) {
  const bytes = toCp1252Bytes(s);
  if (!bytes) return null;
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

function fixLine(line) {
  if (!MARKER.test(line)) return line;
  let s = line;
  for (let i = 0; i < 10; i++) {
    const next = reverseOne(s);
    if (next === null || next === s) break;
    s = next;
  }
  if (MARKER.test(s)) {
    const cut = s.search(MARKER);
    const head = (cut > 0 ? s.slice(0, cut) : s.slice(0, 200)).replace(/\s+$/, "");
    return head + (line.trimStart().startsWith("*") ? " */" : "");
  }
  return s;
}

const file = process.argv[2];
if (!file) {
  console.error("Uso: node scripts/fix-mojibake.mjs <fichero>");
  process.exit(1);
}

const raw = readFileSync(file, "utf8");
const hasCRLF = raw.includes("\r\n");
const lines = raw.split(/\r?\n/);
const fixed = lines.map(fixLine);
const output = fixed.join(hasCRLF ? "\r\n" : "\n");

const criticalMarkers = [
  "WORKER_RETRY_V1",
  "KERNEL_V2",
  "WORKER_MAX_ACTIVE_V1",
  "export class TaskWorker",
  "export class Kernel",
];
const originalText = lines.join("\n");
const missing = criticalMarkers.filter(
  (m) => originalText.includes(m) && !output.includes(m)
);
if (missing.length > 0) {
  console.error("ABORT: el fix perderia etiquetas criticas:", missing);
  process.exit(2);
}

writeFileSync(file, output, "utf8");
const maxLine = Math.max(...fixed.map((l) => l.length));
const markerCount = (output.match(/[ÃÂð]/g) || []).length;
console.log(`${file}: bytes ${raw.length} -> ${output.length}, maxLine ${maxLine}, markers ${markerCount}`);
