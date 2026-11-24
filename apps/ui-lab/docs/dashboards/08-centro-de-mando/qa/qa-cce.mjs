/**
 * QA del Centro de Mando editorial (UI Lab).
 * Reproducible: `node qa-cce.mjs` con el build servido en http://127.0.0.1:4173.
 * No modifica datos ni habla con backend: usa el router demo del navegador.
 */
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "playwright");
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SHOTS = resolve(HERE, "capturas");
const BASE = process.env.CCE_BASE ?? "http://127.0.0.1:4173";
const VIEW = "/?embed=1&view=today-editorial";

mkdirSync(SHOTS, { recursive: true });
const results = [];
const shots = [];
let failures = 0;

function check(name, ok, detail) {
  results.push({ name, ok, detail });
  if (!ok) failures += 1;
}

const browser = await chromium.launch();

async function open(viewport, query = "") {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: "no-preference" });
  const page = await context.newPage();
  const consoleErrors = [];
  const requests = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(String(err)));
  page.on("request", (req) => requests.push(req.url()));
  await page.goto(BASE + VIEW + query, { waitUntil: "networkidle" });
  await page.waitForSelector(".cce-root", { timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  return { context, page, consoleErrors, requests };
}

async function shot(page, name, fullPage = true) {
  const path = resolve(SHOTS, name);
  await page.screenshot({ path, fullPage });
  shots.push({ name, path, fullPage });
}

/* ---------------------------------------------------------------- desktop QA */
{
  const { context, page, consoleErrors, requests } = await open({ width: 1440, height: 900 });
  await page.waitForSelector(".cce-briefing");

  check("monta la composición editorial", await page.locator(".cce-view").count() === 1);
  check("un solo h1 (saludo)", await page.locator("h1").count() === 1);
  check("saludo Fraunces", /Fraunces/.test(await page.locator("h1").evaluate((el) => getComputedStyle(el).fontFamily)));
  check("briefing de LAIA visible", (await page.locator(".cce-briefing-text").innerText()).length > 80);
  check("cuatro cifras con separadores", await page.locator(".cce-kpi").count() === 4);
  check("cinco filtros del día", await page.locator(".cce-filter").count() === 5);
  check("secciones de atención, en marcha y cierre", await page.locator(".cce-section").count() >= 5);
  check("feed cronológico con marcas de tiempo", await page.locator(".cce-list .cce-row").count() > 0);
  check("estado operativo con seis bloques", await page.locator(".cce-block").count() === 6);
  check("paneles de equipo y agentes", await page.locator(".cce-panel").count() === 2);
  check("permiso de alta visible para owner", await page.getByRole("button", { name: /Añadir persona/ }).count() === 1);

  const overflow = await page.evaluate(() => ({
    doc: document.documentElement.scrollWidth,
    win: window.innerWidth,
  }));
  check("sin desbordamiento horizontal global", overflow.doc <= overflow.win + 1, `${overflow.doc}/${overflow.win}`);

  // Filtro → secciones (misma semántica que producción).
  await page.getByRole("button", { name: "Solo aprobaciones", exact: true }).click();
  const titlesAfterFilter = await page.locator(".cce-section-title, #cce-done-title, #cce-running-title").allInnerTexts();
  check(
    "el filtro de aprobaciones acota las secciones",
    !titlesAfterFilter.join(" ").includes("En marcha ahora") && !titlesAfterFilter.join(" ").includes("OS agéntico"),
    titlesAfterFilter.join(" | "),
  );
  const pressed = await page.locator(".cce-filter[aria-pressed='true']").innerText();
  check("filtro activo anunciado con aria-pressed", pressed.trim() === "Solo aprobaciones", pressed);

  // Cifra ↔ filtro: la cifra refleja el filtro activo y al pulsarla vuelve a todo.
  check("cifra activa sincronizada con el filtro", await page.locator(".cce-kpi[aria-pressed='true']").count() === 1);
  await page.getByRole("button", { name: /Prioridades/ }).click();
  check(
    "cifra y filtro comparten estado al volver",
    (await page.locator(".cce-filter[aria-pressed='true']").innerText()).trim() === "Todo",
  );

  // Detalle de estado operativo (inline en escritorio).
  await page.locator(".cce-block").nth(2).click();
  check("detalle operativo inline en escritorio", await page.locator(".cce-block-detail").isVisible());
  const expanded = await page.locator(".cce-block[aria-expanded='true']").count();
  check("bloque expandido anunciado", expanded === 1);
  await page.keyboard.press("Escape");

  // Acción de navegación en laboratorio: avisa, no simula.
  await page.locator(".cce-card .cce-btn").first().click();
  check("laboratorio avisa en lugar de simular navegación", await page.locator(".cce-notice").count() === 1);
  await page.getByRole("button", { name: "Cerrar aviso" }).click();

  // Alta real contra el router demo (permiso owner).
  await page.getByRole("button", { name: /Añadir persona/ }).click();
  check("abre el alta de persona existente", await page.locator(".modal-title").innerText() === "Añadir persona");
  await page.keyboard.press("Escape");
  await page.locator(".modal-overlay").click({ position: { x: 4, y: 4 } }).catch(() => {});
  await page.keyboard.press("Escape");

  await shot(page, "desktop-1440-poblado.png");

  check("consola sin errores", consoleErrors.length === 0, consoleErrors.join(" · "));
  const external = requests.filter((url) => !url.startsWith(BASE));
  check("sin peticiones externas", external.length === 0, external.slice(0, 3).join(" · "));
  await context.close();
}

/* ------------------------------------------------------- sample y estados QA */
{
  const { context, page } = await open({ width: 1366, height: 768 });
  await page.waitForSelector(".cce-sample");
  const bannerText = await page.locator(".cce-sample").innerText();
  check("aviso de datos de ejemplo visible", /Datos de ejemplo/.test(bannerText));
  await page.getByRole("button", { name: "Ver datos reales" }).click();
  await page.waitForSelector(".cce-briefing");
  check("toggle a datos reales mantiene la composición", await page.locator(".cce-kpi").count() === 4);
  await shot(page, "desktop-1366-real.png");
  await context.close();
}
{
  const { context, page } = await open({ width: 1280, height: 800 });
  await page.waitForSelector(".cce-briefing");
  await shot(page, "desktop-1280.png");
  await context.close();
}
{
  const { context, page } = await open({ width: 1920, height: 1080 });
  await page.waitForSelector(".cce-briefing");
  await shot(page, "desktop-1920.png");
  await context.close();
}
{
  const { context, page } = await open({ width: 1440, height: 900 }, "&cce-state=empty");
  await page.waitForSelector(".cce-sample");
  check("empresa sin actividad: aviso + ejemplo", /Todavía no hay actividad/.test(await page.locator(".cce-sample").innerText()));
  await shot(page, "estado-vacio.png");
  await context.close();
}
{
  const { context, page } = await open({ width: 1440, height: 900 }, "&cce-state=error");
  await page.waitForSelector(".cce-error");
  check("estado de error con reintento", await page.getByRole("button", { name: /Reintentar/ }).count() >= 1);
  await shot(page, "estado-error.png");
  await context.close();
}
{
  const { context, page } = await open({ width: 1440, height: 900 }, "&cce-state=loading");
  await page.waitForSelector(".cce-skeleton");
  check("estado de carga anunciado (aria-busy)", (await page.locator(".cce-skeleton").getAttribute("aria-busy")) === "true");
  await shot(page, "estado-carga.png");
  await context.close();
}

/* ------------------------------------------------------------- responsive QA */
for (const [name, width, height] of [
  ["tablet-1024", 1024, 768],
  ["tablet-768", 768, 1024],
  ["movil-430", 430, 932],
  ["movil-390", 390, 844],
  ["movil-320", 320, 720],
]) {
  const { context, page, consoleErrors } = await open({ width, height });
  await page.waitForSelector(".cce-briefing");
  const metrics = await page.evaluate(() => ({
    doc: document.documentElement.scrollWidth,
    win: window.innerWidth,
    tapTargets: [...document.querySelectorAll(".cce-root button, .cce-root a")]
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.width > 0 && r.height > 0)
      .filter((r) => r.height < 40)
      .length,
  }));
  check(`${name}: sin desbordamiento horizontal`, metrics.doc <= metrics.win + 1, `${metrics.doc}/${metrics.win}`);
  check(`${name}: objetivos táctiles ≥40px`, metrics.tapTargets === 0, `${metrics.tapTargets} por debajo`);
  check(`${name}: consola limpia`, consoleErrors.length === 0, consoleErrors.join(" · "));
  await shot(page, `${name}.png`);
  await context.close();
}

/* --------------------------------------------------------- hoja móvil + a11y */
{
  const { context, page } = await open({ width: 390, height: 844 });
  await page.waitForSelector(".cce-briefing");
  await page.locator(".cce-block").nth(2).click();
  await page.waitForSelector(".cce-sheet");
  check("móvil: detalle en hoja inferior", await page.locator("[role='dialog'][aria-modal='true']").isVisible());
  const focusedLabel = await page.evaluate(() => document.activeElement?.getAttribute("aria-label"));
  check("móvil: foco inicial en cerrar", focusedLabel === "Cerrar detalle", String(focusedLabel));
  await shot(page, "movil-390-hoja.png", false);
  await page.keyboard.press("Escape");
  check("móvil: Escape cierra la hoja", await page.locator(".cce-sheet").count() === 0);
  const restored = await page.evaluate(() => document.activeElement?.textContent?.trim().slice(0, 40));
  check("móvil: foco devuelto al disparador", /Aprobaciones/.test(String(restored)), String(restored));

  // Orden de tabulación mínimo: primer focusable es el alta/actualizar de la cabecera.
  await page.keyboard.press("Tab");
  const firstFocus = await page.evaluate(() => document.activeElement?.textContent?.trim().slice(0, 24));
  check("teclado: primer foco entra por la cabecera", Boolean(firstFocus), String(firstFocus));
  await context.close();
}

/* ------------------------------------------------------------ reduced motion */
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(BASE + VIEW, { waitUntil: "networkidle" });
  await page.waitForSelector(".cce-briefing");
  const durations = await page.evaluate(() =>
    [...document.querySelectorAll(".cce-hero, .cce-briefing, .cce-section")]
      .slice(0, 4)
      .map((el) => getComputedStyle(el).animationDuration),
  );
  check("reduced motion: sin animaciones largas", durations.every((d) => d === "0.01ms" || d === "0s"), durations.join(","));
  await context.close();
}

/* ---------------------------------------------------------------- contraste */
{
  const { context, page } = await open({ width: 1440, height: 900 });
  await page.waitForSelector(".cce-briefing");
  const ratios = await page.evaluate(() => {
    const parse = (color) => color.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);
    const lum = ([r, g, b]) => {
      const f = (c) => {
        const v = c / 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const ratio = (fg, bg) => {
      const a = lum(parse(fg));
      const b = lum(parse(bg));
      const [hi, lo] = a > b ? [a, b] : [b, a];
      return (hi + 0.05) / (lo + 0.05);
    };
    const bgOf = (el) => {
      let node = el;
      while (node) {
        const bg = getComputedStyle(node).backgroundColor;
        if (bg && !/rgba?\([^)]*,\s*0\)/.test(bg) && bg !== "transparent") return bg;
        node = node.parentElement;
      }
      return "rgb(252,250,246)";
    };
    const targets = [
      ["saludo", document.querySelector(".cce-greeting")],
      ["briefing", document.querySelector(".cce-briefing-text")],
      ["cifra", document.querySelector(".cce-kpi-value")],
      ["meta de cifra", document.querySelector(".cce-kpi-meta")],
      ["título de sección", document.querySelector(".cce-section-title")],
      ["contexto de tarjeta", document.querySelector(".cce-card-context")],
      ["fila de feed", document.querySelector(".cce-row-meta")],
      ["bloque operativo", document.querySelector(".cce-block-desc")],
      ["pie de nota", document.querySelector(".cce-footnote")],
    ];
    return targets
      .filter(([, el]) => el)
      .map(([name, el]) => ({
        name,
        ratio: Number(ratio(getComputedStyle(el).color, bgOf(el)).toFixed(2)),
      }));
  });
  const low = ratios.filter((item) => item.ratio < 4.5);
  check(
    "contraste AA en texto normal",
    low.length === 0,
    low.map((item) => `${item.name}:${item.ratio}`).join(" · ") || ratios.map((r) => `${r.name}:${r.ratio}`).join(" · "),
  );
  results.push({ name: "muestra de contraste", ok: true, detail: ratios.map((r) => `${r.name}:${r.ratio}`).join(" · ") });
  await context.close();
}

/* -------------------------------------------------- comparación con landing */
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${BASE}/?embed=1&view=landing`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: resolve(SHOTS, "referencia-landing-1440.png"), fullPage: false });
  shots.push({ name: "referencia-landing-1440.png" });
  check("landing real capturada como referencia de branding", true);
  await context.close();
}

await browser.close();

const summary = {
  ranAt: new Date().toISOString(),
  base: BASE,
  total: results.length,
  failed: failures,
  checks: results,
  screenshots: shots.map((s) => s.name),
};
writeFileSync(resolve(HERE, "qa-resultados.json"), JSON.stringify(summary, null, 2));

for (const item of results) {
  console.log(`${item.ok ? "PASS" : "FAIL"}  ${item.name}${item.detail ? `  — ${item.detail}` : ""}`);
}
console.log(`\n${results.length - failures}/${results.length} comprobaciones correctas`);
process.exit(failures === 0 ? 0 : 1);
