# 15 — Precarga predictiva sin bloqueo

**Estado:** brainstorming, no seleccionado ni implementado por este documento.

## 1. Experiencia y valor
Preparar datos y componentes probables en segundo plano para reducir espera.

**Escena concreta:** Abrir detalle cliente parece instantáneo.

El usuario mantiene control explícito, puede volver a una disposición anterior y no pierde acceso a funcionalidades autorizadas. La propuesta debe aportar una mejora medible frente a la UX actual, no solo espectacularidad visual.

## 2. Inspiraciones a estudiar
Next.js prefetch; browser speculative loading; TanStack Query. Son ejemplos de patrones o líneas de investigación; verificar versiones, licencias, disponibilidad y evidencia de adopción antes de reutilizar. Analizar qué problema resuelven, qué partes son extrapolables y qué sería original en AgntiaPro.

## 3. Stack técnico candidato
**Superficies y librerías:** TanStack Query, Vite React, cache tenant-scoped.

**Stack común ya alineado con el repo:** TypeScript, React/Vite, Tailwind, Zod, Node/Express, Postgres/Neon, AG-UI/CopilotKit, event bus, kernel, policy/approval, runtime SOP, ViewEnvelope/ViewRenderer, cognition cards. Librerías nuevas solo si la auditoría demuestra que no hay equivalente y licencia/seguridad/size son aceptables. No instalar nada por ahora.

## 4. Arquitectura propuesta
- **Captura:** un evento semántico de interacción o una petición explícita entra con `tenantId`, `actorId`, `sessionId`, `workspaceId`, `entityRef` y revisión; el servidor deriva la identidad confiable.
- **Interpretación:** prefetch por probabilidades y presupuesto; cancelación al cambiar contexto; evitar PII en caché.
- **Decisión:** servicio determinista valida esquema, capacidades, contexto, permisos, coste, frescura, idempotencia y conflictos.
- **Proyección:** producir un `ViewSpec`, layout manifest o `UICommand` con targets registrados y `expectedRevision`. La UI solo renderiza templates permitidos.
- **Confirmación:** frontend ACK de presentación; acciones de negocio por SOP/capability/approval y recibo de backend, nunca por ACK visual.
- **Cognición:** Slow/JEV pueden analizar asíncronamente si aportan valor; LAIA Fast recibe una microtarjeta contextual relevante, no el árbol de UI ni todo el grafo.
- **Persistencia:** preferencia personal, estado efímero, evento de auditoría y hecho de negocio son categorías distintas con TTL/retención apropiados.

## 5. Contratos iniciales para explorar
```ts
// Contratos de brainstorming: no se afirma que existan en el repo.
type CandidateUXIntent = {
  schemaVersion: 1;
  kind: 'precarga-predictiva-sin-bloqueo';
  sessionId: string;
  workspaceId?: string;
  entityRef?: { kind: string; id: string };
  expectedRevision: number;
  payload: unknown; // sustituir por Zod discriminado y límites estrictos
};
type CandidateUXOutcome = {
  decisionId: string;
  state: 'proposed'|'applied'|'rejected'|'stale';
  explanationCode: string;
  evidenceRefs?: string[];
};
```
El contrato es un punto de partida, no un duplicado obligatorio de `ViewEnvelope` o `CognitionV2`. Primero buscar tipos equivalentes.

## 6. Mapa de código para futura auditoría
- **Frontend:** `apps/web/src/App.tsx`, `apps/web/src/workspaces/registry.ts`, `apps/web/src/view/ViewRenderer.tsx` y el componente de UX específico que corresponda. No asumir que siguen en esas rutas tras merges.
- **Contratos:** `packages/domain/src/views.ts`, `packages/domain/src/view-envelope.ts`; definir extensiones Zod solo tras inspección.
- **Servidor:** `apps/server/src/engine/conversation.ts`, servicios de views, SOP y policy; kernel/events/graph según semántica.
- **Contexto:** `apps/server/src/engine/context/cognition-cards.ts` y `apps/server/src/engine/cognition/v2/` (attention, context, runtime, slow, JEV). Evitar segunda vía de inyección.
- **Nuevos módulos posibles:** `apps/web/src/ux-experiments/precarga-predictiva-sin-bloqueo/` y `apps/server/src/engine/ux-experiments/precarga-predictiva-sin-bloqueo/`; **solo nombres candidatos** y nunca crear sin reconciliar ramas.

## 7. Pruebas y observabilidad
- Unitarias: regla central, invariantes, schema, límites, rollback y casos vacíos.
- Contract tests: frontend/backend, ACK, revisión, idempotencia, serialización, versiones.
- Seguridad: tenant A/B, roles, revocación, cambio de sesión, datos sensibles, no ejecución de texto de tarjeta.
- E2E Playwright: desktop y móvil, teclado virtual, accesibilidad, reduced-motion, reconexión, errores de red.
- Métricas: tiempo hasta completar tarea, número de pasos, errores, reversiones, latencia p50/p95, tokens Fast, satisfacción explícita. Establecer baseline antes de alegar mejora.

## 8. Riesgos y trade-offs
Mayor complejidad del estado UI, carreras entre interacción manual y comandos, sobrepersonalización, coste de mantenimiento, posibles fugas cross-tenant y accesibilidad. Mitigar con feature flag, preview, opt-out, versionado, rollback y auditoría de decisiones. No introducir una dependencia nueva por moda.

## 9. Preguntas para decidir
1. ¿Ya está hecho en una rama, parcial o totalmente?
2. ¿Qué tarea empresarial concreta mejora y qué métrica probaría el valor?
3. ¿Puede implementarse como extensión de templates y runtime actuales?
4. ¿Qué información necesita realmente LAIA y qué permanece exclusivamente en runtime?
5. ¿Qué permisos, aprobaciones, costes y límites hacen falta?
6. ¿Qué experimento pequeño permitiría descartar la idea sin deuda técnica?

## 10. Prototipo sugerido
Construir primero una demo aislada sobre ACME con datos ficticios y una sola misión. Comparar con la UX actual; no activar en producción ni fusionar sin aprobación.
