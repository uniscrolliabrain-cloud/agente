# Campañas secuenciales para Codex

Cada campaña requiere: branch aislada desde main actualizado, archivos y símbolos afectados, plan de patch, tests, diff, riesgos, evidencia y reporte en `docs/integracion-transversal-2026-11-21/evidence/CNN-REPORT.md`. Nunca fusionar ni desplegar automáticamente. Codex comunica cierre de campaña en chat antes de continuar.

## C00 — Preflight y snapshot
Capturar HEAD de main y de cada rama, PRs, tags, worktrees, CI, `git status`; identificar Fly/Vercel SHA real, origen del panel web y workflow de deploy. No imprimir secretos. Entregar `DEPLOY-PROVENANCE.md`. STOP si producción no tiene SHA verificable y se planea tocar el chat.

## C01 — Arqueología completa
Recorrer **todos** los commits accesibles, de reciente a antiguo, por ramas y merges; detectar cherry-picks, reverts, trabajo superseded y commits huérfanos alcanzables por refs. Completar matriz y patch ledger; clasificar documentos por vigencia. No asumir que el muestreo de 100 commits es exhaustivo.

## C02 — Baseline móvil
Revisar PR #16, comparar `fix/mobile-chat-sheet-keyboard-gestures` con main y SHA desplegado; ejecutar typecheck, test, Playwright móvil (Android viewport, teclado virtual, scroll, gestures, FAB oculto, composer, safe areas), auditoría de coherencia. Preparar PR de integración, sin merge sin aprobación. Preservar UX verificada.

## C03 — Kernel, tenant y Cognition
Verificar runtime V2 real en main, feature flag `COGNITION_V2_TENANTS`, fail-closed y RLS. Examinar W4/W5/W6 por patch y tests. Integrar solo mejoras ausentes; bloquear `business-write` hasta enlazar ActionService + approval. Pruebas de aislamiento y revocación.

## C04 — Conversación universal
Unificar threadId/agentId/actor/tenant entre texto, dictado, audio, vídeo y canales externos; quitar rutas de conversación paralelas. Revisar `conversation.ts`, `runtime.ts`, `provider.ts`, `context.ts`, `useChat.ts`, `api/chat.ts`, `threads-routes.ts`. Asegurar persona multiagente en V2, no LAIA hardcodeada salvo selección explícita.

## C05 — Reconciliar scaffold de voz
Extraer de `feat/voice-avatar-scaffold` perfiles de agentes, sesión y harness útiles. Rediseñar `voice/routes.ts` para auth bearer, permisos tenant, snapshots autorizados y thread persistente; no importar `voice/llm.ts` como motor independiente. Pruebas de sesión, concurrencia y cross-tenant.

## C06 — ElevenLabs y Anam reales
Verificar SDK y APIs vigentes; implementar montaje real de avatar, captura de audio, streaming STT/TTS, codecs compatibles, control de sesión, cierre remoto, reconexión y degradación. Probar sin proveedores usando mocks y con proveedores reales solo si hay claves y aprobación.

## C07 — Latencia, barge-in y receipts
Perfilar fast lane realtime sin saltar cuotas; abort de LLM+TTS+playback, fencing por epoch; ACK servidor separado de media played. Medir p50/p95 y presupuestos de latencia, fallbacks y timeout. Pruebas de cancelación y carreras.

## C08 — UX multimodal
Chat móvil y escritorio con iconos de conversación, micrófono, videoconferencia; permisos y estados de conexión; panel compatible con teclado y bottom sheet; una sola historia conversacional. Accesibilidad y pruebas de dispositivos.

## C09 — Documentación y ramas antiguas
Reconciliar `docs/2026-11-17-universal-conversation`, auditorías de avatar, C13, legal y observabilidad. Marcar legacy en registro central, añadir enlaces a superseding docs. Actualizar documentación de ramas antiguas solo mediante cambios explícitos y trazables, sin reescribir commits. No borrar ramas.

## C10 — Integración final y limpieza
Rebase o cherry-pick selectivo por PR, gates de CI, smoke API/web, revisión RLS, migraciones reversibles, permisos, build Docker, test de deploy. Producir `FINAL-READINESS.md`, listado de ramas candidatas a archivo/borrado y plan de rollback. Solicitar aprobación expresa para cada merge a main, deploy y eliminación de rama.

## Gate mínimo por campaña
`pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm test`, `pnpm audit:coherence` si existen en HEAD; adaptar comandos reales de package.json, nunca declarar éxito sin logs. Lint global: diferenciar fallos preexistentes de nuevos. Tests especializados por superficie. Entregar SHA, diffstat, cobertura relevante, riesgos abiertos, pruebas fallidas/skipped y decisión GO/NO_GO.
