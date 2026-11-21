# 06 — Auditoría, campañas y handoff para Codex

## Alcance de la auditoría
Lectura de archivos concretos de `main` en 2026-11-21. Evidencias positivas: registro de 35 workspaces, siete ViewSpecs, ViewEnvelope, estado de navegación en App, inyección real de tarjetas en conversation, Fast/Slow, cinco memorias, atención, context snapshots, JEV egress. **No encontrado/verificado**: registro semántico global de cada componente, snapshots UI canónicos, comando UI tipado con ACK end-to-end, política de menú adaptativo consolidada, wiring de branding tenant en todos los templates. Esto no demuestra ausencia en otras ramas. No se han ejecutado tests.

## Campañas secuenciales (documentación ahora, código después)
### UIR-00 — Inventario y reconciliación de ramas
Leer `main` y ramas recientes de cognition V2, kernel, C03/C04 conversación, UX móvil, voice/avatar, branding y workspaces. Matriz: archivo, ref/SHA, dueño, contrato, conflictos, tests, feature flags. Marcar legacy vs vigente. **Salida**: audit trazable, ADRs y grafo de dependencias. No modificar código.

### UIR-01 — Contratos canónicos de identidad
Definir Zod/versiones para screen/workspace/view/component/instance/entity/session, catálogo de capacidades y convenciones de naming. Aprovechar registry y ViewEnvelope. **Tests**: unicidad, estabilidad al traducir/reordenar, claves dinámicas, compatibilidad, permisos.

### UIR-02 — Registro semántico de componentes
Instrumentar AppShell, Sidebar, WorkspaceShell, ViewRenderer y siete templates; hooks declarativos por componente. Evitar nodos decorativos. **Tests**: montaje/desmontaje, modales, listas, rutas, responsive, React StrictMode, colisiones de ID.

### UIR-03 — Proyección UI Context
Reducer/Provider frontend y store de sesión runtime, snapshots/deltas/versiones, coalescing y reconexión. **Tests**: multi-tab, multi-device, stale revision, logout, tenant switch, reconexión, dedup, TTL, revocación.

### UIR-04 — Tarjetas UI context y atención
Reusar sistema de contexto autorizado y grafo; microtarjetas `ui.context` con metadata, scope, budget, provenance. Decidir evolución de ontology sin romper schemas. **Tests**: máximo tokens, relevancia, cero datos no autorizados, injection como datos, replay, doble consumo.

### UIR-05 — UI Command Dispatcher
Operaciones de navegación/presentación con allowlist, policy, target, expectedRevision, idempotencia, ACK y recibos. **Tests**: target inexistente, revisión obsoleta, cambio de tenant, comando repetido, permisos revocados, confirmación de resultado.

### UIR-06 — Templates y branding tenant
Inventariar tokens CSS y workspace Branding real; defaults AgntiaPro + overrides por propiedad, validación, preview y refresh. **Tests**: dos tenants aislados, fallback, assets, accesibilidad, modo claro/oscuro. No introducir ThemeResolver cognitivo.

### UIR-07 — UX hiperpersonalizada
Instrumentar sidebar/dashboard/workspaces con preferencias explícitas y algoritmos deterministas de frecuencia/recencia/afinidad de rol. Umbrales, histéresis, orden estable, pins, reset, opt-out. **Tests**: reproducibilidad, permisos, no jitter, móvil/desktop, tenant/actor isolation.

### UIR-08 — Conversación multimodal y presenter
Enlazar texto, voz y vídeo al mismo estado conversacional/identidad y recibos, preservando mocks intencionales hasta wiring real. Fast recibe tarjetas pequeñas; slow asíncrono. **Tests**: cambios de pantalla durante streaming, interrupciones, canal, hilo, latencia, feedback verdadero.

### UIR-09 — Dogfooding y rollout
Tres tenants demo aislados, roles owner/empleado/invitado, dashboards y branding diferentes. Gates: typecheck, unit, contract, security, E2E, Playwright móvil teclado/bottom sheet, observabilidad. Feature flags y rollback; **sin deploy automático**.

## Dependencias y orden
UIR-00 precede a todo. UIR-01 precede UIR-02/03/05. UIR-03 precede UIR-04/05. UIR-06 y UIR-07 pueden seguir a UIR-01 y avanzar sin Slow/JEV. UIR-08 exige conversación consolidada. UIR-09 exige gates previos. El primer slice verificable: chat texto → microtarjeta UI → abrir workspace autorizado → ACK → feedback; después form draft; después personalización.

## Plantilla de reporte por campaña
- Fecha, rama, SHA base, SHA final, autor, alcance y dependencias.
- Archivos tocados, contratos versionados, migraciones y compatibilidad.
- Tests ejecutados y resultados reales; no confundir plan con ejecución.
- Seguridad/tenant/actor, latencia Fast, tokens, audit/trace.
- Riesgos abiertos, rollback, evidencias (logs/screenshots si existen).
- Handoff siguiente campaña, blockers y decisiones pendientes.
- Confirmación explícita: no merge ni deploy sin aprobación.

## Prompt handoff para Codex
> Lee este folder entero y audita el código y todas las ramas relevantes antes de implementar. Prioriza el estado real del código sobre docs legacy. Preserva la arquitectura: LAIA Fast es una interfaz de baja latencia y recibe solo microtarjetas; el runtime/kernel/grafo/memorias/Slow/JEV conservan conocimiento y autoridad. No crees otro motor de RAG, UI libre por LLM ni un ThemeResolver nuevo. Templates codificados + branding del tenant + personalización determinista en componentes. Empieza por UIR-00 y reporta hallazgos y plan por archivos. Ejecuta campañas secuencialmente en rama de trabajo separada, documenta cada paso, corre gates y no hagas merge ni deploy sin aprobación.
