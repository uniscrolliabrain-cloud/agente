// C15_COGNITION_GATE_V2: report actual gate evidence; never turn local fixtures
// into provider, RLS, pilot, founder approval or production certification.
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
const argument = process.argv.find((value) => value.startsWith("--from-gate="));
const path = resolve(argument?.slice("--from-gate=".length) ?? "artifacts/gate/report.json");
try {
  const source = JSON.parse(readFileSync(path, "utf8")) as {
    git?: { head?: string }; steps?: { name: string; exitCode: number | null; ok: boolean; logFile: string | null }[];
  };
  if (!source.git?.head || !Array.isArray(source.steps) || !source.steps.some((step) => step.name === "test")) throw Error("A full executed repository gate is required");
  const blockers = [
    { campaign: "C05", status: "PARTIAL", reason: "Founder approved agntiapro.cards 1.0.0; implementation requires current integration, ablation and scale evidence" },
    { campaign: "C08", status: "BLOCKED_EXTERNAL", reason: "JEV identity/API and provider sandbox are not verified; rules baseline only" },
    { campaign: "C13", status: "BLOCKED_EXTERNAL", reason: "Anam media, physical playback ACK/barge-in, consent operations and provider contract are not certified" },
    { campaign: "C14", status: "BLOCKED_CONFIGURATION", reason: "Real parent PDP, credential broker and human child delegations remain unconfigured; synthetic contracts only" },
    { campaign: "C15", status: "PARTIAL", reason: "Shared restricted-role RLS, provider costs/SLO, canary, complete legacy retirement and founder GO remain pending" },
  ];
  const report = { schemaVersion: "2.0", testedCommit: source.git.head, sourceGate: path,
    generatedAt: new Date().toISOString(), steps: source.steps, repositoryGateOk: source.steps.every((step) => step.ok),
    blockers, certification: "NOT_CERTIFIED", productionReady: false, decision: "NO_GO" };
  mkdirSync("artifacts/cognition-v2", { recursive: true });
  writeFileSync("artifacts/cognition-v2/acceptance.json", JSON.stringify(report, null, 2));
  process.stdout.write(JSON.stringify({ testedCommit: report.testedCommit, repositoryGateOk: report.repositoryGateOk, decision: report.decision, blockers: report.blockers }, null, 2) + "\n");
  process.exitCode = 1;
} catch (error) {
  process.stderr.write(`C15 NOT_RUN: ${error instanceof Error ? error.message : "Missing gate evidence"}\n`);
  process.exitCode = 2;
}
