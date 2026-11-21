# 39 — optimizacion de ux mediante experimentos

> FUTURO / BRAINSTORM. No implica selección, desarrollo ni despliegue.

## Qué experiencia produciría
Variantes programadas medidas con guardrails. Ejemplo: Comparar onboarding A/B.. Se conserva una interfaz estable y gobernada, no generación arbitraria de componentes.

## Inspiración y evidencia a contrastar
GrowthBook, Optimizely. Referencias de producto, patrón o investigación: revisar sus documentos oficiales, licencias y límites. No extrapolar métricas comerciales sin evidencia.

## Stack candidato
feature flags, analytics, React/Vite/Tailwind, Zod, Node/TS, Postgres/Neon, AG-UI, ViewEnvelope/ViewRenderer, event bus, kernel, policy/approval, cognition V2 y grafo. No añadir infraestructura duplicada.

## Diseño de código
1. Inspeccionar estado real de main y ramas recientes; localizar equivalentes y contratos existentes.
2. Extender el catálogo de capacidades con ID estable, schemaVersion, target, permisos y operaciones permitidas. No exponer JSX ni funciones en manifiestos.
3. Resolver configuración/datos por tenant y actor en runtime; validar autorización, revisión, TTL y procedencia.
4. Implementar adaptador/selector programado para `optimizacion-de-ux-mediante-experimentos` que devuelve ViewSpec o UICommand tipado; mantener fallback de template.
5. Sincronizar frontend con expectedRevision, ACK, idempotencia y manejo de stale; mutaciones empresariales solo por SOP y approvals.
6. Emitir eventos semánticos con correlationId, causationId, tenant y actor. Separar telemetría, preferencias, hechos y memoria.
7. Si LAIA necesita informar, generar tarjeta corta con metadata, scope, provenance y presupuesto de tokens; Slow/JEV no bloquean la primera respuesta.
8. Activar en prototipo ACME bajo feature flag; comparar métricas, rollback.

## Contratos ilustrativos
```ts
type CandidateManifest = {schemaVersion:1; kind:'optimizacion-de-ux-mediante-experimentos';
  componentId:string; capabilities:string[]; requiredPermissions:string[]};
type CandidateDecision = {decisionId:string; expectedRevision:number;
  status:'proposed'|'applied'|'rejected'|'stale'; evidenceRefs:string[]};
```
Estos tipos son brainstorming, no código existente ni diseño definitivo.

## Archivos y wiring a revisar
`apps/web/src/App.tsx`, `apps/web/src/workspaces/registry.ts`, `apps/web/src/view/ViewRenderer.tsx`, `packages/domain/src/views.ts`, `packages/domain/src/view-envelope.ts`, `apps/server/src/engine/conversation.ts`, `apps/server/src/engine/cognition/v2/`, `apps/server/src/kernel/`. Comparar ramas UX móvil, cognition, voz y avatar antes de proponer paths nuevos.

## Calidad, seguridad y aceptación
Unit tests, Zod contract tests, Playwright móvil/escritorio, accesibilidad, multiusuario y aislamiento tenant, revocación, race conditions, reconexión, errores, latencia p95 y coste de tokens. Criterio: mejora medible en tarea real sin pérdida de control ni aumento injustificado de complejidad.

## Preguntas para selección futura
¿Qué porcentaje existe ya? ¿Cuál es el MVP experimental? ¿Cómo se evita acoplar Fast al estado completo? ¿Qué riesgos legales y de privacidad hay? ¿Qué feature flag y rollback necesita?
