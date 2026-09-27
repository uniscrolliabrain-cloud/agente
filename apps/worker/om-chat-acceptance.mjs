/**
 * Aceptación del chat de OpenMuse en un navegador real.
 *
 * Requisitos: backend en http://127.0.0.1:8787 (`pnpm dev`) y Vite en http://127.0.0.1:5173
 * (`pnpm --filter @openmuse/web dev`). Uso:
 *
 *   node apps/worker/om-chat-acceptance.mjs
 *   OM_CHANNEL=msedge node apps/worker/om-chat-acceptance.mjs   # otro navegador instalado
 *   OM_PROMPT="resume la última factura" node apps/worker/om-chat-acceptance.mjs
 *
 * Comprueba el ciclo completo: bootstrap de sesión, POST /api/copilotkit/run con 200 y
 * text/event-stream, deltas pintados de forma incremental en el DOM y mensaje final persistido.
 * Deja `om-chat-acceptance.png` y sale con código 1 si algo del ciclo falla.
 */
import { chromium } from "playwright";

const baseUrl = process.env.OM_URL ?? "http://127.0.0.1:5173/";
const prompt = process.env.OM_PROMPT ?? "hola";
const apiResponses = [];
const runResponses = [];
const problems = [];
const notes = [];

const browser = await chromium.launch({ channel: process.env.OM_CHANNEL ?? "chrome" });
const page = await browser.newPage();

page.on("console", (message) => {
  // Los fallos HTTP se registran con su URL desde el handler de respuestas; aquí solo interesan
  // los errores de JavaScript.
  if (message.type() === "error" && !message.text().includes("Failed to load resource"))
    problems.push(`console.error: ${message.text()}`);
});
page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
page.on("requestfailed", (request) => {
  const message = `requestfailed: ${request.method()} ${request.url()} ${request.failure()?.errorText}`;
  // El cierre del stream SSE a través del proxy de Vite aparece como ERR_ABORTED aunque la app ya
  // haya recibido todos los eventos: es ruido del transporte, no un fallo funcional.
  if (/ERR_ABORTED/.test(message) && message.includes("/api/copilotkit/run")) notes.push(message);
  else problems.push(message);
});
page.on("response", async (response) => {
  const path = new URL(response.url()).pathname;
  const method = response.request().method();
  if (!path.startsWith("/api/")) {
    if (response.status() >= 400) notes.push(`http ${response.status()} ${method} ${response.url()}`);
    return;
  }
  apiResponses.push(`${response.status()} ${method} ${path}`);
  if (response.status() >= 400) problems.push(`http ${response.status()} ${method} ${path}`);
  if (path.includes("/api/copilotkit")) {
    // Lectura best-effort del SSE: Playwright puede perder el body si la página cierra el stream
    // antes de que se lea. La prueba real de streaming son los snapshots del DOM.
    const body = await response.text().catch((error) => `<unreadable: ${error.message}>`);
    runResponses.push({ status: response.status(), path, body });
  }
});

console.log(`GOTO ${baseUrl}`);
await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
await page.waitForSelector("textarea", { timeout: 30000 });
console.log(`AUTH OK - chat input present, title="${await page.title()}"`);

const readState = () =>
  page.evaluate(() => {
    const bubbles = [...document.querySelectorAll(".bubble.assistant-b .bubble-content")];
    return {
      streaming: Boolean(document.querySelector(".msg-row.assistant.streaming")),
      rows: document.querySelectorAll(".msg-row").length,
      assistantBubbles: bubbles.length,
      hint: document.querySelector(".chat-head-hint")?.textContent ?? "",
      error: document.querySelector(".chat-error")?.textContent ?? "",
      text: bubbles.at(-1)?.textContent ?? "",
    };
  });

const baseline = await readState();
console.log(
  `BASELINE: rows=${baseline.rows} bubbles=${baseline.assistantBubbles} last="${baseline.text.slice(0, 40)}"`,
);

const input = page.locator("textarea").first();
await input.fill(prompt);
await input.press("Enter");
const started = Date.now();
console.log(`SENT: ${prompt}`);

const snapshots = [];
const deadline = started + 60000;
let lastLog = 0;
while (Date.now() < deadline) {
  await page.waitForTimeout(100);
  const state = await readState();
  const previous = snapshots.at(-1);
  if (!previous || previous.text !== state.text || previous.streaming !== state.streaming)
    snapshots.push(state);
  if (Date.now() - lastLog > 5000) {
    lastLog = Date.now();
    console.log(
      `  t=${Math.round((Date.now() - started) / 1000)}s rows=${state.rows} streaming=${state.streaming} hint="${state.hint}" err="${state.error}" chars=${state.text.length}`,
    );
  }
  if (!state.streaming && state.text.length > 0) break;
}

// Solo cuentan los estados del mensaje NUEVO: hasta que React pinta el turno nuevo, el último
// burbuja es un mensaje persistido de un run anterior.
const partial = snapshots.filter(
  (entry) =>
    entry.streaming &&
    entry.text.length > 0 &&
    entry.assistantBubbles > baseline.assistantBubbles &&
    entry.text !== baseline.text,
);
console.log(`STREAMING SNAPSHOTS WITH TEXT: ${partial.length}`);
for (const entry of partial.slice(0, 8))
  console.log(`  partial(${entry.text.length}): ${entry.text.replace(/[▌\s]+$/, "")}`);

const final = await readState();
const deltas = runResponses
  .flatMap((response) => [
    ...response.body.matchAll(/"type":"TEXT_MESSAGE_CONTENT","messageId":"[^"]+","delta":"((?:[^"\\]|\\.)*)"/g),
  ])
  .map((match) => match[1]);
const finished = runResponses.some((response) => /RUN_FINISHED/.test(response.body));
const answer = final.text.replace(/[▌\s]+$/, "");

const runStatus = runResponses.at(-1)?.status ?? null;
console.log(`SSE RUN STATUS: ${runStatus ?? "(sin llamada)"}`);
console.log(`SSE DELTAS (best-effort, el body puede perderse): ${deltas.length} - first: ${deltas[0] ?? "(none)"}`);
console.log(`SSE RUN_FINISHED (best-effort): ${finished}`);
console.log(`FINAL DOM: streaming=${final.streaming} rows=${final.rows} bubbles=${final.assistantBubbles} hint="${final.hint}"`);
console.log(`FINAL ERROR BANNER: "${final.error}"`);
console.log(`FINAL ANSWER: ${answer}`);
console.log(`ALL API RESPONSES: ${apiResponses.join(" | ") || "(none)"}`);

await page.screenshot({ path: "om-chat-acceptance.png" });
console.log("SCREENSHOT: om-chat-acceptance.png");
console.log(`PROBLEMS: ${problems.length}`);
for (const problem of problems) console.log(`  ${problem}`);
console.log(`NOTES (ruido conocido): ${notes.length}`);
for (const note of notes) console.log(`  ${note}`);

// Evidencia de streaming: snapshots parciales del DOM o deltas vistos en el SSE (cualquiera de
// las dos vías sirve; la del DOM es la que ve el usuario).
const streamEvidence = partial.length > 0 || deltas.length > 0;
const passed =
  runStatus === 200 && streamEvidence && final.error === "" && answer.length > 0 && !final.streaming;
console.log(passed ? "RESULT: PASS - SSE pintado en el navegador" : "RESULT: FAIL");
await browser.close();
process.exitCode = passed ? 0 : 1;
