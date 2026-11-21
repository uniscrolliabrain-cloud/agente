# Programa de cumplimiento RGPD, LSSI y AI Act — AgntiaPro

> **INSTRUCCIÓN DE EJECUCIÓN VIGENTE PARA FREEBUFF:** [CAMPAÑA ÚNICA — Implementación integral](CAMPANA-UNICA-FREEBUFF-IMPLEMENTACION-INTEGRAL.md). Los documentos 01–09 son referencias y anexos, **no campañas independientes**. Ejecutar en una sola rama nueva desde esta rama; no merge/deploy sin revisión.


Estado: PLANIFICADO / NO IMPLEMENTADO. Rama: `feat/legal-privacy-ai-compliance`. Fuente: seis campañas acordadas el 2026-11-20.

## Objetivo
Preparar AgntiaPro para operación SaaS en España/UE: información legal, tratamiento lícito de datos, derechos RGPD, separación entre tenants, transparencia IA y evidencias verificables. No afirmar cumplimiento certificado por la mera ejecución de tests.

## Orden de ejecución
1. [01 Auditoría de tratamientos y proveedores](01-auditoria-tratamientos-proveedores.md)
2. [02 Web legal y consentimiento](02-web-legal-consentimiento.md)
3. [03 RGPD operativo](03-rgpd-operativo.md)
4. [04 Cumplimiento multi-tenant](04-multitenant-contratos.md)
5. [05 AI Act y transparencia](05-ai-act-transparencia.md)
6. [06 Verificación y release](06-verificacion-produccion.md)

La campaña 01 es bloqueante para definir textos legales y políticas de retención. Las campañas 02–05 pueden ejecutarse por superficies aisladas tras cerrar contratos de datos. La 06 integra todo.

## Invariantes
- LLM propone, sistema dispone; ejecución de derechos, borrados, permisos y consentimientos mediante código determinista y auditable.
- Deny-by-default, tenant isolation, idempotencia, control de acceso, mínimo privilegio, minimización de datos.
- No registrar tokens, cookies, transcripciones, PII ni prompts sensibles en logs o eventos.
- No usar cookies opcionales antes de consentimiento válido; rechazar debe ser tan sencillo como aceptar.
- No confundir hashes con anonimización irreversible.
- No hacer cambios en producción, merges a main, DNS, Google Cloud Console ni despliegues sin aprobación explícita.
- No inventar contratos, textos legales definitivos, categorías AI Act ni certificaciones.

## Contexto técnico a verificar, NO asumir
Monorepo pnpm: apps/web React/Vite; apps/server Node/TS; apps/worker Playwright; Postgres/Neon; OAuth Google; voice-v2; event bus; RAG, memoria, snapshots, backups. Rutas conocidas: `apps/server/src/oauth-login.ts`, `apps/server/src/google-auth.ts`, `apps/server/src/kernel/audit/entry.ts`, `apps/server/src/engine/voice-v2/coordinator.ts`, `apps/server/src/engine/events/retention.ts`. La documentación antigua puede ser legacy: siempre contrastar contra código y ramas actuales.

## Protocolo de agentes
1. Antes de cada campaña: inspeccionar main, rama de trabajo, PRs, árbol de archivos y tests; registrar SHA base y hallazgos reales.
2. Crear subrama de la campaña desde esta rama o trabajar en worktree aislado; no sobrescribir cambios de otros agentes.
3. Actualizar matriz, registro de decisiones, reporte de campaña y evidencias. Separar: verificado / inferido / pendiente / requiere fundador / requiere asesoría legal.
4. Ejecutar tests pertinentes, mostrar comandos, resultados y limitaciones. No falsear pruebas.
5. Reportar en chat al terminar cada campaña: archivos, commits, riesgos, bloqueos y siguiente campaña. Solicitar aprobación antes de integrar o desplegar.

## Documentación obligatoria
- [Matriz de requisitos](MATRIZ-REQUISITOS.md): control, fundamento, superficie, evidencia, owner y estado.
- `reports/CAMPANA-XX-REPORTE.md`: crear al ejecutar cada campaña.
- `evidence/`: pruebas sin PII ni secretos.
- `decisions/`: ADR de decisiones legales/técnicas.
- `inventario/`: proveedores, datos, cookies, flujos, retención y transferencias.

## Fuentes oficiales para contrastar
RGPD Reglamento (UE) 2016/679, artículos 5, 6, 12–22, 25, 28, 30, 32–35, 44 y siguientes; LSSI-CE art. 22.2; guía de cookies AEPD; Reglamento (UE) 2024/1689 (AI Act), especialmente transparencia art. 50, roles, casos de uso y cronograma vigente. Verificar actualizaciones legales antes de ejecutar.

## Anexo de implementación UI real
- [07 Mapa concreto de la interfaz, componentes y ubicación](07-UX-LEGAL-MAPA-INTERFAZ.md)
- [08 Copy exacto y enlaces legales](08-COPY-LEGAL-UX-Y-LINKS.md)
- Footer web implementado en `apps/site/index.html` en esta rama; cinco páginas HTML preliminares enlazadas. **NO DESPLEGAR** sin completar y revisar textos legales.
- App React: integración de enlaces en login/ajustes y panel de privacidad aún planificada, no implementada. Comparar ramas de UI más recientes antes de tocar `App.tsx`.

## Benchmark de estándar profesional
- [09 — Benchmark OpenAI, Meta, Gemini, Claude y Grok; 6 campañas complementarias C07–C12](09-BENCHMARK-ESTANDAR-PRO-OPENAI-META-GEMINI-CLAUDE-GROK.md)
- Principio: políticas públicas + controles reales en producto + evidencias verificables. Las campañas C07–C12 amplían, no reemplazan, las seis campañas originales.
