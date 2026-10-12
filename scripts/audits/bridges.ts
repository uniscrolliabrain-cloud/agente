// SCRIPTS_AUDIT_BRIDGES_V1
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

interface Bridge {
  id: string;
  from: string;
  to: string;
  files: string[];
  marks: string[];
}

const BRIDGES: Bridge[] = [
  { id: "bus-to-kernel", from: "bus", to: "kernel", files: ["apps/server/src/kernel/subscribers/events.ts"], marks: ["KERNEL_SUBSCRIBER_EVENTS_V1"] },
  { id: "kernel-to-bus", from: "kernel", to: "bus", files: ["apps/server/src/kernel/subscribers/bus-emitter.ts"], marks: ["KERNEL_SUBSCRIBER_BUS_EMITTER_V1"] },
  { id: "promoter-to-memory", from: "promoter", to: "memory", files: ["apps/server/src/kernel/graph/promote.ts"], marks: ["PROMOTER_WRITE_MEMORY_V1"] },
  { id: "promoter-to-graph", from: "promoter", to: "graph", files: ["apps/server/src/kernel/graph/promote.ts"], marks: ["PROMOTER_WRITE_GRAPH_V1"] },
  { id: "promoter-to-audit", from: "promoter", to: "audit", files: ["apps/server/src/kernel/graph/promote.ts"], marks: ["PROMOTER_WRITE_AUDIT_V1"] },
  { id: "presenter-to-sse", from: "presenter", to: "sse", files: ["apps/server/src/kernel/observers/presenter-sse.ts"], marks: ["PRESENTER_TURN_TO_SSE_HELPER_V1"] },
  { id: "meta-to-prompt", from: "meta", to: "prompt", files: ["apps/server/src/engine/context/meta-hints-prompt.ts"], marks: ["META_HINTS_TO_PROMPT_HELPER_V1"] },
  { id: "build-apply", from: "build", to: "registry", files: ["apps/server/src/engine/build-applier.ts"], marks: ["BUILD_SERVICE_APPLY_V1"] },
  { id: "state-changed-consumer", from: "bus", to: "state-log", files: ["apps/server/src/engine/events/consumers/state-changed.ts"], marks: ["STATE_CHANGED_CONSUMER_V1"] },
  { id: "state-denied-consumer", from: "bus", to: "state-log", files: ["apps/server/src/engine/events/consumers/state-denied.ts"], marks: ["STATE_DENIED_CONSUMER_V1"] },
  { id: "verification-disagreement", from: "bus", to: "approval", files: ["apps/server/src/engine/events/consumers/verification-disagreement.ts"], marks: ["VERIFICATION_DISAGREEMENT_CONSUMER_V1"] },
  { id: "kernel-audit-consumer", from: "bus", to: "kernel-audit", files: ["apps/server/src/kernel/subscribers/audit-consumer.ts"], marks: ["KERNEL_AUDIT_CONSUMER_V1"] },
  { id: "kernel-metrics-consumer", from: "bus", to: "metrics", files: ["apps/server/src/kernel/subscribers/metrics-consumer.ts"], marks: ["KERNEL_METRICS_THOUGHTS_V1"] },
  { id: "kernel-notifications-consumer", from: "bus", to: "notifications", files: ["apps/server/src/kernel/subscribers/notifications-consumer.ts"], marks: ["KERNEL_NOTIFICATIONS_CONSUMER_V1"] },
  { id: "meta-hints-store", from: "conversation", to: "meta-hints-db", files: ["apps/server/src/engine/feedback/meta-hints-store.ts"], marks: ["KERNEL_META_HINTS_DB_V1"] },
  { id: "personas-bootstrap", from: "index", to: "personas", files: ["apps/server/src/kernel/personas-bootstrap.ts"], marks: ["KERNEL_PERSONAS_BOOTSTRAP_REGISTRY_V1"] },
];

async function check(bridge: Bridge): Promise<{ ok: boolean; missing: string[]; markMissing: string[] }> {
  const missing: string[] = [];
  const markMissing: string[] = [];
  for (const file of bridge.files) {
    if (!existsSync(file)) {
      missing.push(file);
      continue;
    }
    const src = await readFile(file, "utf8");
    for (const mark of bridge.marks) {
      if (!src.includes(mark)) markMissing.push(`${file}::${mark}`);
    }
  }
  return { ok: missing.length === 0 && markMissing.length === 0, missing, markMissing };
}

async function main() {
  const results: Array<{ bridge: Bridge; result: Awaited<ReturnType<typeof check>> }> = [];
  for (const b of BRIDGES) {
    results.push({ bridge: b, result: await check(b) });
  }
  const wired = results.filter((r) => r.result.ok).length;
  const lines = [
    "# Auditoria de puentes",
    "",
    `> ${new Date().toISOString()}`,
    "",
    `- Puentes definidos: **${BRIDGES.length}**`,
    `- Wired: **${wired}**`,
    `- Broken: **${BRIDGES.length - wired}**`,
    "",
    "| Puente | From | To | Estado | Ficheros | Marcas faltantes |",
    "|---|---|---|---|---|---|",
    ...results.map(({ bridge, result }) =>
      `| ${bridge.id} | ${bridge.from} | ${bridge.to} | ${result.ok ? "OK" : "MISS"} | ${result.missing.join(", ") || "-"} | ${result.markMissing.join(", ") || "-"} |`,
    ),
    "",
  ];
  await mkdir("docs", { recursive: true });
  await writeFile("docs/AUDIT_BRIDGES.md", lines.join("\n"), "utf8");
  console.log(`[audit:bridges] ${wired}/${BRIDGES.length} wired`);
  if (wired < BRIDGES.length) process.exit(1);
}

void main().catch((e) => {
  console.error("[audit:bridges] FALLO:", e instanceof Error ? e.message : e);
  process.exit(1);
});