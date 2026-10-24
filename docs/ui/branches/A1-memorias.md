# A1 - Hotfix de memorias (category, tags)

> **UI_CAMPAIGN_A1_MEMORIAS_V2**
>
> Branch `feat/a1-memory-hotfix`. Estado: HECHO.
> Última actualización: 2026-10-03.

---

## Objetivo

Arreglar el bug real de `MemoryView`: cuando el usuario borra la categoría o los
tags de una memoria, el cambio no se envía al backend y no persiste.

**Bug real (diagnóstico tras leer el código):**
- `MemoryView.saveEdit` no envía `category` si `editCategory` es vacío.
- `MemoryView.saveEdit` no envía `tags` si `editTags` es vacío.
- El backend (`memorySchema`) no acepta `null` como "borrar".
- El handler usa `compareAndSwap` con `patch: body` y no maneja `null`.

**Bug NO confirmado:**
- "Cambiar categoría no persiste" - no lo veo en el código. Solo "borrar".

---

## Ficheros

### Nuevos (1)

- `tests/memory.test.ts`.

### Modificados (2)

- `apps/server/src/engine/routes.ts`.
- `apps/web/src/components/MemoryView.tsx`.

---

## Cambios backend - `apps/server/src/engine/routes.ts`

### Schema

Antes:

    const memorySchema = z.object({
      text,
      source: z.string().trim().min(1).max(200).optional(),
      category: memoryCategories.optional(),
      tags: z.array(z.string().max(60)).max(30).optional(),
    });

Después:

    const memorySchema = z.object({
      text: text.optional(),
      source: z.string().trim().min(1).max(200).optional(),
      category: memoryCategories.nullable().optional(),
      tags: z.array(z.string().trim().min(1).max(60)).max(30).nullable().optional(),
    });

- `text` opcional: permite editar solo `category` o solo `tags`.
- `category` y `tags` aceptan `null` como "borrar".
- Sin `.strict()` (ver decisión D20).

### Handler `POST /memories/:id`

Reemplazar el handler actual por:

    app.post("/memories/:id", async (c) => {
      const body = memorySchema.parse(await c.req.json());
      const patch: Record<string, unknown> = {};
      if (body.text !== undefined) patch.text = body.text;
      if (body.source !== undefined) patch.source = body.source;
      if (body.category !== undefined) patch.category = body.category;
      if (body.tags !== undefined) {
        patch.tags = body.tags
          ? [...new Set(body.tags.map((x) => x.toLowerCase()))]
          : null;
      }
      if (Object.keys(patch).length === 0) {
        throw new AppError("Empty memory patch", 422);
      }
      const memory = await service.db.compareAndSwap<AgentMemory>(
        c.get("owner"),
        "memories",
        c.req.param("id"),
        {},
        patch,
      );
      if (!memory) throw new AppError("Memory not found", 404);
      return c.json(memory);
    });

- Solo `compareAndSwap` (ver decisión D21).
- Normaliza tags a lowercase + dedupe.
- Rechaza patch vacío con `AppError(422)`.

---

## Cambios frontend - `apps/web/src/components/MemoryView.tsx`

En `saveEdit`, cambiar el body para enviar siempre `category` y `tags`:

    body: {
      text: editText.trim(),
      source: editing.source ?? "You",
      category: editCategory || null,
      tags: editTags.trim()
        ? editTags.split(",").map((t) => t.trim()).filter(Boolean)
        : null,
    },

**Nota:** el backend normaliza los tags a lowercase, así que el cliente no
necesita hacerlo.

---

## Test - `tests/memory.test.ts`

    import assert from "node:assert/strict";
    import { mkdtemp, rm } from "node:fs/promises";
    import { tmpdir } from "node:os";
    import { join } from "node:path";
    import { after, before, test } from "node:test";
    import { createApp } from "../apps/server/src/app.ts";
    import type { Config } from "../apps/server/src/config.ts";
    import { createStore, type Store } from "../apps/server/src/db.ts";
    import type { AgentMemory } from "../packages/domain/src/agent.ts";

    let db: Store;
    let server: Awaited<ReturnType<typeof createApp>>;
    let token: string;
    let directory: string;

    before(async () => {
      directory = await mkdtemp(join(tmpdir(), "openmuse-memory-"));
      db = await createStore({ dataDir: join(directory, "db") });
      const config: Config = {
        mode: "sample",
        port: 8787,
        host: "127.0.0.1",
        publicUrl: "http://localhost:8787",
        dataDir: directory,
        agentBackend: "sample",
        googleRedirectUri: "http://localhost:8787/api/google/callback",
        allowedOrigins: [],
      };
      server = await createApp(db, config);
      const session = await server.app.request("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      token = (await session.json()).token;
    });

    after(async () => {
      await server.agent.stop();
      await db.close();
      await rm(directory, { recursive: true, force: true });
    });

    const headers = () => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" });

    test("crear memoria con category y tags", async () => {
      const res = await server.app.request("/api/agent/memories", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ text: "Cliente prefiere morning", source: "You", category: "cliente", tags: ["Tono", "PREFERENCIA"] }),
      });
      assert.equal(res.status, 201);
      const memory = (await res.json()) as AgentMemory;
      assert.equal(memory.category, "cliente");
      assert.deepEqual(memory.tags, ["Tono", "PREFERENCIA"]);
    });

    test("editar solo text (patch parcial)", async () => {
      const created = (await (await server.app.request("/api/agent/memories", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ text: "viejo", source: "You", category: "empresa" }),
      })).json()) as AgentMemory;
      const res = await server.app.request(`/api/agent/memories/${created.id}`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ text: "nuevo" }),
      });
      assert.equal(res.status, 200);
      const updated = (await res.json()) as AgentMemory;
      assert.equal(updated.text, "nuevo");
      assert.equal(updated.category, "empresa");
    });

    test("editar category a otro valor", async () => {
      const created = (await (await server.app.request("/api/agent/memories", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ text: "cambiar cat", source: "You", category: "empresa" }),
      })).json()) as AgentMemory;
      const res = await server.app.request(`/api/agent/memories/${created.id}`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ category: "cliente" }),
      });
      assert.equal(res.status, 200);
      const updated = (await res.json()) as AgentMemory;
      assert.equal(updated.category, "cliente");
    });

    test("editar category a null borra la categoria", async () => {
      const created = (await (await server.app.request("/api/agent/memories", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ text: "borrar cat", source: "You", category: "empresa", tags: ["X"] }),
      })).json()) as AgentMemory;
      const res = await server.app.request(`/api/agent/memories/${created.id}`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ category: null, tags: null }),
      });
      assert.equal(res.status, 200);
      const updated = (await res.json()) as AgentMemory;
      assert.equal(updated.category ?? null, null);
      assert.equal(updated.tags ?? null, null);
    });

    test("patch vacio devuelve 422", async () => {
      const created = (await (await server.app.request("/api/agent/memories", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ text: "patch vacio", source: "You" }),
      })).json()) as AgentMemory;
      const res = await server.app.request(`/api/agent/memories/${created.id}`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({}),
      });
      assert.equal(res.status, 422);
    });

---

## Criterio de aceptación

- `pnpm typecheck` en 0.
- `pnpm --filter @openmuse/web typecheck` en 0.
- `pnpm test`: los 5 tests nuevos pasan.
- Manual: en `MemoryView`, editar una memoria, borrar la categoría, guardar, recargar. La categoría ya no aparece.
- Manual: editar una memoria, borrar los tags, guardar, recargar. Los tags ya no aparecen.

---

## Notas de bloqueo

- **Parche `MEMORY_PATCH_V1` revertido** porque mezclaba `put()` con `compareAndSwap()` y usaba `.strict()` sin verificar. Ver D20 y D21.
- **El `TODO.md` estaba equivocado.** Dice que "el backend no acepta category y tags". El backend sí los acepta. El bug real es "borrar no persiste". Corregir el `TODO.md` cuando se actualicen los docs al cerrar la campaña.

---

**Fin de A1.**