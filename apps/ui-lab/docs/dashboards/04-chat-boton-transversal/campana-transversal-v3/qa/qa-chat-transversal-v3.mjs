// CHAT_TRANSVERSAL_V3 — arnés de QA reproducible en CI.
// No se ejecutó desde este entorno (el Chromium local del sandbox no arranca):
// la evidencia de esta campaña está en qa/qa-resultados.json y qa/capturas/.
// Uso: BASE_URL=http://127.0.0.1:4173 SHOT_DIR=/tmp/chat-v3 node qa-chat-transversal-v3.mjs
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const base = process.env.BASE_URL ?? "http://127.0.0.1:4173";
const shotDir = process.env.SHOT_DIR ?? "/tmp/chat-v3";
const view = (tag) => `${base}/?embed=1&view=chat-transversal-v3&qa=${tag}-${Date.now()}`;
const results = [];

function record(name, ok, evidence = "") {
  results.push({ name, ok: Boolean(ok), evidence: String(evidence).slice(0, 240) });
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(String(error)));

async function desktop(width, height) {
  await page.setViewportSize({ width, height });
  await page.goto(view(`d${width}`), { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".ctv-fab");
  await page.click(".ctv-fab");
  await page.waitForSelector(".ctv-dock");
  await page.waitForTimeout(400);
  const metrics = await page.evaluate(() => {
    const dock = document.querySelector(".ctv-dock").getBoundingClientRect();
    const workspace = document.querySelector(".ctv-workspace").getBoundingClientRect();
    return {
      dock: Math.round(dock.width),
      workspace: Math.round(workspace.width),
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      page: document.documentElement.scrollHeight - window.innerHeight,
    };
  });
  record(`${width}: dock y workspace`, metrics.overflow <= 0 && metrics.workspace > 240 && metrics.page <= 0, metrics);

  const widths = [metrics.dock];
  for (let step = 0; step < 3; step += 1) {
    await page.click(".ctv-grip");
    await page.waitForTimeout(340);
    widths.push(await page.evaluate(() => Math.round(document.querySelector(".ctv-dock").getBoundingClientRect().width)));
  }
  record(`${width}: ciclo de anchos`, widths.length === 4 && widths[3] !== widths[0], widths);

  await page.click(".ctv-suggestions button");
  await page.click(".ctv-send");
  await page.waitForSelector(".ctv-msg--agent", { timeout: 15000 });
  record(`${width}: respuesta simulada`, true);

  await page.click(".ctv-tool[aria-label='Abrir acciones']");
  await page.waitForSelector(".ctv-actions[open]");
  record(`${width}: diez acciones`, (await page.locator(".ctv-action").count()) === 10);
  await page.keyboard.press("Escape");
}

async function mobile(width, height) {
  await page.setViewportSize({ width, height });
  await page.goto(view(`m${width}`), { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".ctv-fab");
  await page.click(".ctv-fab");
  await page.waitForSelector(".ctv-sheet");
  await page.waitForTimeout(420);
  const metrics = await page.evaluate(() => {
    const sheet = document.querySelector(".ctv-sheet").getBoundingClientRect();
    const composer = document.querySelector(".ctv-composer").getBoundingClientRect();
    return {
      height: Math.round(sheet.height),
      percent: Math.round((sheet.height / window.innerHeight) * 100),
      bottom: Math.round(window.innerHeight - sheet.bottom),
      composerVisible: composer.top >= 0 && composer.bottom <= window.innerHeight + 1,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      page: document.documentElement.scrollHeight - window.innerHeight,
    };
  });
  record(`${width}: hoja inferior`, metrics.percent >= 26 && metrics.bottom === 0 && metrics.composerVisible && metrics.overflow <= 0 && metrics.page <= 0, metrics);

  const heights = [metrics.height];
  for (let step = 0; step < 3; step += 1) {
    await page.click(".ctv-sheet-grip");
    await page.waitForTimeout(360);
    heights.push(await page.evaluate(() => Math.round(document.querySelector(".ctv-sheet").getBoundingClientRect().height)));
  }
  record(`${width}: cuatro alturas`, heights[0] < heights[1] && heights[3] > heights[2], heights);

  await page.click(".ctv-tool[aria-label='Conversación por voz']");
  await page.waitForSelector(".ctv-call--voice");
  await page.waitForTimeout(7000);
  record(`${width}: ideas progresivas`, (await page.locator(".ctv-call-ideas li").count()) >= 1);
  await page.click(".ctv-round--end");
  await page.waitForSelector(".ctv-report");
  record(`${width}: acta`, (await page.locator(".ctv-report").count()) === 1);
}

const dir = shotDir;
await mkdir(dir, { recursive: true });
for (const [width, height] of [[1440, 900], [1366, 768], [1280, 800], [1024, 768]]) {
  await desktop(width, height);
}
await page.screenshot({ path: `${dir}/escritorio.png` });
for (const [width, height] of [[768, 1024], [390, 844], [360, 800], [320, 568]]) {
  await mobile(width, height);
}

record("consola limpia", errors.length === 0, errors.join(" | "));

await browser.close();
const failed = results.filter((item) => !item.ok);
console.log(JSON.stringify({ total: results.length, failed: failed.length, results }, null, 2));
process.exitCode = failed.length ? 1 : 0;
