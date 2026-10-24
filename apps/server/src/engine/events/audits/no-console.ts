// LOG_NO_CONSOLE_INDEX_V1
export interface ConsoleAuditHit {
  file: string;
  line: number;
  snippet: string;
  kind: "console.log" | "console.warn" | "console.error" | "console.info" | "console.debug";
}

export function detectConsoleUsage(source: string, file: string): ConsoleAuditHit[] {
  const out: ConsoleAuditHit[] = [];
  const lines = source.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(/\bconsole\.(log|warn|error|info|debug)\s*\(/);
    if (!m) continue;
    if (line.includes("// LOG_ALLOWED")) continue;
    if (file.endsWith("/index.ts") || file.endsWith("/worker-entry.ts")) continue;
    if (file.includes("/demo/")) continue;
    out.push({
      file,
      line: i + 1,
      snippet: line.trim().slice(0, 180),
      kind: `console.${m[1]}` as ConsoleAuditHit["kind"],
    });
  }
  return out;
}