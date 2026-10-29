# HANDOFF-LLM — mandato de la campaña "de la clave del modelo al workspace"

> Este es el trabajo grande. La auditoría que lo justifica está en
> `docs/operacion/AUDITORIA-LLM-WORKSPACE.md`: léela entera antes de escribir una
> línea; cada fase de aquí abajo cierra defectos concretos de allí (D1…D12).
>
> Base: `main @ c69e028` (o el tip de `main` cuando crees la rama).
> Rama: `campaign/llm-runtime`. Un lane = una rama = un agente.

## 0. Misión

Convertir el camino del modelo — hoy delegado al vendor y contabilizado con
caracteres — en una **capa propia con credencial, coste y contrato**, y
demostrarlo con **un vertical slice** que vaya de la clave del modelo al panel:

> `SLOW_LLM_API_KEY` del tenant → tarea durable → `llm_generate` de una SOP →
> escritura en el workspace → vista en el panel, con **tokens, coste y latencia
> reales escritos en `llm-usage` y visibles**.

Ese es el criterio final. Si al terminar no se puede ejecutar y enseñar eso, la
campaña no está hecha, por mucho que compile.

## 1. Propiedad de ficheros (esto evita los conflictos)

**Escribes en:**

```
packages/integrations/src/llm/**            (nuevo, tuyo entero)
apps/server/src/engine/model-chain.ts
apps/server/src/engine/embeddings.ts
apps/server/src/engine/planner/**
apps/server/src/engine/execution/**
apps/server/src/engine/context/**
apps/server/src/kernel/authors/**
tests/llm/**                                (nuevo; el runner ya cubre tests/**)
docs/operacion/AUDITORIA-LLM-WORKSPACE.md   (solo la sección "Resuelto")
```

**No escribes en** (es el lane 1, yo; pedirme el cambio por el PR y lo cableo yo
en un commit corto):

```
apps/server/src/app.ts
apps/server/src/engine/service.ts           (construccion/wiring)
apps/server/src/engine/model.ts             (call sites)
apps/server/src/engine/sop-executor.ts
apps/server/src/*-routes.ts
scripts/**, docs/operacion/** (salvo la seccion Resuelto), .github/**
package.json, pnpm-lock.yaml, pnpm-workspace.yaml, tests/setup.ts
```

Regla práctica: **puedes crear módulos y cambiar su comportamiento interno; el
cableado a `service.ts`/`app.ts` lo hago yo.** Si necesitas una firma distinta en
un fichero mío, lo escribes en el PR como "necesito este import y estos 5 argumentos".

## 2. Contratos congelados

```ts
// packages/integrations/src/llm/spec.ts
export type LlmProvider = "google" | "openai" | "openrouter" | "anthropic";
export interface ProviderSpec {
  readonly provider: LlmProvider;
  readonly model: string;
  readonly baseUrl: string;      // endpoint OpenAI-compatible del proveedor
  readonly auth: "bearer" | "query";   // google acepta bearer en /v1beta/openai
  readonly supportsStreaming: boolean;
  readonly supportsTools: boolean;
  readonly supportsJsonSchema: boolean;
}
export function resolveProviderSpec(raw: string): ProviderSpec; // "google/gemini-x" -> spec
```

```ts
// packages/integrations/src/llm/client.ts
export interface LlmCallInput {
  readonly spec: string;                    // "<provider>/<model>"
  readonly apiKey: string;
  readonly messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  readonly tools?: readonly unknown[];
  readonly jsonSchema?: unknown;
  readonly maxOutputTokens?: number;
  readonly temperature?: number;
  readonly signal?: AbortSignal;
}
export interface LlmUsage {
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly totalTokens: number;
  readonly estimated: boolean;   // true si el proveedor no los mando
  readonly providerRequestId?: string;
}
export interface LlmCallResult {
  readonly text: string;
  readonly toolCalls: readonly { id: string; name: string; arguments: string }[];
  readonly usage: LlmUsage;
  readonly latencyMs: number;
  readonly finishReason: string;
  readonly spec: string;
}
export class LlmClient {
  constructor(options: { baseUrl: string; timeoutMs?: number; fetchImpl?: typeof fetch });
  complete(input: LlmCallInput): Promise<LlmCallResult>;
  stream(input: LlmCallInput): AsyncIterable<
    { type: "delta"; text: string } | { type: "tool_call"; id: string; name: string; argsDelta: string } | { type: "done"; result: LlmCallResult }
  >;
}
```

```ts
// packages/integrations/src/llm/router.ts
export interface ChainLink { readonly spec: string; readonly apiKey?: string; readonly source: "tenant" | "global"; }
export interface ResolvedChain {
  readonly mode: "chat" | "task" | "sop" | "plan";
  readonly links: readonly ChainLink[];
  readonly tenantId: string;
  readonly roleId?: string;
}
export function resolveChain(input: {
  mode: ResolvedChain["mode"];
  tenantId: string;
  tenant?: TenantConfigLike;   // fast/slow/embeddings/roles, tal como lo sirve env-resolver
  global: { model?: string; fallback?: string; key?: string };
  roleId?: string;
}): ResolvedChain;
```

Reglas de comportamiento, no negociables:

1. Sin credencial para un eslabón: **se salta al siguiente con `source` explícito**;
   si no queda ninguno, `AppError` 503 diciendo **qué variable** falta.
2. `401`/`403` del proveedor: **no** es reintentable → error claro y no se consume
   el siguiente eslabón (la key está mal, no el proveedor).
3. `429`/`5xx`/timeout de primer byte: sí se pasa al siguiente eslabón.
4. Streaming cortado a mitad: **no** se reinicia (ya hay salida visible).
5. `usage` ausente en la respuesta: se cuenta con tokenizador local y se marca
   `estimated: true`. **Prohibido** inventar un número sin marcar.

## 3. Fases

### F0 · Línea base medible (sin claves)
- `pnpm llm:baseline` imprime, para chat/tarea/SOP/plan: eslabón elegido, si hay
  key por tenant o global, si registra uso, y el nº de caracteres contados hoy.
- Test que fija ese estado para poder demostrar la diferencia después.
- **Hecho**: el documento de auditoría tiene una tabla "antes" con números reales.

### F1 · Cliente propio (el cimiento)
- `llm/spec.ts` + `llm/client.ts` con `fetch` y un parser SSE **propio** (nada de
  SDKs nuevos; `AbortSignal.timeout`, `redirect: "error"`, cuerpo de error
  truncado a 200 chars y sin filtrar la key).
- `stream()` con `done` que lleva el `usage` final; `complete()` para planner/SOP.
- Tests mockeando `fetch`: 429 → siguiente eslabón; 401 → 503 con el nombre de la
  variable; stream cortado → error tipado sin reinicio; `usage` real y `estimated`;
  timeout de primer byte; JSON inválido del proveedor.
- **Hecho**: `grep BuiltInAgent` ya no aparece en planner/SOP; F1 no toca el chat.

### F2 · Uso, coste y cuota reales (dinero)
- Tabla de precios versionada (`llm/pricing.ts`): `{provider, model, inPerMillion, outPerMillion, currency}` con fecha de vigencia. Si falta el precio: coste `null`, **no 0**.
- `llm-usage` pasa a `{ tenantId, owner, roleId, mode, spec, model, inputTokens, outputTokens, costEur: number | null, estimated, latencyMs, providerRequestId, at }`.
- Contador diario por tenant+modo para la cuota (nada de sumar la tabla entera por tarea).
- Cuota **antes** de llamar, con reserva del presupuesto de la llamada en curso.
- **Hecho**: una tarea con la cuota agotada devuelve `waiting_input` con el motivo,
  y la fila de uso escrita tiene tokens y coste (o `null` + `estimated`).

### F3 · Un solo camino
- Chat, tarea, SOP y plan pasan por el router. Los tres `new BuiltInAgent`
  duplicados desaparecen (el chat mantiene AG-UI: el transporte del panel no
  cambia de forma, solo de quién decide credenciales).
- `generateText` recibe el tenant, registra uso y respeta cuota (cierra D1/D4).
- Bulkhead y circuit breaker **por tenant** (`llm:<tenant>:<provider>`), no en
  `globalThis` (cierra D6).
- **Hecho**: test que ejecuta la misma SOP con dos tenants y demuestra que cada
  fila de `llm-usage` lleva su spec y su tenant.

### F4 · Salida estructurada y contrato con el kernel
- `structured<T>(schema, ...)`: JSON schema → validación Zod → **una** reparación
  con el error del parser → si falla, error tipado. Se elimina el `indexOf("[")`.
- `validatePlanCapabilities` se aplica en el planner y el plan se **persiste con
  versión** antes de ejecutar (hoy el fallback `StubPlanner` devuelve plan vacío:
  eso no puede pasar como si fuera un plan).
- `FastAuthor`/`SlowAuthor` reciben `matched/ignored` del **recall real** (hits con
  score). La heurística de substring se borra (cierra D5).
- **Hecho**: test que prueba que un `capabilityId` inexistente no llega al
  `Executor`, y que `matched` de un thought coincide con los hits del recall.

### F5 · Memoria y contexto que no se inventan
- `embeddings.ts` respeta `EMBEDDINGS_LLM_PROVIDER/MODEL/BASE_URL/API_KEY` por
  tenant, soporta batch y devuelve error tipado en vez de `null` silencioso
  (cierra D7). El fallback léxico queda explícito y rotulado como tal.
- Con `DATABASE_URL` de Postgres: pgvector para el índice. Sin él: mismo
  comportamiento que hoy, pero declarado.
- Set de evaluación de 20 consultas con respuesta esperada y `pnpm llm:eval-memory`
  que imprime recall@5 y MRR. **Un número, no una impresión** (cierra D8).
- **Hecho**: el número está en el PR y en la auditoría.

### F6 · Hasta el workspace (el vertical slice)
- Contratos: `status` del manifest manda (el runtime no puede registrar un módulo
  que dice `implemented` cuando el manifest dice `scaffold`; hoy se contradicen).
- `bridge.ts` deja de declarar idempotente lo que no lo es: la idempotencia sale
  del manifest declarado, y un `send` es como mínimo `non-idempotent` (cierra D11).
- Handlers de workspace: cada comando valida su payload con un schema real y emite
  **su** evento (hoy todos emiten `whatsapp.message.received`); lo que no esté
  implementado se declara `not_implemented` y **rechaza**, no finge (cierra D10).
- Vertical slice end-to-end: entrante de WhatsApp → tarea → `prepare_whatsapp` →
  aprobación → envío → evento `whatsapp.message.sent` → visible en el panel.
- **Hecho**: un script `pnpm llm:slice --tenant=agntia` que recorre eso sin claves
  reales (proveedor y WhatsApp mockeados) y falla si algún eslabón no está.

## 4. Cómo se verifica

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test                                    # ALLOW_NETWORK=0; la red esta bloqueada en tests/setup.ts
pnpm exec tsx --import ./tests/setup.ts --test tests/llm/
pnpm audit:layers && pnpm audit:bridges && pnpm audit:console && pnpm audit:tenant-default
```

Tu campaña está verde cuando: `typecheck` 0, `pnpm test` 0 fail, los cuatro audits
anteriores verdes, y **ningún test requiere red**. Los tests de proveedor se
escriben con `fetchImpl` inyectado, nunca tocando `tests/setup.ts`.

No es criterio: `pnpm lint` (biome sale rojo repo-wide y no está en el CI) ni
`audit:contracts`/`audit:idempotency` (rojos de antes; ver el gate del deploy en
`HANDOFF-CODEX.md`).

## 5. Protocolo de rama y PR

```bash
git fetch origin && git switch main && git pull --ff-only
git switch -c campaign/llm-runtime
# ... una fase, un commit: feat(llm): F1 cliente propio con usage real
git fetch origin && git rebase origin/main
git push -u origin campaign/llm-runtime
```

- Un PR por fase (F1…F6). Cada PR: qué defecto de la auditoría cierra, el test que
  lo demuestra, qué necesitas del lane 1 para cablearlo.
- Al cerrar una fase: añade la entrada en la sección **Resuelto** de
  `AUDITORIA-LLM-WORKSPACE.md` con la evidencia (fichero + test). Si algo de la
  auditoría era falso, corrígelo ahí y dilo en el PR.
- Prohibido: tocar `tests/setup.ts`, añadir dependencias, cambiar el lockfile, o
  reformatear ficheros que no son tuyos.

## 6. Brief para pegar en Codex

```
Repo: uniscrolliabrain-cloud/agente. Base: main (tip actual). Rama: campaign/llm-runtime.

Lee primero, enteros: docs/operacion/AUDITORIA-LLM-WORKSPACE.md y
docs/operacion/HANDOFF-LLM.md. Este segundo es tu mandato: fases F0..F6, contratos
congelados y propiedad de ficheros (seccion 1). Respeta la lista de "no escribes en":
el cableado a service.ts/app.ts/model.ts/sop-executor.ts lo hace el lane 1 y tu lo
pides por el PR.

Empieza por F0 (linea base medible) y F1 (cliente LLM propio OpenAI-compatible con
parser SSE propio, sin dependencias nuevas), en la rama campaign/llm-runtime. Cada
fase es un PR con: el defecto de la auditoria que cierra, los tests con fetch mockeado
que lo prueban, y lo que necesitas del lane 1.

Criterio de hecho por fase: pnpm typecheck 0, pnpm test 0 fail, los audits layers/
bridges/console/tenant-default verdes, y cero red en tests. Marca como PENDIENTE todo
lo que no hayas podido ejecutar; no lo declares hecho.
```
