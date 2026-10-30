# NC-P00 — Contratos candidatos mínimos

> Base: `main` **4f81f22** · Fecha: 2026-10-30 · Estado: propuesta.
> Solo se proponen los contratos que P00/P01/P02 necesitan. El catálogo completo de NC-01/02/03 no se crea aquí.

## 1. Principios

1. **Reutilizar identidad canónica.** `KernelContext` ya define `tenantId`, `owner`, `role`, `requestId`, `actorId`, `correlationId`, `personaId` y `sessionId` (`kernel/context/kernel-context.ts:15-30`). La cognición no inventa un segundo contexto de identidad: lo consume.
2. **Aditivo y opcional.** Nada que rompa llamantes existentes; todo campo nuevo es opcional o tiene default.
3. **Sin actor inventado.** Si no hay actor demostrado, se omite y se marca `legacy`; nunca se deriva un `actorId` del `owner` y se presenta como identidad real.
4. **Fail-closed en ámbito.** Sin `tenantId`/`owner` válidos no se recupera ni se escribe.
5. **Sin hooks vacíos.** Un contrato entra cuando tiene consumidor y prueba; no se crea el árbol de 100 módulos.
6. **Nada de dominio en el kernel.** Cromos, Jev, autobiografía y modelos explicativos viven en `engine/cognition/**`, no en `kernel/**`.

## 2. C1 — `ExecutionContext` (proyección compartida)

Ya existe la forma canónica; solo se necesita un tipo estable para los puertos que no son kernel.

```ts
// packages/domain/src/cognition.ts (nuevo, propiedad jefe NC)
export interface ExecutionContext {
  tenantId: string;
  owner: string;
  actorId: string;
  actorKind: "human" | "agent" | "system" | "worker";
  requestId: string;
  correlationId?: string;
  personaId?: string;
  sessionId?: string;
}
```

- `tenantId` y `owner` son obligatorios.
- `actorId` es obligatorio en el tipo, pero el **llamante** decide si puede demostrarlo; las rutas que no puedan pasan por `LegacyExecutionContext` (C2) y lo declaran.
- No incluye permisos ni scopes: la autorización sigue en `authz`/`policy`, no en el contrato cognitivo.

## 3. C2 — Contexto persistido de tarea

```ts
export interface PersistedTaskContext {
  taskId: string;
  tenantId: string;
  owner: string;
  requestedBy?: string;                 // actor que originó la tarea
  requestedActorKind?: ExecutionContext["actorKind"];
  correlationId?: string;
  compat: "real" | "legacy";            // procedencia de la identidad
}
```

- Se persiste en `AgentTask` como campos aditivos (ver NC-BR-001).
- `compat: "legacy"` es obligatorio cuando `requestedBy` falta: no se finge identidad.
- `tenantId` ya es obligatorio en `AgentTask` (`packages/domain/src/agent.ts:76`); no se duplica.

## 4. C3 — Puerto de memoria (`MemoryRecallPort`)

Firma actual que **se conserva** (`engine/memory.ts:90`):

```ts
recall(owner: string, query: string, options?: RecallOptions): Promise<RecallResult>;
```

Extensión propuesta, compatible:

```ts
export interface RecallHitOrigin {
  origin: "scoped" | "legacy";   // ventana de migración NC-BR-003
}

export interface RecallResult {
  query: string;
  ragHits: RagHit[];
  memories: AgentMemory[];
  text: string;
  lowConfidence: boolean;
  explanation: string;
  // nuevo, opcional:
  provenance?: RecallHitOrigin[];
}
```

- El puerto no decide permisos: recibe `owner` ya autorizado y un Store ya scoped.
- No se cambia el texto formateado: `conversation.ts:590` lo inyecta como mensaje de sistema; la compatibilidad es requisito.
- La memoria cromática no entra aquí todavía: primero se define la ontología (bloqueada).

## 5. C4 — Puerto de contexto (`ContextAssemblyPort`)

Firma actual (`engine/context/engine.ts:59`):

```ts
assemble(owner: string, input: AssembleInput): Promise<ContextPackage>;
```

Propuesta: mantenerla y añadir un campo opcional al paquete, sin sustituir `recall`:

```ts
export interface ContextPackage {
  // ...campos actuales sin cambios
  cognitive?: {
    runId: string;
    evidence: Array<{ id: string; source: string; kind: string }>;
    limits: { cards: number; tokens: number };
  };
}
```

- `cognitive` ausente = comportamiento actual exacto.
- El `ContextEngine` no ejecuta acciones ni escribe memoria: solo compone.

## 6. C5 — Puerto de eventos (`EventAppendPort`)

```ts
export interface EventAppendResult {
  id: string;
  deduped: boolean;
}

export interface EventAppendPort {
  append(input: {
    owner: string;
    tenantId: string;
    type: SystemEventType;
    source: SystemEventSource;
    payload: Record<string, unknown>;
    correlationId?: string;
    causationId?: string;
    dedupeKey?: string;
  }): Promise<EventAppendResult>;
}
```

- Se implementa sobre `EventBus.emit` con `strict: true` (NC-BR-002); no es un bus nuevo.
- `append` confirma **la escritura del evento**, no la atomicidad con el efecto de negocio.
- Para replay de decisiones semánticas se persistirán los resultados usados, no se re-inferirán (requisito de P02).

## 7. C6 — `CognitiveRun` v0 (P01/P02)

Mínimo para un circuito recuperable; **no** es un segundo TaskWorker.

```ts
export interface CognitiveRun {
  id: string;
  tenantId: string;
  owner: string;
  actorId: string;
  correlationId?: string;
  objective: string;
  status: "created" | "running" | "waiting" | "succeeded" | "failed" | "cancelled";
  budget: { maxCycles: number; maxTokens: number; maxCards: number };
  checkpoint?: { at: string; step: string; payloadId?: string };
  createdAt: string;
  updatedAt: string;
  version: number;                       // CAS, igual que AgentTask
}
```

- Vive en `engine/cognition/`, con su propio `kind` de Store.
- No ejecuta acciones externas ni aprueba nada.
- La cancelación y el presupuesto se aplican en el runtime cognitivo, no en el kernel.

## 8. C7 — Taxonomía de errores

```ts
export type CognitionErrorCode =
  | "unavailable"        // proveedor o store caído
  | "denied"             // ámbito/permiso insuficiente
  | "conflict"           // versión/CAS
  | "budget_exhausted"
  | "cancelled"
  | "invalid_contract";  // payload que no valida Zod
```

- Se mapea a HTTP en las rutas de inspección (P07), no en el núcleo.
- `unavailable` nunca degrada a datos de otro tenant.

## 9. Contratos deliberadamente aplazados

| Contrato | Por qué no ahora |
| --- | --- |
| `ChromaticCard` / `ChromaticProfile` | las 10 dimensiones y 6 polaridades no existen en código ni en una fuente aprobada (`cromo.ts`, `CROMOS_PENDING_V1`) |
| `SemanticOperation` / `JevAdapter` | la API real de Jev no está verificada; primero baseline determinista |
| `Episode`, `TemporalClaim`, `Scenario` | dependen del modelo bitemporal y de P04/P05 |
| `Perspective`, `SelfModel`, `LearningProposal` | P06; crearlos ahora sería catálogo huérfano |
| `ContextBundle` cromático | depende de C3/C4 y de la ontología |

## 10. Compatibilidad y migración

- Campos nuevos: opcionales. Registros antiguos: `tenantId` presente (backfill `'default'`), actor ausente → `legacy`.
- Cambio de namespace de memoria (NC-BR-003): requiere lectura de respaldo + migración idempotente + marca de origen.
- Nada de este documento cambia `SystemEventType`: los eventos cognitivos se proponen en P02, con su schema Zod en la misma PR que los usa.

## 11. Lo que estos contratos NO deben hacer

- No conceden permisos ni sustituyen `PolicyDecisionPoint`/`authz`.
- No escriben en el grafo de negocio ni en canales externos.
- No convierten una evaluación semántica en un hecho.
- No introducen `owner` como sustituto de `tenantId` (ni al revés).
- No crean un registro global de dependencias ni una nueva librería.
