# Roadmap y campañas de ejecución

**Regla:** primero core funcional y estable. Este roadmap fija contratos anticipadamente; implementación externa después de gates del core. Cada campaña entrega reporte con SHA, archivos, pruebas, riesgos y siguientes dependencias. Cada campaña en rama propia; no merge a main sin aprobación.

| Campaña | Objetivo | Gate |
|---|---|---|
| UC-00 | Baseline: mapa de rutas, branches, stores, auth y tests | Inventario y baseline reproducible |
| UC-01 | ADR y contratos de thread activo, mensajes y surface context | Schemas Zod y tests de compatibilidad |
| UC-02 | Persistencia autoritativa server-side, migración | Append atómico, RLS, idempotencia |
| UC-03 | Active-thread pointer por tenant/user/scope | CAS, switch y nuevo chat verificados |
| UC-04 | Run lifecycle y event stream durable/replay | Reconexión sin pérdida ni duplicados |
| UC-05 | Migración useChat/useThreads y UI web | Dos pestañas misma conversación |
| UC-06 | SDK universal embebible con auth segura | Contract tests y aislamiento |
| UC-07 | Google OAuth/connector Gmail y Drive | Scopes mínimos y recursos autorizados |
| UC-08 | Google Workspace Add-on MVP | Gmail/Drive en hosts efectivamente soportados |
| UC-09 | Microsoft Graph y Outlook add-in | Mismo hilo y consentimientos |
| UC-10 | SOPs, aprobaciones, adjuntos y memoria | Acciones seguras y trazables |
| UC-11 | Observabilidad, seguridad, escalabilidad, RGPD | Gates de producción y revisión externa |

## Para cada campaña
1. Leer código HEAD real y documentación pertinente.
2. Registrar contratos públicos y compatibilidad interrepos.
3. Delimitar rutas de escritura para evitar conflictos con otras campañas.
4. Implementar y probar en entorno aislado.
5. Reportar tests verdes/rojos, errores, deuda, decisiones y evidencias.
6. Handoff de próxima campaña y criterios de aceptación.
7. Prohibidos merges, deploys y cambios de secretos sin aprobación.

## Dependencias
UC-00 -> UC-01 -> UC-02 -> UC-03/04 -> UC-05 -> UC-06 -> UC-07/09 -> UC-08/10 -> UC-11. No bloquear core con desarrollo de complementos.

## Métricas
Pérdida de mensajes = 0 en test de fallos; duplicación por reintento = 0; fuga cross-tenant = 0; convergencia tras reconexión medida; tiempos p95 de ACK/stream observables; porcentaje de runs reanudables; tasa de aprobaciones y rechazos.
