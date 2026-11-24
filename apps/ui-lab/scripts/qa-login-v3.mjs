#!/usr/bin/env node
/**
 * QA de navegador versionado de Login V3 (UI Lab).
 *
 * Reproduce las comprobaciones de apps/ui-lab/docs/dashboards/02-login/QA.md
 * contra el bundle construido, sin backend ni servicios conectados.
 *
 * Uso:
 *   pnpm --filter @agente/ui-lab build
 *   (cd apps/ui-lab/dist && python3 -m http.server 4173 --bind 127.0.0.1 &)
 *   npm i --prefix /tmp/pw --no-save playwright@1.65.1
 *   /tmp/pw/node_modules/.bin/playwright install chromium
 *   NODE_PATH=/tmp/pw/node_modules node apps/ui-lab/scripts/qa-login-v3.mjs
 *
 * Reproducibilidad: la versión de Playwright está fijada (PLAYWRIGHT_VERSION,
 * por defecto 1.65.1; el workflow la inyecta). Si la instalada no coincide, el
 * script aborta con código 3 en lugar de medir con otro motor.
 *
 * Variables: BASE_URL (por defecto http://127.0.0.1:4173),
 *            VIEW (por defecto /?embed=1&view=login-v3),
 *            SHOT_DIR (opcional; guarda capturas de los estados comprobados),
 *            REPORT (opcional; escribe el informe JSON con SHA, versiones y checks),
 *            EXPECTED_BUILD_SHA (opcional; exige que el bundle servido sea de ese commit).
 *
 * Google Fonts se bloquea a propósito: si la tipografía se sirve en local, el
 * diseño sobrevive sin red. Cualquier llamada externa se registra y se informa.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:4173";
const VIEW = process.env.VIEW ?? "/?embed=1&view=login-v3";
const SHOT_DIR = process.env.SHOT_DIR ?? "";
const REPORT = process.env.REPORT ?? "";
const EXPECTED_BUILD_SHA = process.env.EXPECTED_BUILD_SHA ?? "";
const EXPECTED_PLAYWRIGHT = process.env.PLAYWRIGHT_VERSION ?? "1.65.1";

const requireFromHere = createRequire(import.meta.url);
let chromium;
let playwrightVersion = "desconocida";
try {
  // require (no import) para que NODE_PATH permita instalarlo fuera del repo.
  ({ chromium } = requireFromHere("playwright"));
} catch {
  console.error("Falta Playwright. Instálalo aparte (ver cabecera) sin tocar package.json.");
  process.exit(2);
}
try {
  playwrightVersion = requireFromHere("playwright/package.json").version;
} catch {
  try {
    const main = requireFromHere.resolve("playwright");
    playwrightVersion = JSON.parse(readFileSync(join(dirname(main), "..", "package.json"), "utf8")).version;
  } catch {
    playwrightVersion = "desconocida";
  }
}
if (playwrightVersion !== EXPECTED_PLAYWRIGHT) {
  console.error(
    `Playwright ${playwrightVersion} no coincide con la versión fijada ${EXPECTED_PLAYWRIGHT}. ` +
      "Instala la versión fijada para que la medición sea reproducible.",
  );
  process.exit(3);
}
console.log(`Playwright ${playwrightVersion} (fijado)`);

const results = [];
function check(name, pass, detail = "") {
  results.push({ name, pass: Boolean(pass), detail: String(detail) });
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1366, height: 1002 }, deviceScaleFactor: 1 });

const externalRequests = [];
for (const host of ["fonts.googleapis.com", "fonts.gstatic.com"]) {
  await context.route(`**://${host}/**`, (route) => {
    externalRequests.push(route.request().url());
    route.abort();
  });
}

const page = await context.newPage();
const consoleErrors = [];
page.on("console", (message) => {
  if (message.type() !== "error") return;
  const origin = message.location()?.url ?? "";
  if (/fonts\.(googleapis|gstatic)\.com/.test(origin)) return;
  consoleErrors.push(`${message.text()} ${origin}`.trim());
});
const fontResponses = [];
const failedResponses = [];
page.on("response", (response) => {
  if (response.url().endsWith(".woff2")) fontResponses.push({ url: response.url(), status: response.status() });
  if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
});
page.on("crash", () => console.error("La página se ha caído (crash del renderer)."));

async function shot(name) {
  if (!SHOT_DIR) return;
  await mkdir(SHOT_DIR, { recursive: true });
  await page.evaluate(() => document.querySelector(".lab-preview-badge")?.setAttribute("style", "display:none"));
  await page.screenshot({ path: join(SHOT_DIR, name), fullPage: false });
}

// ---------------------------------------------------------------- carga base
// Un fallo de arranque debe explicarse solo: si la vista no monta, se informa de
// la URL, el título, el HTML de #root y los errores recogidos antes de abortar.
async function loadView(target) {
  await target.goto(new URL(VIEW, BASE_URL).href, { waitUntil: "load" });
  try {
    await target.waitForSelector("#login-v3-title", { timeout: 20000 });
  } catch (error) {
    const diagnostics = await target
      .evaluate(() => ({
        url: location.href,
        title: document.title,
        rootLength: document.getElementById("root")?.innerHTML.length ?? -1,
        bodyText: (document.body?.innerText ?? "").slice(0, 200),
      }))
      .catch((cause) => ({ evaluateFailed: cause.message }));
    console.error("La vista login-v3 no montó:", JSON.stringify(diagnostics, null, 2));
    if (consoleErrors.length > 0) console.error("Errores de consola:", consoleErrors.join(" | "));
    if (failedResponses.length > 0) console.error("Respuestas HTTP fallidas:", failedResponses.join(" | "));
    throw error;
  }
  await target.evaluate(() => document.fonts.ready.then(() => true));
}

await loadView(page);

// Une la evidencia con el código: el bundle servido declara su SHA en version.json.
let servedBuildSha = "no disponible";
let servedBuiltAt = "no disponible";
try {
  const manifest = await page.evaluate(async (url) => (await fetch(url)).json(), new URL("/version.json", BASE_URL).href);
  servedBuildSha = String(manifest?.version ?? "no disponible");
  servedBuiltAt = String(manifest?.builtAt ?? "no disponible");
} catch (error) {
  servedBuildSha = `no se pudo leer version.json: ${error.message}`;
}
if (EXPECTED_BUILD_SHA) {
  check(
    "el bundle servido es del commit esperado",
    servedBuildSha === EXPECTED_BUILD_SHA,
    `${servedBuildSha} esperado ${EXPECTED_BUILD_SHA}`,
  );
} else {
  console.log(`version.json del bundle: ${servedBuildSha} (${servedBuiltAt})`);
}

check("título de la vista", (await page.title()).includes("Login V3"), await page.title());
const storageBaseline = await page.evaluate(() => Object.keys(localStorage).sort().join(","));

const fonts = await page.evaluate(() => {
  const loaded = [...document.fonts].map((face) => ({ family: face.family, weight: face.weight, status: face.status }));
  return loaded;
});
const fraunces = fonts.filter((face) => /Fraunces/i.test(face.family));
const manrope = fonts.filter((face) => /Manrope/i.test(face.family));
check(
  "Fraunces disponible sin red (local)",
  fraunces.length > 0 && fraunces.every((face) => face.status === "loaded"),
  JSON.stringify(fraunces),
);
check(
  "Manrope disponible sin red (local)",
  manrope.length > 0 && manrope.every((face) => face.status === "loaded"),
  JSON.stringify(manrope),
);
const localFonts = fontResponses.filter((entry) => entry.url.startsWith(BASE_URL));
check(
  "woff2 servidos desde el propio bundle",
  localFonts.length >= 2 && localFonts.every((entry) => entry.status === 200),
  JSON.stringify(fontResponses),
);

// ------------------------------------------------------------- medidas 1366
const metrics = await page.evaluate(() => {
  const h1 = document.querySelector("#login-v3-title");
  const card = document.querySelector(".lv3-card");
  const chip = document.querySelector(".lv3-chips button");
  const cta = document.querySelector(".lv3-cta-violet");
  const style = (element) => getComputedStyle(element);
  const h1Style = style(h1);
  const lineHeight = parseFloat(h1Style.lineHeight);
  return {
    h1FontSize: parseFloat(h1Style.fontSize),
    h1FontFamily: h1Style.fontFamily,
    h1Lines: Math.round(h1.getBoundingClientRect().height / lineHeight),
    h1Tracking: h1Style.letterSpacing,
    cardWidth: Math.round(card.getBoundingClientRect().width),
    cardX: Math.round(card.getBoundingClientRect().x),
    chipFontSize: parseFloat(style(chip).fontSize),
    chipPadding: `${style(chip).paddingTop} ${style(chip).paddingRight}`,
    chipRadius: style(chip).borderRadius,
    ctaBackground: style(cta).backgroundColor,
    ctaColor: style(cta).color,
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    brandNames: document.querySelectorAll(".cc-brand").length,
  };
});
check("H1 60 px a 1366", metrics.h1FontSize === 60, `${metrics.h1FontSize}px`);
check("H1 en dos líneas", metrics.h1Lines === 2, `${metrics.h1Lines} líneas`);
check("H1 con Fraunces local", /Fraunces/i.test(metrics.h1FontFamily), metrics.h1FontFamily);
check("card de 500 px en x=756", metrics.cardWidth === 500 && metrics.cardX === 756, `${metrics.cardWidth}×${metrics.cardX}`);
check("chips 11 px / 6-10 de padding", metrics.chipFontSize === 11 && metrics.chipPadding === "6px 10px", `${metrics.chipFontSize}px ${metrics.chipPadding}`);
check("chip pill", metrics.chipRadius === "100px", metrics.chipRadius);
check("CTA violeta no anulado por la cascada", metrics.ctaBackground === "rgb(101, 80, 221)" && metrics.ctaColor === "rgb(255, 255, 255)", `${metrics.ctaBackground} / ${metrics.ctaColor}`);
check("marca una sola vez", metrics.brandNames === 1, `${metrics.brandNames}`);
check("sin overflow horizontal a 1366", metrics.overflow <= 0, `${metrics.overflow}px`);
await shot("login-v3-1366.png");

// ------------------------------------------------------------ responsive
const widths = [320, 360, 390, 430, 768, 1024, 1280, 1440, 1920];
const overflow = [];
for (const width of widths) {
  await page.setViewportSize({ width, height: 1002 });
  const value = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  overflow.push(`${width}:${value}`);
  if (width === 390) await shot("login-v3-390.png");
  if (width === 768) await shot("login-v3-768.png");
  if (width === 1920) await shot("login-v3-1920.png");
}
check("sin overflow horizontal en 320-1920", overflow.every((entry) => Number(entry.split(":")[1]) <= 0), overflow.join(" "));
await page.setViewportSize({ width: 1366, height: 1002 });

// ---------------------------------------------------- foco de validación
async function focusedId() {
  return page.evaluate(() => document.activeElement?.id ?? document.activeElement?.className ?? "");
}

// Muestreo dentro de la página: mide la altura real del colapso sin la latencia
// de cada viaje al navegador, de modo que la animación quede comprobada y no solo
// supuesta por el estado final.
async function collapseProfile(clickSelector, spaceSelector) {
  return page.evaluate(
    ([click, space]) =>
      new Promise((resolve) => {
        const target = document.querySelector(space);
        const button = document.querySelector(click);
        if (!target || !button) return resolve({ samples: [], child: null, error: "nodos ausentes" });
        const samples = [];
        const read = () => Math.round(target.getBoundingClientRect().height);
        button.click();
        samples.push({ t: 0, h: read() });
        for (const t of [60, 120, 180, 260, 380]) {
          setTimeout(() => samples.push({ t, h: read() }), t);
        }
        setTimeout(() => resolve({ samples, child: Boolean(target.firstElementChild) }), 420);
      }),
    [clickSelector, spaceSelector],
  );
}

await page.click('[aria-controls="login-v3-password-form"]');
await page.waitForSelector("#login-v3-password-form");
await page.fill("#login-v3-email", "no-es-un-email");
await page.fill("#login-v3-password", "secreto");
await page.click('#login-v3-password-form button[type="submit"]');
check("email inválido enfoca el email", (await focusedId()) === "login-v3-email", await focusedId());
check(
  "mensaje de email inválido",
  (await page.textContent("#login-v3-password-form .lv3-error"))?.includes("email válido"),
  await page.textContent("#login-v3-password-form .lv3-error"),
);

await page.fill("#login-v3-email", "ana@empresa.com");
await page.fill("#login-v3-password", "");
await page.click('#login-v3-password-form button[type="submit"]');
check("contraseña vacía enfoca la contraseña", (await focusedId()) === "login-v3-password", await focusedId());

await page.fill("#login-v3-password", "secreto-de-prueba");
await page.click(".lv3-reveal");
check("mostrar contraseña cambia el tipo", (await page.getAttribute("#login-v3-password", "type")) === "text");
await page.click("#login-v3-password-form button[type='submit']");
check(
  "sin backend no se simula el acceso",
  (await page.textContent("#login-v3-password-form"))?.includes("autenticación no está conectada"),
);
const storageAfterPassword = await page.evaluate(() => ({
  keys: Object.keys(localStorage).sort().join(","),
  dump: JSON.stringify(localStorage),
}));
check(
  "no se persiste la contraseña",
  storageAfterPassword.keys === storageBaseline && !storageAfterPassword.dump.includes("secreto-de-prueba"),
  storageAfterPassword.keys,
);
await shot("login-v3-password-1366.png");

// colapso: animación real y limpieza de datos sensibles
const passwordProfile = await collapseProfile(
  '[aria-controls="login-v3-password-form"]',
  ".lv3-password .lv3-collapse",
);
const passwordHeights = passwordProfile.samples.map((sample) => sample.h);
check(
  "contraseña se cierra animando la altura",
  passwordHeights[0] > 80 && passwordHeights.at(-1) === 0 && new Set(passwordHeights).size >= 3,
  JSON.stringify(passwordProfile.samples),
);
check("contraseña desmontada al terminar", passwordProfile.child === false, JSON.stringify(passwordProfile));
await page.click('[aria-controls="login-v3-password-form"]');
await page.waitForSelector("#login-v3-password-form");
check(
  "contraseña limpia al reabrir",
  (await page.inputValue("#login-v3-password")) === "" && (await page.getAttribute("#login-v3-password", "type")) === "password",
);

// --------------------------------------------------------------- chat
await page.click('[aria-controls="login-v3-password-form"]');
await page.waitForTimeout(320);
await page.click(".lv3-chips button");
await page.waitForSelector(".lv3-chat");
check("chip precarga el mensaje", (await page.inputValue(".lv3-composer input")) === "Quiero más clientes");
check("chip abre el chat con aria-expanded", (await page.getAttribute('[aria-controls="login-v3-chat"]', "aria-expanded")) === "true");
await page.fill(".lv3-composer input", "Necesito ordenar mi agenda");
await page.keyboard.press("Enter");
await page.waitForTimeout(120);
check("enviar no añade mensajes ficticios", (await page.locator(".lv3-chat-log .lv3-msg").count()) === 1);
check("aviso de servicio no conectado en el chat", (await page.textContent(".lv3-chat"))?.includes("no está conectado"));
await shot("login-v3-chat-chip-1366.png");

const chatProfile = await collapseProfile('[aria-controls="login-v3-chat"]', "#login-v3-chat");
const chatHeights = chatProfile.samples.map((sample) => sample.h);
check(
  "chat se cierra animando la altura",
  chatHeights[0] > 80 && chatHeights.at(-1) === 0 && new Set(chatHeights).size >= 3,
  JSON.stringify(chatProfile.samples),
);
check("chat desmontado al terminar", chatProfile.child === false, JSON.stringify(chatProfile));
await page.click('[aria-controls="login-v3-chat"]');
await page.waitForSelector(".lv3-chat");
check("el borrador sobrevive al cierre", (await page.inputValue(".lv3-composer input")) === "Necesito ordenar mi agenda");
await page.click('[aria-controls="login-v3-chat"]');
await page.waitForTimeout(320);

// ---------------------------------------------------------- invitación
await page.click(".lv3-invite .lv3-cta");
await page.waitForSelector(".lv3-dialog[open]");
await page.waitForTimeout(60);
const dialogIn = await page.evaluate(() => getComputedStyle(document.querySelector(".lv3-dialog")).animationName);
check("modal con coreografía de entrada", dialogIn === "lv3-dialog-in", dialogIn);
await shot("login-v3-invitacion-1366.png");

await page.click(".lv3-dialog form button[type='submit']");
check("invitación vacía enfoca el nombre", (await focusedId()) === "lv3-invite-name", await focusedId());

await page.fill("#lv3-invite-name", "Ana");
await page.fill("#lv3-invite-email", "ana@");
await page.fill("#lv3-invite-company", "Empresa");
await page.click(".lv3-dialog form button[type='submit']");
check("invitación con email inválido enfoca el email", (await focusedId()) === "lv3-invite-email", await focusedId());

await page.fill("#lv3-invite-email", "ana@empresa.com");
await page.fill("#lv3-invite-company", "");
await page.click(".lv3-dialog form button[type='submit']");
check("invitación sin empresa enfoca la empresa", (await focusedId()) === "lv3-invite-company", await focusedId());

await page.fill("#lv3-invite-company", "Empresa");
await page.click(".lv3-dialog form button[type='submit']");
const storageAfterInvite = await page.evaluate(() => ({
  keys: Object.keys(localStorage).sort().join(","),
  dump: JSON.stringify(localStorage),
}));
check(
  "invitación no guarda datos ni simula envío",
  (await page.textContent(".lv3-dialog"))?.includes("no está conectado") &&
    storageAfterInvite.keys === storageBaseline &&
    !storageAfterInvite.dump.includes("ana@empresa.com"),
  storageAfterInvite.keys,
);

// Salida del modal medida dentro de la página (cancel es el evento nativo de Escape).
const dialogExit = await page.evaluate(
  () =>
    new Promise((resolve) => {
      const dialog = document.querySelector(".lv3-dialog");
      const samples = [];
      const read = () => getComputedStyle(dialog).animationName;
      dialog.dispatchEvent(new Event("cancel", { cancelable: true, bubbles: true }));
      samples.push({ t: 0, anim: read() });
      for (const t of [60, 150, 300]) {
        setTimeout(() => samples.push({ t, anim: read(), open: dialog.open }), t);
      }
      setTimeout(() => resolve({ samples, closed: !dialog.open }), 360);
    }),
);
check(
  "el modal tiene salida breve",
  dialogExit.samples.some((sample) => sample.t <= 200 && sample.anim === "lv3-dialog-out" && sample.open),
  JSON.stringify(dialogExit.samples),
);
check("el modal se cierra tras la salida", dialogExit.closed === true, JSON.stringify(dialogExit));

await page.click(".lv3-invite .lv3-cta");
await page.waitForSelector(".lv3-dialog[open]");
await page.keyboard.press("Escape");
await page.waitForTimeout(320);
check("Escape cierra el modal", (await page.locator(".lv3-dialog[open]").count()) === 0);
check("el foco vuelve a la invitación", (await focusedId()).includes("lv3-cta"), await focusedId());

// ------------------------------------------------- reduced motion
const reduced = await browser.newContext({ viewport: { width: 1366, height: 1002 }, reducedMotion: "reduce" });
const reducedPage = await reduced.newPage();
await loadView(reducedPage);
const reducedState = await reducedPage.evaluate(() => {
  const hero = document.querySelector(".lv3-hero .lv3-anim");
  return {
    animation: getComputedStyle(hero).animationName,
    transition: getComputedStyle(document.querySelector(".lv3-chat-space")).transitionDuration,
    visible: hero.getBoundingClientRect().height > 0,
  };
});
check("reduced motion sin animaciones", reducedState.animation === "none" && reducedState.visible, JSON.stringify(reducedState));
await reducedPage.click('[aria-controls="login-v3-chat"]');
await reducedPage.waitForSelector(".lv3-chat");
check("reduced motion abre el chat al instante", (await reducedPage.locator(".lv3-chat").count()) === 1);
await reduced.close();

// ------------------------------------------------------------- consola
check("consola sin errores propios", consoleErrors.length === 0, consoleErrors.join(" | "));

const browserVersion = browser.version();
await browser.close();

const failed = results.filter((entry) => !entry.pass);
for (const entry of results) {
  console.log(`${entry.pass ? "PASS" : "FAIL"}  ${entry.name}${entry.detail ? `  → ${entry.detail}` : ""}`);
}
console.log(`\n${results.length - failed.length}/${results.length} comprobaciones correctas`);
if (externalRequests.length > 0) {
  console.log(`Google Fonts bloqueado a propósito: ${externalRequests.length} peticiones abortadas.`);
}
if (REPORT) {
  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    view: VIEW,
    buildSha: servedBuildSha,
    builtAt: servedBuiltAt,
    expectedBuildSha: EXPECTED_BUILD_SHA || null,
    playwright: playwrightVersion,
    chromium: browserVersion,
    runId: process.env.GITHUB_RUN_ID ?? null,
    commit: process.env.GITHUB_SHA ?? null,
    total: results.length,
    passed: results.length - failed.length,
    failed: failed.length,
    checks: results,
  };
  await mkdir(dirname(REPORT), { recursive: true });
  writeFileSync(REPORT, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Informe: ${REPORT} (build ${servedBuildSha}, chromium ${browserVersion})`);
}
process.exit(failed.length === 0 ? 0 : 1);
