# 02 — Simulación documental de integración: qué cambiaríamos, dónde y en qué orden

**Modo actual: DOCUMENTACIÓN / DRY-RUN. No ejecutar, no migrar, no hacer merge de código, no cambiar secretos.** Este documento es la campaña previa a aprobación, no una instrucción de despliegue.

## Arquitectura propuesta

`Fuentes literales CEO/founder → Perfil empresa + catálogo capacidades → Datos canónicos de escenario (versionados) → Selectores y adaptadores → [provider navegador sin red | seed staging persistente] → vistas existentes`.

El dataset es **único en significado**, no obliga a que el sandbox y la BD compartan mecanismo de autenticación. La demo pública puede seguir 100% local; la persistencia de staging usa `TenantScopedStore`. El backend real no debe recibir un token demo.

## Dónde iría cada cosa (rutas FUTURAS propuestas; no existen todavía)

| Artefacto | Ubicación propuesta | Uso |
|---|---|---|
| Documentación de aprobación | `apps/ui-lab/docs/agntia-demo/06-diagnostico-copy-data-sintetica/` | Diagnóstico, copy, contratos, simulación y decisión |
| Paquete canónico | `packages/demo-data/src/` | Entidades, escenarios, generación determinista, validadores y selectores (confirmar workspace pnpm) |
| Perfil de empresa y actores | `packages/demo-data/src/catalog/` | Identidad, roles, servicios, capacidades, estados |
| Historias ficticias y eventos | `packages/demo-data/src/scenarios/` | 8 historias enlazadas, reloj fijo, fases, evidencias |
| Adaptador app navegador | `apps/web/src/demo/fixtures.ts` + nuevo `adapter.ts` | Proyección al `DemoStore` actual |
| API simulada y mutaciones | `apps/web/src/demo/router.ts` | Endpoints compatibles, acciones in-memory, reset |
| Sesión demo | `apps/web/src/demo/tenant.ts`, `apps/web/src/api/auth.ts`, `apps/web/src/api/client.ts` | Identidad `agntia-demo`, sin confundir con sesión real |
| Centro de Mando | `apps/web/src/workspaces/35-centro-mando/hooks/useDemoCentroMandoData.ts` | KPIs y timeline calculados desde selectores |
| Fixtures UI Lab | `apps/ui-lab/src/fixtures.ts`, `registry.tsx`, `FullAppPreview.tsx` | Mismas identidades, listas y ejemplos |
| Estudio de Operaciones | `apps/ui-lab/src/vendor/studio/model.ts` + adaptador futuro | Transformar eventos/actores/proyectos en `StudioState`; conservar reducer y UI |
| Seed persistente | `scripts/provision-agntia-demo.ts`, `scripts/seed-agntia-demo.ts` | Solo PGlite/staging, tras aprobación específica |
| Auditorías y tests | `packages/demo-data/test/` y tests de apps | Determinismo, paridad, referencias, seguridad |
| Informes de ejecución | `apps/ui-lab/docs/agntia-demo/reports/` | Baselines, diff, evidencia de tests y rollback |

## Simulación de la secuencia de implementación

### P0 — Aprobación editorial
**Entrada:** tres documentos de esta carpeta + originales literales. **Trabajo:** revisar nombres de empresas, roles, copies, duración, ocho historias, métricas y permisos. **Salida:** decisión escrita del founder con cambios solicitados. **Gate:** sin aprobación, no se toca código.

### P1 — Fotografía técnica reproducible
**Lecturas:** `apps/web/src/demo/*`, `apps/ui-lab/src/{fixtures,registry,FullAppPreview}*`, `apps/ui-lab/src/vendor/studio/*`, `apps/web/src/workspaces/*`, auth, backend tenant y seed ACME. **Trabajo:** tabla exhaustiva componente → fuente → endpoint → ID → estado → impacto; registrar rama/commit de referencia; screenshots desktop/móvil y tests baseline. **Gate:** conocer todos los consumidores antes de editar.

### P2 — Contratos y semilla mínima
**Trabajo:** modelar 18 taxonomías y seis ejes, 8 clientes y 4 historias causales detalladas; crear esquemas/validadores y reloj fijo. **Pruebas:** referencias sin huérfanos, unicidad por tenant, eventos con causation/correlation, coherencia de facturas, estados y permisos. **Gate:** dataset determinista sin UI.

### P3 — Adaptador de `DemoStore`
**Trabajo:** construir proyecciones hacia las 18 propiedades del store, preservar tipos existentes, rutas y mutaciones. Mantener alias `interfaz` solo como compatibilidad temporal, **no** como segunda empresa. **Pruebas:** login demo, hilos, tareas, agentes, aprobaciones, proyectos, memoria, documentos, WhatsApp simulado, RAG. **Gate:** ninguna llamada externa; reset fiable.

### P4 — UI Lab y Studio
**Trabajo:** cambiar datos de preview y proyección de `model.ts`, respetando inspector, visualizador, timeline, Kanban, grafo y Digital Twin. **Pruebas:** selección coherente por ID, timeline y grafo referencian las mismas tareas, cambios locales no afectan al backend. **Gate:** paridad visual y funcional.

### P5 — Centro de Mando y vistas transversales
**Trabajo:** sustituir heurísticas de copy por selectores; no calcular indicadores de «confianza» sin fuente. **Pruebas:** la oportunidad abierta en CRM aparece en Hoy y timeline; la aprobación pendiente aparece en chat y Kanban; la factura pendiente coincide con finanzas. **Gate:** misma cifra/ID en todas las vistas.

### P6 — Expansión gradual del dataset
**Trabajo:** pasar de historias mínimas a metas de 120 prospectos/240 contactos/65 oportunidades/24 proyectos/450 tareas/800 mensajes/160 documentos/140 finanzas/2.000 eventos; no rellenar solo para llegar a números. **Pruebas:** rendimiento, densidad visual, paginación, filtros, coherencia causal y financiera. **Gate:** no hay duplicaciones de entidades por vista.

### P7 — Persistencia aislada (solo autorización posterior)
**Trabajo:** provisionar `agntia-demo` en PGlite o Neon staging aprobado, generar snapshot y seed idempotente versionado. **Nunca** ejecutar `seed-acme.ts` sobre AgntiaPro, renombrar `acme` ni usar credenciales reales. **Pruebas:** scopes, membership, permisos, prefijos `tenant:owner`, rollback y comparación con provider local. **Gate:** aislamiento verificado y aprobación separada para DB.

### P8 — Validación final antes de aplicar
**Pruebas:** typecheck, unitarios, integración, e2e, accesibilidad, visual desktop/móvil, ausencia de tráfico real, regresión del tenant ACME, control de URLs y secretos. **Salida:** informe de diffs, conteos reales, incidencias y aceptación por superficie. **Gate:** autorización expresa del founder para merge; deploy sigue siendo decisión independiente.

## Ensayo de una operación de extremo a extremo (sin ejecutar)

`msg-001` («Perdemos consultas») → `lead-001` → `opportunity-001` → `meeting-001` → `proposal-001` → `contract-001` → `project-001` → `task-001` → `training-001` → `beta-001` → `approval-001` → `invoice-001` → `payment-001` → `event-*`.

**Proyecciones:**
- LAIA resume la necesidad y pide decisiones usando referencias de eventos.
- CRM muestra oportunidad, fase y fecha; proyectos muestra la compilación; tareas muestra responsable y dependencia.
- Kanban y timeline muestran la misma tarea; grafo muestra relaciones; documentos muestra evidencia.
- Finanzas muestra factura y pago si existe; Centro de Mando calcula MRR y cobros por reglas, no por texto fijo.
- Digital Twin puede bifurcar una **copia hipotética**, nunca escribirla en los hechos del escenario principal.

## Matriz de gates de negocio por fase founder

| Fase | Evidencia sintética requerida | Bloqueo |
|---|---|---|
| 0 sandbox | perfil, owner, consentimiento de simulación | Sin identidad y perfil |
| 1 compilación | AS-IS, TO-BE, dolores, soluciones, ontología, roles | Sin mapa de procesos y responsables |
| 2 | **no definida por founder** | No habilitar gate hasta decisión |
| 3 formación | sesiones, actores, ejercicios y resultados | Sin formación mínima |
| 4 beta | tests, evidencias, validación explícita | Sin aprobación |
| 5 deploy completo | alcance verificado, permisos y activación | Sin verificación |
| 6 feedback | métricas, incidencias, revisiones | Sin procedencia de métricas |
| 7 alpha | experimento aislado, supuestos y autorización | Sin aislamiento de prod |
| 8 scale/twin | escenario de variaciones, supuestos, límites | Sin diferenciar predicción de hecho |

## Política de rollback
La fase documental se revierte sin tocar software. En implementación futura, snapshots del dataset anterior, feature flag de provider, conservación de fixtures legacy, seed versionado, scripts de desactivación **sin borrado destructivo**, y reversión por commit. La validación se hace primero en entorno aislado. No tocar datos de clientes reales.

## Decisiones a validar por el founder antes de escribir código
1. ¿Los ocho clientes deben estar **todos facturando** al día 90, o representar una cartera en fases diversas con MRR menor?
2. ¿Seis meses completos desde la primera versión o 90 días iniciales extensibles?
3. ¿Aprobamos los ocho nombres y sectores ficticios o quieres sustituirlos?
4. ¿Pilar y Manuel figuran como colaboradores de AgntiaPro en la simulación?
5. ¿Qué significa exactamente la fase 7 «alpha» y si quieres definir la fase 2?
6. ¿El primer alcance aprobado será **solo sandbox UI** o también un seed persistente de staging, con aprobación separada?

**Hasta entonces: ninguna modificación del código, ningún dato creado en BD y ninguna integración ejecutada.**
