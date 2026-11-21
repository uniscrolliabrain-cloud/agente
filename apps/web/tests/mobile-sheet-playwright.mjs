import assert from "node:assert/strict";

const { chromium, devices } = await import(process.env.SHEET_PLAYWRIGHT_MODULE ?? "playwright");
const browser = await chromium.connectOverCDP(process.env.SHEET_CDP_URL ?? "http://127.0.0.1:9222");
const context = await browser.newContext({ ...devices["Pixel 7"], reducedMotion: "reduce" });

try {
  await context.addInitScript(() => {
    window.captureStarts = 0;
    window.mediaRequests = 0;
    window.SpeechRecognition = class {
      start() {
        window.captureStarts++;
        this.onresult({ results: [[{ transcript: "texto dictado" }]] });
      }
      stop() {
        this.onend?.();
      }
    };
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia = () => {
        window.mediaRequests++;
        return Promise.reject(new Error("Browser regression does not use real media"));
      };
    }
  });
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(process.env.SHEET_TEST_URL ?? "http://127.0.0.1:5173/");
  await page.getByRole("button", { name: /Entrar al tenant demo/ }).click();
  await page.getByRole("button", { name: "Abrir menú" }).tap();
  await page.getByRole("button", { name: "Workspaces" }).tap();
  await page.locator(".workspace-shell-card").first().tap();

  const fab = page.locator(".chat-fab");
  await fab.tap();
  const sheet = page.locator(".mobile-chat-sheet");
  const grip = sheet.getByRole("slider");
  const send = sheet.getByRole("button", { name: "Enviar", exact: true });
  const input = sheet.locator("textarea");
  assert.equal(await fab.count(), 0);
  assert.equal(await grip.evaluate((el) => el === document.activeElement), true);
  assert.equal(await sheet.evaluate((el) => getComputedStyle(el).transitionProperty), "none");

  const voice = sheet.getByRole("button", { name: "Conversación por voz" });
  const video = sheet.getByRole("button", { name: "Videollamada" });
  await sheet.getByRole("button", { name: "Abrir acciones" }).tap();
  const actions = page.getByRole("dialog", { name: "Acciones del chat" });
  await actions.getByRole("button", { name: "Proyecto" }).tap();
  await page.getByLabel("Nombre del proyecto").fill("Portal");
  await page.getByRole("button", { name: "Añadir al borrador" }).tap();
  assert.equal(await input.inputValue(), "Trabajemos en el proyecto Portal");
  await sheet.getByRole("button", { name: "Abrir acciones" }).tap();
  const chooserEvent = page.waitForEvent("filechooser");
  await actions.getByRole("button", { name: "Subir vídeo" }).tap();
  await (await chooserEvent).setFiles({ name: "muestra.mp4", mimeType: "video/mp4", buffer: Buffer.from("video de prueba") });
  await sheet.getByText("muestra.mp4 · seleccionado en este dispositivo").waitFor();
  await sheet.getByRole("button", { name: "Quitar vídeo" }).tap();

  await voice.tap();
  await sheet.getByRole("heading", { name: "Conversación por voz" }).waitFor();
  await sheet.getByText("Definir el objetivo de la conversación.").waitFor({ timeout: 7000 });
  await grip.press("Home");
  const compact = sheet.locator(".mobile-call-compact");
  await compact.getByText("Llamada de voz").waitFor();
  assert.notEqual(await compact.locator("span").textContent(), "En curso · 00:00");
  assert.equal(await sheet.getByRole("heading", { name: "Conversación por voz" }).isVisible(), false);
  await compact.getByRole("button", { name: "Ampliar llamada" }).tap();
  await sheet.getByText("Definir el objetivo de la conversación.").waitFor();
  await sheet.getByRole("button", { name: "Finalizar" }).tap();
  await sheet.getByRole("heading", { name: "Informe de la conversación" }).waitFor();
  await sheet.getByRole("button", { name: "Volver al chat" }).tap();
  await sheet.getByRole("button", { name: "Ver informe de la conversación por voz" }).tap();
  await sheet.getByText("Definir el objetivo de la conversación.").waitFor();
  await sheet.getByRole("button", { name: "Volver al chat" }).tap();

  await video.tap();
  await sheet.getByRole("heading", { name: "Hablar con Juan · Finanzas" }).waitFor();
  const portrait = sheet.getByRole("img", { name: "Retrato de Juan, agente demo de Finanzas" });
  await portrait.waitFor();
  await page.waitForFunction(() => document.querySelector(".mobile-call-portrait")?.naturalWidth > 0);
  const videoSwitch = sheet.getByRole("switch", { name: "Mostrar vista de vídeo" });
  assert.equal(await videoSwitch.isChecked(), true);
  await videoSwitch.tap();
  assert.equal(await portrait.count(), 0);
  await videoSwitch.tap();
  await portrait.waitFor();
  await sheet.getByRole("button", { name: "Encender cámara local" }).waitFor();
  const gripBox = await grip.boundingBox();
  const sheetBox = await sheet.boundingBox();
  const x = Math.round(gripBox.x + gripBox.width / 2);
  const y = Math.round(gripBox.y + gripBox.height / 2);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y + sheetBox.height - 140, { steps: 6 });
  await page.mouse.up();
  await compact.getByText("Videollamada con Juan").waitFor();
  assert.equal(await portrait.isVisible(), false);
  await compact.getByRole("button", { name: "Finalizar llamada" }).tap();
  await sheet.getByRole("heading", { name: "Informe de la conversación" }).waitFor();
  await sheet.getByRole("button", { name: "Volver al chat" }).tap();
  await grip.press("Home");
  assert.deepEqual(await page.evaluate(() => [window.captureStarts, window.mediaRequests]), [0, 0]);

  await input.fill("inicio final");
  await input.evaluate((el) => el.setSelectionRange(7, 7));
  await sheet.getByRole("button", { name: "Dictar texto" }).tap();
  assert.equal(await input.inputValue(), "inicio texto dictado final");
  assert.equal(await sheet.getByRole("button", { name: "Detener", exact: true }).count(), 0);
  await sheet.getByRole("button", { name: "Detener dictado" }).tap();
  assert.deepEqual(await page.evaluate(() => [window.captureStarts, window.mediaRequests]), [1, 0]);

  await page.evaluate(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      window.mediaRequests++;
      const audio = new AudioContext();
      const destination = audio.createMediaStreamDestination();
      const oscillator = audio.createOscillator();
      oscillator.connect(destination);
      oscillator.start();
      const [track] = destination.stream.getTracks();
      const stop = track.stop.bind(track);
      track.stop = () => {
        oscillator.stop();
        void audio.close();
        stop();
      };
      return destination.stream;
    };
  });
  const mic = sheet.getByRole("button", { name: "Dictar texto" });
  await mic.click({ delay: 1000 });
  const note = sheet.getByRole("article", { name: "Nota de voz local" });
  await note.waitFor();
  assert.match(await note.getByRole("link", { name: "Descargar" }).getAttribute("href"), /^blob:/);
  assert.equal(await note.locator("audio[controls]").count(), 1);
  assert.equal(await sheet.getByRole("button", { name: "Detener dictado" }).count(), 0);
  await grip.press("Home");

  const longMessage = "Historial sintético para verificar desplazamiento. ".repeat(180);
  await input.fill(longMessage);
  await send.tap();
  await sheet.getByRole("button", { name: "Detener", exact: true }).tap();
  await send.waitFor();
  for (let turn = 1; turn <= 15; turn++) {
    await input.fill(`Hola, mensaje sintético ${turn}`);
    await send.tap();
    await sheet.getByRole("button", { name: "Detener", exact: true }).waitFor();
    await send.waitFor();
  }
  await grip.press("ArrowUp");
  await page.waitForFunction(() => {
    const sheet = document.querySelector(".mobile-chat-sheet");
    return sheet && Math.abs(sheet.getBoundingClientRect().height - parseFloat(sheet.style.height)) < 1;
  });
  const height = (await sheet.boundingBox()).height;
  const history = sheet.locator(".side-chat-body");
  assert.ok(await history.locator(":scope > .v2-assistant-body").evaluate((el) => el.childElementCount >= 30));
  const scrolled = await history.evaluate((el) => {
    el.scrollTop = 60;
    return el.scrollTop;
  });
  assert.equal(scrolled, 60);
  assert.equal((await sheet.boundingBox()).height, height);

  const workspace = page.getByRole("combobox", { name: "Cambiar workspace" });
  await workspace.selectOption({ index: 1 });
  assert.ok((await history.textContent()).includes("Historial sintético"));
  await sheet.getByRole("button", { name: "Ajustes", exact: true }).tap();
  await page.getByRole("dialog", { name: "Ajustes y cuenta" }).waitFor();
  await page.keyboard.press("Escape");
  assert.equal((await sheet.boundingBox()).height, height);

  for (const viewport of [
    { width: 320, height: 568 },
    { width: 740, height: 393 },
  ]) {
    await page.setViewportSize(viewport);
    await grip.press("Home");
    const box = await send.boundingBox();
    assert.ok(box.x >= 0 && box.x + box.width <= viewport.width);
    assert.ok(box.y >= 0 && box.y + box.height <= viewport.height);
    assert.equal(
      await send.evaluate((el) => {
        const box = el.getBoundingClientRect();
        return el.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2));
      }),
      true,
    );
  }
  await sheet.getByRole("button", { name: "Cerrar chat" }).tap();
  await fab
    .evaluate((el) => new Promise((resolve) => requestAnimationFrame(() => resolve(el === document.activeElement))))
    .then((focused) => assert.equal(focused, true));
  await fab.tap();
  await sheet.getByRole("button", { name: "Abrir chat completo" }).tap();
  await page.locator(".v2-conv .v2-composer").waitFor();
  assert.equal(await sheet.count(), 0);
  await fab.tap();
  const oldThread = await page.evaluate(() => localStorage.getItem("agente_active_thread"));
  const oldThreadMessage = "Mensaje sintético que pertenece solo al hilo anterior";
  await input.fill(oldThreadMessage);
  await send.tap();
  await sheet.getByRole("button", { name: "Detener", exact: true }).waitFor();
  await page.getByRole("button", { name: "Nuevo chat" }).tap();
  await page.waitForFunction((previous) => localStorage.getItem("agente_active_thread") !== previous, oldThread);
  await send.waitFor();
  assert.ok(!(await sheet.locator(".side-chat-body").textContent()).includes(oldThreadMessage));

  const networkPage = await context.newPage();
  const user = { id: "browser-test", name: "Prueba", role: "user" };
  const thread = { id: "network-test", title: "Prueba de red", messageCount: 0, messages: [] };
  await networkPage.addInitScript(
    ({ user, thread }) => {
      localStorage.setItem("agente_auth", JSON.stringify({ token: "synthetic-browser-test", mode: "sample" }));
      localStorage.setItem("agente_user", JSON.stringify(user));
      localStorage.setItem("agente_active_thread", thread.id);
    },
    { user, thread },
  );
  let runCount = 0;
  await networkPage.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    switch (path) {
      case "/api/auth/me":
        return route.fulfill({ json: user });
      case "/api/threads":
        return route.fulfill({ json: [thread] });
      case "/api/threads/network-test":
        return route.fulfill({ json: thread });
      case "/api/copilotkit/run":
        runCount++;
        if (runCount === 1) return route.abort("failed");
        return route.fulfill({
          contentType: "text/event-stream",
          body: 'data: {"type":"TEXT_MESSAGE_CONTENT","delta":"Respuesta tras reintentar"}\n\ndata: {"type":"RUN_FINISHED"}\n\n',
        });
      default:
        return route.fulfill({ status: 503, json: { error: "Ruta fuera de la prueba de red" } });
    }
  });
  await networkPage.goto(process.env.SHEET_TEST_URL ?? "http://127.0.0.1:5173/");
  await networkPage.locator(".chat-fab").tap();
  const networkSheet = networkPage.locator(".mobile-chat-sheet");
  await networkSheet.getByRole("slider").press("End");
  const networkInput = networkSheet.locator("textarea");
  const networkSend = networkSheet.getByRole("button", { name: "Enviar", exact: true });
  await networkInput.fill("Petición sintética que falla");
  await networkSend.tap();
  await networkSheet.locator(".chat-error").waitFor();
  await networkInput.fill("Reintento sintético");
  await networkSend.tap();
  await networkSheet.getByText("Respuesta tras reintentar", { exact: true }).waitFor();
  assert.equal(runCount, 2);
  assert.equal(await networkSheet.locator(".chat-error").count(), 0);
  console.log(
    "PASS: Playwright mobile, workspace continuity, history scroll, cancel, dictation, actions, local recording, simulated calls, network recovery, short viewports and reduced motion",
  );
} finally {
  await context.close();
  await browser.close();
}
