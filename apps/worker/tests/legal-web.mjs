import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium, devices } from "playwright";
import { testConfig } from "../../../tests/helpers/config.ts";
import { createApp } from "../../server/src/app.ts";
import { createStore } from "../../server/src/db.ts";
import { TenantService } from "../../server/src/engine/tenant.ts";
import { UserService } from "../../server/src/users.ts";

const appOrigin = process.env.FREEBUFF_WEB_URL ?? "http://127.0.0.1:5173";
const siteOrigin = process.env.FREEBUFF_SITE_URL ?? "http://127.0.0.1:4174";
const browser = await chromium.launch({
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
});

const directory = await mkdtemp(join(tmpdir(), "freebuff-browser-"));
const db = await createStore();
const config = testConfig({ dataDir: directory, publicUrl: appOrigin, taskWorkerEnabled: false });
const server = await createApp(db, config);
const credentials = { email: "privacy@fixture.invalid", password: "synthetic-password", name: "Privacy Fixture" };
const user = await new UserService(db).create({ ...credentials, role: "user" });
const tenants = new TenantService(db, config);
await tenants.setMembership(user.id, "privacy-fixture");
await tenants.addMembership(user.id, "privacy-fixture", "owner");

try {
  for (const profile of [devices["Desktop Chrome"], devices["Pixel 7"]]) {
    const context = await browser.newContext(profile);
    const page = await context.newPage();
    const external = new Set();
    await context.route("**/*", async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const { origin, pathname } = url;
      if (origin === appOrigin && pathname.startsWith("/api/")) {
        // Keep the browser fixture deterministic. The test does not exercise subscriptions.
        if (pathname.endsWith("/stream") || request.resourceType() === "eventsource") {
          await route.fulfill({ status: 204 });
          return;
        }
        const response = await server.app.request(url.href, {
          method: request.method(),
          headers: request.headers(),
          body: request.postDataBuffer() ?? undefined,
        });
        await route.fulfill({
          status: response.status,
          headers: Object.fromEntries(response.headers),
          body: await response.text(),
        });
        return;
      }
      if (origin === appOrigin || origin === siteOrigin) await route.continue();
      else {
        external.add(origin);
        await route.abort();
      }
    });

    await page.goto(siteOrigin);
    const footer = page.getByRole("navigation", { name: "Enlaces legales" });
    assert.ok(await footer.isVisible());
    for (const anchor of await footer.getByRole("link").all()) {
      const href = await anchor.getAttribute("href");
      if (!href || href.startsWith("mailto:")) continue;
      const response = await context.request.get(new URL(href, siteOrigin).href);
      assert.equal(response.status(), 200, href);
      const html = await response.text();
      assert.match(html, /name="legal-status" content="published"/);
      assert.doesNotMatch(html, /name="robots"[^>]*noindex/i);
    }
    assert.equal((await context.request.get(`${siteOrigin}/no-existe.html`)).status(), 404);
    assert.equal(await page.locator("main a[href^='https://www.agntiapro.com']").count(), 0);
    assert.deepEqual(await context.cookies(), []);
    assert.deepEqual(await page.evaluate(() => [localStorage.length, sessionStorage.length]), [0, 0]);
    assert.equal(external.size, 0);
    await page.goto(appOrigin);
    const notice = page.getByRole("complementary", { name: "Información legal y privacidad" });
    await notice.waitFor();
    const legalFooter = page.getByRole("navigation", { name: "Información legal" });
    const legalLinks = await legalFooter.getByRole("link").all();
    assert.equal(legalLinks.length, 6);
    for (const link of legalLinks) {
      const href = await link.getAttribute("href");
      const response = await context.request.get(new URL(href, appOrigin).href);
      assert.equal(response.status(), 200, href);
      assert.match(await response.text(), /name="legal-status" content="published"/);
    }
    await notice.getByRole("button", { name: "Cerrar aviso legal" }).press("Enter");
    await notice.waitFor({ state: "hidden" });
    assert.equal(await legalFooter.count(), 1);
    await page.goto(`${appOrigin}/?acceso=1`);
    const privacy = page.getByRole("link", { name: "Privacidad", exact: true });
    await privacy.waitFor();
    assert.equal(await privacy.getAttribute("href"), `${siteOrigin}/privacidad.html`);
    assert.equal(
      await page.getByRole("link", { name: "Continuar con Google" }).getAttribute("href"),
      "/api/auth/oauth/google/start",
    );
    assert.equal(
      await page.getByRole("link", { name: "Continuar con GitHub" }).getAttribute("href"),
      "/api/auth/oauth/github/start",
    );
    assert.deepEqual(await context.cookies(), []);
    assert.ok(
      [...external].every((origin) => ["https://fonts.googleapis.com", "https://fonts.gstatic.com"].includes(origin)),
    );

    await page.getByRole("button", { name: /entrar al tenant demo/i }).click();
    await page.getByRole("button", { name: "Hablar con tu agente" }).click();
    await page.getByText("Estás conversando con LAIA", { exact: false }).waitFor();
    await page.getByRole("button", { name: "Ajustes", exact: true }).click();
    const trigger = page.getByRole("button", { name: "Privacidad y datos" });
    await trigger.waitFor();
    assert.equal(await trigger.evaluate((node) => node === document.activeElement), true);
    await trigger.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Privacidad y datos" });
    await dialog.waitFor();
    assert.ok(await dialog.getByText("Las conexiones de la demostración son simuladas.").isVisible());
    const bounds = await dialog.boundingBox();
    assert.ok(bounds && bounds.width <= profile.viewport.width && bounds.height <= profile.viewport.height);
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    await trigger.waitFor();
    assert.equal(await trigger.evaluate((node) => node === document.activeElement), true);
    await page.keyboard.press("Escape");
    await page.getByRole("dialog", { name: "Ajustes y cuenta" }).waitFor({ state: "hidden" });
    assert.ok(await page.getByRole("button", { name: "Transcribir voz" }).isVisible());
    assert.equal(
      await page
        .getByRole("button", { name: "Ajustes", exact: true })
        .evaluate((node) => node === document.activeElement),
      true,
    );

    await page.getByRole("button", { name: "Ajustes", exact: true }).click();
    await page.getByRole("button", { name: "Cerrar sesión" }).click();
    await page.getByRole("button", { name: "Entrar con contrasena" }).waitFor();
    await page.reload();
    await page.getByRole("button", { name: "Entrar con contrasena" }).click();
    await page.getByPlaceholder("tu@empresa.com").fill(credentials.email);
    await page.getByPlaceholder("********").fill(credentials.password);
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    await page.getByRole("button", { name: "Hablar con tu agente" }).click();
    await page.getByRole("button", { name: "Ajustes", exact: true }).click();
    await trigger.click();
    await dialog.getByRole("heading", { name: "Datos de mi empresa" }).waitFor();
    const submitted = page.waitForResponse(
      (response) => response.url().endsWith("/api/privacy/requests") && response.request().method() === "POST",
    );
    await dialog.getByRole("button", { name: "Solicitar copia" }).click();
    const receipt = await submitted;
    assert.equal(receipt.status(), 201);
    const data = await receipt.json();
    await dialog.getByText(`Referencia ${data.id}`).waitFor();
    await dialog.getByRole("button", { name: "Cerrar", exact: true }).click();
    await trigger.click();
    await dialog.getByText(`Referencia ${data.id}`).waitFor();
    process.stdout.write(
      `Chromium ${profile.viewport.width}×${profile.viewport.height}: sitio, login, foco, chat, solicitud persistida y gobernanza verificados.\n`,
    );
    await context.close();
  }
} finally {
  await browser.close();
  await server.agent.stop();
  await db.close();
  await rm(directory, { recursive: true, force: true });
}
