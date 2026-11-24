#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
// QA reproducible de Chat UX V2. Playwright fijado en apps/ui-lab (1.62.1).
// Uso:
//   pnpm --filter @agente/ui-lab exec node qa/chat-ux-v2.qa.mjs
// Variables: QA_BASE_URL (defecto http://127.0.0.1:4173), QA_OUT.
// Requiere un build servido: pnpm --filter @agente/ui-lab build &&
//   pnpm --filter @agente/ui-lab preview --port 4173
import { chromium } from "playwright";

const BASE = process.env.QA_BASE_URL ?? "http://127.0.0.1:4173";
const OUT = process.env.QA_OUT ?? join(dirname(fileURLToPath(import.meta.url)), "out", "chat-ux-v2");
const SHOTS = join(OUT, "capturas");
const results = [];
const consoleErrors = [];

function check(name, ok, detail = "") {
  results.push({ name, ok: Boolean(ok), detail: String(detail) });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

function watch(page, label) {
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(`${label}: ${message.text()}`);
  });
  page.on("pageerror", (error) => consoleErrors.push(`${label}: ${error.message}`));
  page.on("requestfailed", (request) => {
    const url = request.url();
    if (!/fonts\.(googleapis|gstatic)\.com/.test(url)) {
      consoleErrors.push(`${label}: requestfailed ${url} ${request.failure()?.errorText ?? ""}`);
    }
  });
}

async function shot(page, name) {
  await page.screenshot({ path: join(SHOTS, `${name}.png`) });
}

const url = (query = "") => `${BASE}/?embed=1&view=chat-ux-v2${query}`;

async function open(browser, viewport, query = "", options = {}) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, ...options.context });
  if (options.offlineFonts) {
    await context.route(/https?:\/\/fonts\.(googleapis|gstatic)\.com\/.*/, (route) => route.abort());
  }
  const page = await context.newPage();
  if (!options.quiet) watch(page, `${viewport.width}x${viewport.height}${query}`);
  await page.goto(url(query), { waitUntil: "networkidle" });
  return { context, page };
}

function contrastRatio(rgbA, rgbB) {
  const lum = (rgb) => {
    const [r, g, b] = rgb.map((v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const a = lum(rgbA);
  const b = lum(rgbB);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function parseRgb(value) {
  const nums =
    String(value)
      .match(/[\d.]+/g)
      ?.map(Number) ?? [];
  return nums.slice(0, 3);
}

async function main() {
  await mkdir(SHOTS, { recursive: true });
  const browser = await chromium.launch();

  // 1. Portada de referencia del chat original y de la propuesta.
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    watch(page, "baseline-original");
    await page.goto(`${BASE}/?embed=1&view=chat`, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    await shot(page, "baseline-original-chat-1440x900");
    await context.close();
  }

  {
    const { context, page } = await open(browser, { width: 1440, height: 900 });
    await page.waitForTimeout(700);
    await shot(page, "01-portada-1440x900");
    const data = await page.evaluate(() => {
      const composer = document.querySelector(".cux-composer").getBoundingClientRect();
      const title = document.querySelector(".cux-title");
      const greeting = document.querySelector(".cux-greeting");
      const send = document.querySelector(".cux-send");
      return {
        composerWidth: composer.width,
        composerHeight: composer.height,
        titleSize: parseFloat(getComputedStyle(title).fontSize),
        titleText: title.textContent,
        greetingText: greeting.textContent,
        greetingBg: getComputedStyle(greeting).backgroundColor,
        chips: [...document.querySelectorAll(".cux-chips .chip")].map((c) => c.textContent),
        sendDisabled: send.disabled,
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: innerWidth,
        fontReady: document.fonts.check("16px Manrope"),
      };
    });
    check(
      "Portada: compositor de 680 px",
      Math.abs(data.composerWidth - 680) <= 2,
      `${data.composerWidth.toFixed(1)} px`,
    );
    check(
      "Portada: titular 44-48 px y copy existente",
      data.titleSize >= 44 && data.titleSize <= 48 && data.titleText === "¿En qué te ayudo hoy?",
      `${data.titleSize}px · ${data.titleText}`,
    );
    check(
      "Portada: saludo lila conservado",
      /Buenas|Buenos/.test(data.greetingText) && data.greetingBg === "rgb(240, 236, 252)",
      data.greetingText,
    );
    check(
      "Portada: tres sugerencias existentes",
      data.chips.length === 3 && data.chips.includes("Resumen de mi negocio"),
      data.chips.join(" | "),
    );
    check("Portada: enviar deshabilitado sin texto", data.sendDisabled === true);
    check(
      "Portada: sin overflow horizontal",
      data.scrollWidth <= data.innerWidth + 1,
      `${data.scrollWidth}/${data.innerWidth}`,
    );
    check("Fuente Manrope disponible", data.fontReady === true);

    // Sugerencia: rellena el compositor, no envia.
    await page.locator(".cux-chips .chip").first().click();
    await page.waitForTimeout(200);
    const seeded = await page.locator(".cux-composer textarea").inputValue();
    check("Sugerencia rellena el compositor sin enviar", seeded === "Dame un resumen de mi negocio.", seeded);
    await page.locator(".cux-composer textarea").fill("");
    await context.close();
  }

  // 2. Refresco de fuentes sin red: el woff2 local debe bastar.
  {
    const { context, page } = await open(browser, { width: 1200, height: 800 }, "", {
      offlineFonts: true,
      quiet: true,
    });
    await page.waitForTimeout(600);
    const offline = await page.evaluate(() => {
      const title = document.querySelector(".cux-title").getBoundingClientRect();
      return { fontReady: document.fonts.check("16px Manrope"), width: title.width };
    });
    check(
      "Fuentes offline: Manrope local sin red",
      offline.fontReady && offline.width > 200,
      `${offline.width.toFixed(1)} px`,
    );
    await shot(page, "02-fuentes-offline-1200x800");
    await context.close();
  }

  // 3. Transicion portada -> conversacion en una sola instancia.
  {
    const { context, page } = await open(browser, { width: 1440, height: 900 });
    await page.waitForTimeout(600);
    await page.locator(".cux-composer textarea").fill("¿Tenemos lista la campaña de Caliza?");
    const before = await page.evaluate(() => {
      const dock = document.querySelector(".cux-dock").getBoundingClientRect();
      const textarea = document.querySelector(".cux-composer textarea");
      textarea.dataset.qaComposer = "same-node";
      return { top: dock.top, title: document.querySelector(".cux-title")?.getBoundingClientRect().top };
    });
    await page.locator(".cux-composer textarea").press("Enter");
    const flipStart = await page.evaluate(() => {
      const dock = document.querySelector(".cux-dock");
      return {
        top: dock.getBoundingClientRect().top,
        running: dock.getAnimations().some((a) => a.playState === "running"),
      };
    });
    await page.waitForTimeout(150);
    const flipMid = await page.evaluate(() => document.querySelector(".cux-dock").getBoundingClientRect().top);
    await page.waitForTimeout(650);
    const flipEnd = await page.evaluate(() => document.querySelector(".cux-dock").getBoundingClientRect().top);
    check(
      "Motion: continuidad espacial FLIP del compositor",
      flipStart.running && flipEnd - flipMid > 40,
      `${flipStart.top.toFixed(0)} → ${flipMid.toFixed(0)} → ${flipEnd.toFixed(0)} px`,
    );
    await page.waitForTimeout(90);
    await shot(page, "03a-transicion-90ms");
    await page.waitForTimeout(700);
    await shot(page, "03b-transicion-790ms");
    const after = await page.evaluate(() => {
      const dock = document.querySelector(".cux-dock").getBoundingClientRect();
      return {
        top: dock.top,
        same: document.querySelector(".cux-composer textarea")?.dataset.qaComposer,
        userText: document.querySelector(".cux-user-inner")?.textContent,
        streaming: Boolean(document.querySelector(".cux-stream-row")),
        role: Boolean(document.querySelector(".cux-role")),
        focused: document.activeElement?.tagName,
        height: document.documentElement.scrollHeight,
        innerHeight,
      };
    });
    check(
      "Transicion: el compositor se desplaza a la zona inferior",
      after.top > before.top + 120,
      `${before.top.toFixed(0)} → ${after.top.toFixed(0)}`,
    );
    check("Transicion: mismo nodo de compositor (sin remount)", after.same === "same-node");
    check(
      "Transicion: mensaje de usuario visible",
      after.userText === "¿Tenemos lista la campaña de Caliza?",
      after.userText,
    );
    check("Transicion: streaming activo sin retrasar el envio", after.streaming === true);
    check(
      "Transicion: el foco solo se libera porque el compositor se deshabilita al responder (paridad)",
      after.focused === "BODY" && after.streaming === true,
      after.focused,
    );
    check(
      "Conversacion: no crece el documento",
      after.height <= after.innerHeight + 1,
      `${after.height}/${after.innerHeight}`,
    );

    // Streaming real: texto creciente, cursor, cancelacion.
    await page.waitForTimeout(900);
    const stream = await page.evaluate(() => ({
      text: document.querySelector(".cux-stream-text")?.textContent ?? "",
      cursor: Boolean(document.querySelector(".cux-cursor")),
      stop: Boolean(document.querySelector(".cux-send[aria-label='Detener respuesta']")),
      textareaDisabled: document.querySelector(".cux-composer textarea")?.disabled,
    }));
    check(
      "Streaming: texto creciente con cursor",
      stream.text.length > 20 && stream.cursor,
      `${stream.text.length} chars`,
    );
    check("Streaming: control de detener visible", stream.stop === true);
    check("Streaming: compositor bloqueado mientras responde", stream.textareaDisabled === true);
    await shot(page, "04-streaming-1440x900");
    await page.locator(".cux-send[aria-label='Detener respuesta']").click();
    await page.waitForTimeout(500);
    const cancelled = await page.evaluate(() => ({
      streaming: Boolean(document.querySelector(".cux-stream-row")),
      stop: Boolean(document.querySelector(".cux-send[aria-label='Detener respuesta']")),
      send: Boolean(document.querySelector(".cux-send[aria-label='Enviar mensaje']")),
      textareaDisabled: document.querySelector(".cux-composer textarea")?.disabled,
      messages: document.querySelectorAll("[data-message-id]").length,
      errorSurface: Boolean(document.querySelector(".cux-error")),
    }));
    check(
      "Cancelacion: el streaming se detiene y el compositor vuelve",
      !cancelled.streaming && !cancelled.stop && cancelled.send && !cancelled.textareaDisabled,
    );
    check(
      "Cancelacion: no queda respuesta parcial (solo el mensaje enviado)",
      cancelled.messages === 1,
      `${cancelled.messages} mensajes`,
    );
    await page.locator(".cux-composer textarea").focus();
    check(
      "Cancelacion: el compositor recupera el foco al terminar",
      await page.locator(".cux-composer textarea").evaluate((el) => document.activeElement === el),
    );
    check("Error/cancelacion: ChatPanel real no pinta error (paridad documentada)", cancelled.errorSurface === false);
    await shot(page, "05-cancelado-1440x900");
    await context.close();
  }

  // 4. Conversacion larga: markdown, tabla, codigo, listas, timeline y scroll manual.
  {
    const { context, page } = await open(browser, { width: 1440, height: 900 }, "&state=long");
    await page.waitForTimeout(700);
    const md = await page.evaluate(() => {
      const table = document.querySelector(".cux-markdown table");
      const pre = document.querySelector(".cux-code pre");
      const strong = document.querySelector(".cux-markdown strong");
      const strongs = [...document.querySelectorAll(".cux-markdown strong")].map((el) => el.textContent);
      const quote = document.querySelector(".cux-markdown blockquote");
      const ol = document.querySelector(".cux-markdown ol");
      const tableWrap = document.querySelector(".cux-table-wrap");
      return {
        table: Boolean(table) && table.querySelectorAll("th").length === 3,
        code: Boolean(pre) && pre.textContent.includes("type Resumen"),
        strong: strong?.textContent,
        strongs,
        quote: quote?.textContent.slice(0, 24),
        listStyle: ol ? getComputedStyle(ol).listStyleType : null,
        tableOverflow: tableWrap ? tableWrap.scrollWidth <= tableWrap.clientWidth + 1 : false,
      };
    });
    check(
      "Markdown: tabla con cabeceras y sin desbordar la pagina",
      md.table && md.tableOverflow,
      md.tableOverflow ? "contenida" : "desborda",
    );
    check("Markdown: bloque de codigo", md.code === true);
    check("Markdown: negrita", md.strongs.includes("datos de ejemplo"), md.strongs.slice(0, 4).join(", "));
    check("Markdown: cita", (md.quote ?? "").startsWith("Ningún envío"), md.quote);
    check("Markdown: lista ordenada visible", md.listStyle === "decimal", md.listStyle);

    // Scroll manual: subir al inicio y comprobar que el historial no se mueve.
    const scrolled = await page.evaluate(async () => {
      const el = document.querySelector(".cux-scroll-body");
      el.scrollTop = 0;
      await new Promise((r) => setTimeout(r, 700));
      return { top: el.scrollTop, max: el.scrollHeight - el.clientHeight };
    });
    check(
      "Scroll: el historial no se fuerza al fondo mientras se lee",
      scrolled.top === 0 && scrolled.max > 40,
      `top=${scrolled.top} max=${scrolled.max}`,
    );
    await shot(page, "06-historial-inicio-1440x900");
    await page.evaluate(() => {
      const el = document.querySelector(".cux-scroll-body");
      el.scrollTop = el.scrollHeight;
    });
    await page.waitForTimeout(300);
    await shot(page, "07-historial-final-1440x900");

    // Mientras se lee el historial, un mensaje nuevo no arrastra el scroll.
    await page.evaluate(() => {
      const el = document.querySelector(".cux-scroll-body");
      el.scrollTop = 120;
    });
    await page.waitForTimeout(200);
    await page.locator(".cux-composer textarea").fill("Comprueba que no me mueves la lectura.");
    await page.locator(".cux-composer textarea").press("Enter");
    await page.waitForTimeout(900);
    const kept = await page.evaluate(() => document.querySelector(".cux-scroll-body").scrollTop);
    check(
      "Scroll: un mensaje nuevo no arrastra al fondo si leo historial",
      Math.abs(kept - 120) <= 8,
      `scrollTop=${kept}`,
    );
    await page.locator(".cux-send[aria-label='Detener respuesta']").click();
    await page.waitForTimeout(200);
    await shot(page, "07b-lectura-conservada-1440x900");

    const details = await page.evaluate(() => {
      const tools = document.querySelector(".steps");
      const timeline = document.querySelector(".cux-timeline");
      return {
        tools: tools?.querySelector("summary")?.textContent?.replace(/\s+/g, " ").trim(),
        toolsOpen: tools?.open,
        timeline: timeline?.querySelector("summary")?.textContent,
        timelineOpen: timeline?.open,
      };
    });
    check("Herramientas: resumen de pasos existente", /2 pasos/.test(details.tools ?? ""), details.tools);
    check(
      "Timeline: detalle existente y cerrado",
      details.timeline === "Tus análisis recientes" && details.timelineOpen === false,
      details.timeline,
    );
    await page.locator(".cux-timeline > summary").click();
    check("Timeline: se puede abrir", (await page.locator(".cux-timeline").getAttribute("open")) !== null);
    await shot(page, "08-timeline-abierta-1440x900");

    // Foco visible por teclado.
    await page.locator(".cux-composer textarea").focus();
    await page.keyboard.press("Tab");
    const focus = await page.evaluate(() => {
      const el = document.activeElement;
      const style = getComputedStyle(el);
      return {
        label: el?.getAttribute("aria-label") ?? el?.textContent?.slice(0, 12),
        outline: `${style.outlineStyle} ${style.outlineWidth} ${style.outlineColor}`,
      };
    });
    check(
      "Teclado: foco visible con anillo violeta",
      /solid 2px/.test(focus.outline) && focus.outline.includes("101, 80, 221"),
      `${focus.label} · ${focus.outline}`,
    );
    await shot(page, "09-foco-teclado-1440x900");
    await context.close();
  }

  // 5. Chips por rol y selector de rol.
  {
    const { context, page } = await open(browser, { width: 1280, height: 800 }, "&role=finanzas");
    await page.waitForTimeout(500);
    const chips = await page.locator(".cux-chips .chip").allTextContents();
    check(
      "Chips por rol: finanzas conserva su copy",
      chips.includes("Resumen de gastos") && chips.length === 3,
      chips.join(" | "),
    );
    await shot(page, "10-chips-finanzas-1280x800");
    await context.close();

    const conversation = await open(browser, { width: 1280, height: 800 }, "&state=conversation");
    await conversation.page.locator("#cux-role-select").selectOption("legal");
    check(
      "Selector de rol: cambia el rol activo",
      (await conversation.page.locator("#cux-role-select").inputValue()) === "legal",
    );
    await conversation.context.close();
  }

  // 6. Adjuntos: exito y error simulados localmente.
  {
    const { context, page } = await open(browser, { width: 1280, height: 800 });
    await page.setInputFiles("input[type=file]", {
      name: "resumen-caliza.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 demo"),
    });
    await page.waitForSelector(".cux-attach[data-kind=ready]");
    check("Adjunto: estado listo sin red", (await page.locator(".cux-attach[data-kind=ready]").count()) === 1);
    await shot(page, "11-adjunto-listo-1280x800");
    await page.locator(".cux-composer textarea").fill("");
    await page.locator(".cux-send[aria-label='Enviar mensaje']").click();
    await page.waitForTimeout(200);
    const attachedMessage = await page.locator(".cux-user-inner").first().textContent();
    check("Adjunto: se envia con el mensaje", attachedMessage === "Adjunto: resumen-caliza.pdf", attachedMessage);
    await context.close();

    const error = await open(browser, { width: 1280, height: 800 });
    await error.page.setInputFiles("input[type=file]", {
      name: "error-demo.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 demo"),
    });
    await error.page.waitForSelector(".cux-attach[data-kind=error]");
    const errorText = await error.page.locator(".cux-attach").textContent();
    check("Adjunto: error visible y recuperable", /No se pudo subir/.test(errorText ?? ""), errorText);
    check(
      "Adjunto: sin texto no se puede enviar tras el error",
      await error.page.locator(".cux-send[aria-label='Enviar mensaje']").isDisabled(),
    );
    await shot(error.page, "12-adjunto-error-1280x800");
    await error.context.close();
  }

  // 7. Dictado disponible / no disponible (stubs locales, sin microfono real).
  {
    const unavailableContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    await unavailableContext.addInitScript(() => {
      // @ts-expect-error
      delete window.SpeechRecognition;
      // @ts-expect-error
      delete window.webkitSpeechRecognition;
    });
    const unavailable = await unavailableContext.newPage();
    watch(unavailable, "dictado-no-disponible");
    await unavailable.goto(url(), { waitUntil: "networkidle" });
    await unavailable.locator(".cux-tool[aria-label='Transcribir voz']").click();
    const value = await unavailable.locator(".cux-composer textarea").inputValue();
    check("Dictado no disponible: no rompe ni inventa texto", value === "");
    await shot(unavailable, "12b-dictado-no-disponible-1280x800");
    await unavailableContext.close();

    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    await context.addInitScript(() => {
      class FakeRecognition {
        lang = "";
        continuous = false;
        interimResults = false;
        onresult = null;
        onend = null;
        onerror = null;
        start() {
          setTimeout(() => {
            this.onresult?.({
              resultIndex: 0,
              results: [{ 0: { transcript: "Prepara el resumen semanal" }, isFinal: true }],
            });
          }, 60);
        }
        stop() {
          this.onend?.();
        }
      }
      // @ts-expect-error
      window.SpeechRecognition = FakeRecognition;
      // @ts-expect-error
      window.webkitSpeechRecognition = FakeRecognition;
    });
    const page = await context.newPage();
    watch(page, "dictado-disponible");
    await page.goto(url(), { waitUntil: "networkidle" });
    await page.locator(".cux-tool[aria-label='Transcribir voz']").click();
    await page.waitForTimeout(200);
    const dictated = await page.locator(".cux-composer textarea").inputValue();
    check("Dictado disponible: transcript local en el compositor", dictated === "Prepara el resumen semanal", dictated);
    check(
      "Dictado disponible: estado pulsado anunciado",
      (await page.locator(".cux-tool[aria-label='Transcribir voz']").getAttribute("aria-pressed")) === "true",
    );
    await shot(page, "13-dictado-1280x800");
    await context.close();
  }

  // 8. IME: Enter durante composicion no envia.
  {
    const { context, page } = await open(browser, { width: 1280, height: 800 }, "&state=conversation");
    const before = await page.locator("[data-message-id]").count();
    const composer = page.locator(".cux-composer textarea");
    await composer.fill("こんにちは");
    await composer.evaluate((el) => {
      el.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
      el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, isComposing: true }));
      el.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
    });
    await page.waitForTimeout(200);
    const afterIme = await page.locator("[data-message-id]").count();
    check("IME: Enter durante composicion no envia", before === afterIme, `${before} → ${afterIme}`);
    check("IME: el borrador se conserva", (await composer.inputValue()) === "こんにちは");
    await composer.press("Enter");
    await page.waitForTimeout(150);
    check("IME: Enter tras composicion si envia", (await page.locator("[data-message-id]").count()) === before + 1);
    await context.close();
  }

  // 9. Reduced motion.
  {
    const { context, page } = await open(browser, { width: 1280, height: 800 }, "", {
      context: { reducedMotion: "reduce" },
    });
    await page.waitForTimeout(300);
    const reduced = await page.evaluate(() => {
      const title = document.querySelector(".cux-title");
      const composer = document.querySelector(".cux-composer");
      return {
        duration: getComputedStyle(title).animationDuration,
        transition: getComputedStyle(composer).transitionDuration,
        opacity: getComputedStyle(title).opacity,
        visible: title.getBoundingClientRect().height > 20,
      };
    });
    check("Reduced motion: sin animaciones decorativas", parseFloat(reduced.duration) <= 0.01, reduced.duration);
    check("Reduced motion: contenido visible", reduced.opacity === "1" && reduced.visible === true);
    await shot(page, "14-reduced-motion-1280x800");
    await context.close();
  }

  // 10. Viewports del gate.
  {
    const viewports = [
      [320, 640],
      [390, 844],
      [430, 932],
      [768, 1024],
      [1024, 768],
      [1366, 599],
      [1440, 900],
      [1920, 1080],
    ];
    for (const [width, height] of viewports) {
      const { context, page } = await open(browser, { width, height });
      await page.waitForTimeout(500);
      const home = await page.evaluate(() => {
        const composer = document.querySelector(".cux-composer").getBoundingClientRect();
        const dock = document.querySelector(".cux-dock").getBoundingClientRect();
        const title = parseFloat(getComputedStyle(document.querySelector(".cux-title")).fontSize);
        return {
          overflow: document.documentElement.scrollWidth - innerWidth,
          composerWidth: composer.width,
          dockBottom: dock.bottom,
          innerHeight,
          title,
        };
      });
      check(
        `Viewport ${width}x${height}: sin overflow, compositor visible`,
        home.overflow <= 1 && home.dockBottom <= home.innerHeight + 1 && home.composerWidth > 0,
        `overflow=${home.overflow} dock=${home.dockBottom.toFixed(0)}/${home.innerHeight} title=${home.title}px`,
      );
      await shot(page, `15-home-${width}x${height}`);
      await page.goto(url("&state=conversation"), { waitUntil: "networkidle" });
      await page.waitForTimeout(400);
      const conversation = await page.evaluate(() => {
        const dock = document.querySelector(".cux-dock").getBoundingClientRect();
        const bubbles = [...document.querySelectorAll(".cux-user-inner")].map((el) => el.getBoundingClientRect().right);
        return {
          overflow: document.documentElement.scrollWidth - innerWidth,
          dockBottom: dock.bottom,
          innerHeight,
          bubbleRight: Math.max(...bubbles),
        };
      });
      check(
        `Viewport ${width}x${height}: conversacion sin recorte`,
        conversation.overflow <= 1 &&
          conversation.dockBottom <= conversation.innerHeight + 1 &&
          conversation.bubbleRight <= width + 1,
        `overflow=${conversation.overflow} dock=${conversation.dockBottom.toFixed(0)}/${conversation.innerHeight}`,
      );
      await shot(page, `16-conversacion-${width}x${height}`);
      await context.close();
    }
  }
  for (const width of [480, 680, 900]) {
    const { context, page } = await open(browser, { width: 1440, height: 900 }, `&state=long&container=${width}`);
    await page.waitForTimeout(500);
    const data = await page.evaluate(() => {
      const chat = document.querySelector(".chat-ux-v2").getBoundingClientRect();
      const dock = document.querySelector(".cux-dock").getBoundingClientRect();
      const title = parseFloat(getComputedStyle(document.querySelector(".cux-title") ?? document.body).fontSize);
      const chips = [...document.querySelectorAll(".cux-chips .chip")].map((el) => el.getBoundingClientRect().right);
      return {
        chatWidth: chat.width,
        dockBottom: dock.bottom,
        innerHeight,
        overflow: document.documentElement.scrollWidth - innerWidth,
        chipsRight: chips.length ? Math.max(...chips) : 0,
        title,
      };
    });
    check(
      `Contenedor ${width}: responde al ancho real, no al viewport`,
      Math.abs(data.chatWidth - width) <= 3 && data.overflow <= 1 && data.dockBottom <= data.innerHeight + 1,
      `chat=${data.chatWidth}px dock=${data.dockBottom.toFixed(0)}/${data.innerHeight}`,
    );
    await shot(page, `17-contenedor-${width}-1440x900`);
    await page.goto(url(`&container=${width}`), { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    await shot(page, `18-contenedor-${width}-portada`);
    await context.close();
  }

  // 12. Borrador y foco al cambiar de ancho (simula abrir el panel).
  {
    const { context, page } = await open(browser, { width: 1440, height: 900 }, "&state=conversation");
    const composer = page.locator(".cux-composer textarea");
    await composer.fill("Borrador que no se debe perder");
    await composer.focus();
    await page.setViewportSize({ width: 1024, height: 900 });
    await page.waitForTimeout(300);
    check(
      "Panel transversal: conserva borrador al reducir el ancho",
      (await composer.inputValue()) === "Borrador que no se debe perder",
    );
    check("Panel transversal: conserva el foco", await composer.evaluate((el) => document.activeElement === el));
    await shot(page, "19-panel-simulado-1024x900");
    await context.close();
  }

  // 13. Contraste WCAG AA en combinaciones reales.
  {
    const { context, page } = await open(browser, { width: 1280, height: 800 }, "&state=conversation");
    const pairs = await page.evaluate(() => {
      const bg = (el) => {
        let node = el;
        while (node) {
          const c = getComputedStyle(node).backgroundColor;
          if (c && c !== "rgba(0, 0, 0, 0)") return c;
          node = node.parentElement;
        }
        return "rgb(252, 250, 246)";
      };
      const pick = (selector) => {
        const el = document.querySelector(selector);
        return el ? { color: getComputedStyle(el).color, bg: bg(el) } : null;
      };
      return {
        title: pick(".cux-title"),
        body: pick(".cux-assistant-text"),
        user: pick(".cux-user-inner"),
        chip: pick(".cux-role-label"),
        timeline: pick(".cux-timeline > summary"),
      };
    });
    for (const [name, pair] of Object.entries(pairs)) {
      if (!pair) continue;
      const ratio = contrastRatio(parseRgb(pair.color), parseRgb(pair.bg));
      check(`Contraste AA: ${name}`, ratio >= 4.5, `${ratio.toFixed(2)}:1`);
    }
    await context.close();
  }

  // 14. Copiar mensaje (portapapeles real del navegador de pruebas).
  {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      permissions: ["clipboard-read", "clipboard-write"],
    });
    const page = await context.newPage();
    watch(page, "copiar");
    await page.goto(url("&state=conversation"), { waitUntil: "networkidle" });
    const actions = page.locator(".cux-assistant").first().locator(".cux-actions");
    await page.locator(".cux-assistant").first().hover();
    await actions.locator("button[aria-label='Copiar mensaje']").click();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    check("Copiar: el mensaje llega al portapapeles", copied.includes("Marcos ha terminado"), copied.slice(0, 40));
    check("Copiar: confirmacion accesible", (await actions.locator("button[aria-label='Copiado']").count()) === 1);
    await context.close();
  }

  check("Consola limpia y sin peticiones fallidas", consoleErrors.length === 0, consoleErrors.slice(0, 4).join(" || "));

  const failed = results.filter((r) => !r.ok);
  const summary = {
    campaign: "chat-ux-v2",
    revision: process.env.UI_LAB_BUILD_SHA ?? "local",
    generatedAt: new Date().toISOString(),
    baseUrl: BASE,
    total: results.length,
    passed: results.length - failed.length,
    failed: failed.length,
    results,
    consoleErrors,
  };
  await writeFile(join(OUT, "resultados.json"), JSON.stringify(summary, null, 2));
  const md = [
    "# QA Chat UX V2 — resultados",
    "",
    `- Revisión: ${summary.revision}`,
    `- Fecha: ${summary.generatedAt}`,
    `- Base: ${BASE}`,
    `- Resultado: **${summary.passed}/${summary.total}** checks PASS`,
    "",
    "| Check | Resultado | Detalle |",
    "| --- | --- | --- |",
    ...results.map(
      (r) =>
        `| ${r.name.replaceAll("|", "\\|")} | ${r.ok ? "PASS" : "FAIL"} | ${r.detail.replaceAll("|", "\\|").slice(0, 160)} |`,
    ),
    "",
    "## Consola",
    "",
    consoleErrors.length
      ? consoleErrors.map((e) => `- ${e}`).join("\n")
      : "Sin errores de consola ni peticiones fallidas.",
    "",
  ].join("\n");
  await writeFile(join(OUT, "RESULTADOS.md"), md);

  // Copia de la captura de referencia para trazabilidad.
  await writeFile(join(OUT, "LEEME.txt"), `Capturas y resultados generados por qa/chat-ux-v2.qa.mjs contra ${BASE}.\n`);

  console.log(`\n${summary.passed}/${summary.total} PASS · ${summary.failed} FAIL`);
  await browser.close();
  if (failed.length) process.exitCode = 1;
}

main().catch(async (error) => {
  console.error(error);
  await writeFile(join(OUT, "ERROR.txt"), String(error?.stack ?? error));
  process.exitCode = 1;
});
