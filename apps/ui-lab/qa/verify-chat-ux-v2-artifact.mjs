#!/usr/bin/env node
import { spawn } from "node:child_process";
import { access, writeFile } from "node:fs/promises";
import { join } from "node:path";
// Verifica que el ZIP del artifact renderiza el chat y que la fuente viaja
// dentro del paquete (sin red). Uso: node qa/verify-chat-ux-v2-artifact.mjs <carpeta-raiz-artifact>
import { chromium } from "playwright";

const root = process.argv[2];
if (!root) {
  console.error("Falta la carpeta del artifact");
  process.exit(2);
}
const site = join(root, "site");
const port = 4187;
const base = `http://127.0.0.1:${port}`;
const lines = [];
const check = (name, ok, detail = "") => {
  lines.push(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  console.log(lines.at(-1));
  if (!ok) process.exitCode = 1;
};

await access(join(site, "index.html"));
const server = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], {
  cwd: site,
  stdio: "ignore",
});
const waitForServer = async () => {
  for (let i = 0; i < 40; i += 1) {
    try {
      const response = await fetch(`${base}/index.html`);
      if (response.ok) return true;
    } catch {
      /* arrancando */
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  return false;
};

const browser = await chromium.launch();
try {
  check("El ZIP contiene index.html servible", await waitForServer());
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  await context.route(/https?:\/\/fonts\.(googleapis|gstatic)\.com\/.*/, (route) => route.abort());
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !/ERR_FAILED/.test(message.text())) errors.push(message.text());
  });
  await page.goto(`${base}/?embed=1&view=chat-ux-v2`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  const data = await page.evaluate(() => ({
    title: document.querySelector(".cux-title")?.textContent,
    width: document.querySelector(".cux-title")?.getBoundingClientRect().width ?? 0,
    font: document.fonts.check("16px Manrope"),
    greeting: document.querySelector(".cux-greeting")?.textContent,
    chips: document.querySelectorAll(".cux-chips .chip").length,
    overflow: document.documentElement.scrollWidth - innerWidth,
  }));
  check(
    "Render de portada desde el ZIP",
    data.title === "¿En qué te ayudo hoy?" && data.chips === 3,
    `${data.title} · ${data.chips} chips`,
  );
  check("Manrope local sin red", data.font === true && data.width > 200, `${data.width.toFixed(0)} px`);
  check(
    "Saludo presente y sin overflow",
    /Buenas|Buenos/.test(data.greeting ?? "") && data.overflow <= 1,
    data.greeting,
  );
  check("Consola limpia", errors.length === 0, errors.slice(0, 2).join(" || "));
  await page.goto(`${base}/?embed=1&view=chat-ux-v2&state=conversation`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const conversation = await page.evaluate(() => ({
    bubbles: document.querySelectorAll("[data-message-id]").length,
    markdown: Boolean(document.querySelector(".cux-markdown strong")),
    dock: document.querySelector(".cux-dock").getBoundingClientRect().bottom,
    height: innerHeight,
  }));
  check(
    "Conversación y markdown renderizados",
    conversation.bubbles >= 2 && conversation.markdown,
    `${conversation.bubbles} mensajes`,
  );
  check(
    "Compositor dentro del viewport",
    conversation.dock <= conversation.height + 1,
    `${conversation.dock.toFixed(0)}/${conversation.height}`,
  );
  await page.screenshot({ path: join(root, "QA", "verificacion-zip.png") });
  lines.push(
    "",
    `Base: ${base}`,
    `Fecha: ${new Date().toISOString()}`,
    "Servidor local python3; red externa bloqueada para fuentes.",
  );
  await writeFile(join(root, "VERIFICACION-ZIP.txt"), `${lines.join("\n")}\n`);
  await context.close();
} finally {
  await browser.close();
  server.kill("SIGTERM");
}
