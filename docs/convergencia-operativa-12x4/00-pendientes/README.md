# 00 · Pendientes de ramas y coherencia transversal

Inventario preliminar basado en ramas observadas y documentos del 22–23 de noviembre. Recalcular HEAD, merge-base, diff, patch-id, PR y checks antes de cerrar. No es una auditoría exhaustiva de cada archivo.

| Ramas | Pendiente / decisión |
|---|---|
| campaign/c00-preflight, campaign/c01-arqueologia, docs/integracion-transversal-coherente-20261121 | Preservar inventario 651 commits, ledger, equivalencias, procedencia y criterios. Actualizar contra main. |
| campaign/c02-baseline-movil, fix/mobile-chat-sheet-keyboard-gestures, wip/mobile-chat-sheet, feat/mobile-chat-multimodal-ux | Proteger UX; no cerrar. Extraer solo requisitos de compatibilidad backend y repetir regresiones de hilo/cancelación. |
| campaign/c03-cognition | Preservar fail-closed RLS y 70/70 históricos; certificar Postgres con rol restringido. |
| campaign/c04-conversacion-universal | PR19, cancelación entre coordinadores, unref probable; comprobar CI global y persistencia. |
| feat/continuacion-c05-voz-cognition-v2 | Gate C05 histórico verde; montaje media lifecycle, leases distribuidos, cleanup, roles explícitos; P01 stubs, P02 selector, P03a bridge. |
| audit/c06-p03a-slow-observation-20261123 | 11/11 slow, HTTP 0/1 chat undefined. Investigar binding/factory; ownership receipt, Postgres real, revocación, P03b outbox, filtros anti-bucle, backpressure. |
| audit/cognition-v2-independent-20261123 | AG-UI bypass V2, acciones V1, RLS fail-closed, stubs externos, rutas legacy activas, worker salud no equivale a E2E. |
| feat/cognition-v2-runtime-C00-C15, feat/cognition-v2-stepwise-001-504c0b5b, feat/cognition-v2-worker-reliability-504c0b5b | Ancestros de main según informe histórico; confirmar y archivar. |
| feat/cognition-v2-W4-backfill, W5-outcomes, W6-jev-contract (prefijo feat/cognition-v2-) | Equivalencias históricas af3b16d, 812ea36, 403bc74; verificar semántica, no duplicar migraciones. |
| feat/voice-avatar-scaffold, feat/comunicaciones-telefono-v1 | Auditar contratos, rutas, permisos, proveedores y sesiones; extraer selectivamente, preservar UX. |
| feat/freebuff-compliance-integral, feat/legal-privacy-ai-compliance, release/landing-legal-20261122, release/public-site-legal-20261121 | Auditar backend legal, consentimientos, retención y privacidad; preservar landing/UX, procedencia de releases y obligaciones. No cerrar ramas mixtas hasta separar superficies. |
| docs/audit-30-dominios-runtime-20261115, audit/preflight-cognition-option3-20261115, audit/update-docs-20261118, docs/vigencia-2026-11-10 | Matriz de vigencia por contrato, reconciliar dominio/SOP/implementación. |
| docs/observability-dogfooding-audit-20261117, docs/audit-time-scheduler-mobile-push-20261122, docs/2026-11-17-universal-conversation, docs/doppler-auth | Extraer contratos de telemetría, scheduling, push, identidad, auth y conversación; verificar secretos sin leer valores. |
| docs/future-android-private-beta, docs/futuro-brainstorm-ux-disruptivo-20261121, docs/ui-runtime-generativa-branding-personalizacion-20261121, docs/design-system-agntiapro-master-20261122, docs/formacion-trabaja-con-laia-60-ejercicios, docs/ui-lab-agent-demo-guidance, docs/ui-lab-dashboard-catalog-20261123 | Protegidas por alcance UX/demo. |
| feat/agntia-demo-ui-lab-preview, feat/agntiapro-ui-lab, feat/business-command-studio-demo, feat/landing-premium-funnel, feat/public-landing-original-assets, feat/ui-conocimiento-notion-like-c01, feat/ui-lab-comunicaciones-whatsapp, feat/ui-lab-knowledge-notion-v1, feat/ui-lab-main-isolated, fix/ui-lab-centro-tailwind-landing-studio, fix/ui-lab-synthetic-all-previews, assets/generated-* | Protegidas. No merge ni cierre en esta campaña. |

## Protocolo de cierre
1. Enumerar todas las páginas de ramas y congelar SHAs.
2. Clasificar UX/demo, backend, mixtas, históricas, release y auditoría.
3. Por archivo y contrato: identificar equivalencia, conflicto, dependencia y destino. Registrar cherry-pick o reimplementación con pruebas.
4. Archivar SHA mediante referencia durable y conservar informes/PR; cerrar PR obsoleto solo tras reconciliación. No borrar ramas con trabajo no incorporado.
5. Certificar observabilidad, rollback y gates sobre árbol combinado. Cerrar ramas no protegidas tras verificar alcance y autorización de operaciones irreversibles.

Fuentes: docs/integracion-transversal-2026-11-21/07-ESTADO-Y-CIERRE-TRANSVERSAL.md; evidence/C06-CONVERGENCIA-BACKEND-COGNITION-KERNEL.md; docs/audits/c06-p03a-slow-observation-20261123/09-FINAL-REGRESSION-CI.md; docs/audits/cognition-v2-independent-20261123/00-EXECUTIVE-VERDICT.md. CI histórica no certifica HEAD actual.