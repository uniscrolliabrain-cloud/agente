# 06 — Auditoría de integración y plan de vigencia documental (2026-11-21)

> **Estado:** auditoría de revisión sobre GitHub, no certificación de ejecución local. Este documento complementa C00–C10; no sustituye los informes de Codex ni autoriza merges o despliegues. Validar de nuevo SHA y PR antes de ejecutar.

## Hallazgos comprobados
- La rama de coordinación está separada de main y contiene inventario, campañas y handoff.
- `campaign/c02-baseline-movil` añade 23 commits sobre main, con `C02-REPORT.md`; PR #17 según el reporte. El reporte atribuye 874 tests aprobados, 0 fallos, 21 omitidos y 5 TODO, typechecks, Playwright/CDP. **No reejecutados en esta auditoría**.
- `campaign/c03-cognition` añade 1 commit, reporte C03 y test HTTP; PR #18 según reporte. W4/W5/W6 se consideran equivalentes ya integrados; la certificación de RLS compartida sigue pendiente y la escritura V2 no debe saltarse ActionService/aprobaciones.
- `feat/mobile-chat-multimodal-ux` añade 25 commits sobre main, incluyendo audio local, llamadas simuladas y demo de vídeo; no es backend real ni persistencia de medios.
- `feat/voice-avatar-scaffold` está desfasada respecto de main (11 commits propios, 65 de main posteriores en comparación observada). Su `voice/harness.ts` reutiliza ConversationAgent, pero `useAvatarCall.ts` mantiene historial en memoria y no prueba persistencia transversal. Rescatar por patches, nunca merge indiscriminado.
- `docs/2026-11-17-universal-conversation` documenta doble semántica threads/conversations, escrituras de lista completa desde frontend y riesgos de concurrencia. Es especificación/diagnóstico, no implementación validada.
- La documentación de coordinación indica C01 en curso y C04–C10 pendientes. No afirmar integración transversal terminada ni que todo está en main.

## Recomendaciones de arquitectura y secuencia
1. Mantener C04 **primero** como contrato único de tenant/actor/agentId/threadId/runId, permisos, mensajes, media y eventos. Resolver concurrencia y persistencia antes de conectar proveedores. Sin segundo ConversationAgent, sin segundo historial de voz.
2. C05: recuperar perfiles, sesiones y adaptadores del scaffold tras revisar auth, tenant, expiración, revocación, thread real y estados. No reutilizar Vapi como wake-word ni un LLM directo que omita kernel.
3. Adelantar **la reconciliación de UX C08 (contratos y componentes)** antes de activar C06–C07. Mantener funcionalidades demo claramente etiquetadas, con feature flags y sin prometer llamadas reales. Finalizar pruebas de UX tras conectar proveedores.
4. C06–C07: STT/TTS, Anam, credenciales efímeras, barge-in de LLM+TTS+playback, reconexión, cuotas, p50/p95, estados terminales y limpieza de pistas. Distinguir transcript recibido, ACK del servidor y audio efectivamente reproducido.
5. Integrar mediante PRs pequeños y aprobados, con gates, sin macro-merge final. C10 debe cerrar trazabilidad, pruebas, rollback y limpieza documental, no acumular todo el código para el final.
6. Gate transversal obligatorio: texto → voz → vídeo → texto en **el mismo thread**, con tenant, identidad, actor, roles, auditoría y permisos coherentes. Tests negativos cross-tenant, revocación en caliente, doble envío, interrupción, cierre y reintento.
7. El futuro «Hey Laia» debe ser una capa posterior y separada: toggle por usuario/dispositivo, detección local con permisos y control de disponibilidad, VoiceSessionCoordinator que usa el thread común, y registro de comandos versionados vinculado a SOP/Policy/ActionService. No confundir dictado, conversación bidireccional y wake-word; nunca entrenar comandos para ejecutar writes sin autorización.

## Campaña obligatoria de actualización documental en main (añadir a C09 y C10)
**Objetivo:** que el árbol documental que termina en main refleje el código realmente fusionado, sin perder la historia ni borrar información útil.

### Fase D00 — Inventario y clasificación
- Enumerar **todos los .md y referencias de docs** de main y ramas fuente; indexar path, título, fecha, branch/commit origen, owner funcional, código/contrato referido, enlaces, y última validación contra HEAD.
- Clasificar por archivo: `CURRENT` (verificado en HEAD), `PARTIAL` (mezcla de vigente y legacy), `SUPERSEDED` (sustituido), `HISTORICAL` (registro), `PROPOSAL` (diseño futuro), `UNKNOWN` (pendiente).
- Registrar las evidencias en `docs/integracion-transversal-2026-11-21/evidence/DOCS-VIGENCIA-MATRIX.md` y una tabla de redirecciones old→new. Nunca inferir vigencia solo por fecha o título.

### Fase D01 — Cabecera visible arriba de cada documento afectado
Insertar **inmediatamente debajo del H1**, o al inicio si no hay H1, un bloque de vigencia; preservar íntegro el cuerpo histórico salvo correcciones explícitas verificadas:

```md
> **Estado documental:** CURRENT | PARTIAL | SUPERSEDED | HISTORICAL | PROPOSAL | UNKNOWN
> **Revisado contra:** `main@<SHA>` — AAAA-MM-DD
> **Alcance:** [qué partes siguen vigentes y cuáles no]
> **Fuente canónica actual:** [ruta relativa o enlace al documento sustituto]
> **Evidencia:** [tests, rutas de código, PR/commit o informe]
> **Pendiente:** [si aplica; no afirmar validaciones no ejecutadas]
```

- En `SUPERSEDED`, poner aviso destacado **antes** del texto antiguo y enlace al sucesor; no eliminar contenido.
- En `PARTIAL`, enumerar secciones obsoletas por encabezado y enlaces a sustitutos.
- En `CURRENT`, enlazar SHA verificable y contrato real; no etiquetar CURRENT por intuición.
- No insertar encabezados mecánicos en miles de archivos sin revisión: hacerlo por lotes por dominio, con reporte y revisión de diffs.
- No editar ramas históricas para fingir que su código es nuevo. Preferir actualización en rama de integración con trazabilidad, luego PR a main.

### Fase D02 — Canonicidad e índices
- Crear/actualizar `docs/README.md` como **índice canónico** por dominios (kernel, cognition, conversación, UX móvil, voz, Anam/ElevenLabs, SOP, tenant/RLS, compliance, observabilidad, despliegue).
- Enlazar los ADRs vigentes, handoffs y matrices. Distinguir **implementado**, **probado**, **pendiente**, **experimental** y **retirado**.
- Revisar especialmente `docs/implementation/cognition-v2/`, `docs/audits/mobile-chat-sheet/`, `docs/08-auditorias/`, `docs/2026-11-17-Agencia-Pro-Universal-Conversation/`, docs legales, observabilidad y runbooks de deploy.
- Verificar referencias internas, rutas de código, comandos pnpm, flags, env vars **solo nombres**, endpoints y claims de pruebas. No copiar secretos.

### Fase D03 — Automatización y gate
- Añadir checker de enlaces relativos y cabeceras de vigencia para **documentos modificados** en PR; no bloquear por deuda histórica hasta crear baseline de excepciones.
- Generar `DOCS-CHANGELOG.md` con docs revisados por campaña, SHA de código fuente, razón y reviewer; actualizarlo con cada merge que cambie contratos.
- Checklist PR obligatorio: ¿cambió API/UX/contrato/flag? → actualizar doc canónica + encabezados de documentos impactados + índice.
- Pruebas: enlaces locales, paths existentes, Markdown lint donde sea viable, referencias de rutas y checks de no-secrets.
- Entregar `evidence/C09-DOCS-REPORT.md`: recuentos por estado, archivos revisados, archivos pendientes, diffstat, enlaces rotos, SHA, tests y GO/NO_GO.

### Fase D04 — Merge aprobado
- Los cambios documentales destinados a main deben viajar en PR revisable desde una rama basada en main actualizado. No modificar main directamente ni desplegar.
- Antes de merge: rebase, volver a calcular estado contra el HEAD final, revisar colisiones con documentación escrita por otros agentes, pasar checks y pedir aprobación.
- Después del merge aprobado: verificar `docs/README.md`, encabezados y enlaces en main; no declarar docs actualizadas si solo están en una rama.

## Handoff Codex
Leer este archivo junto con `03-CAMPANAS-CODEX.md` y `05-INFORME-POR-RAMA.md`. Incorporar D00–D04 a C09/C10 y empezar inventario de docs **en paralelo con C04**, para que no se acumule al final. No sobrescribir reportes de campañas ajenas. Reportar cada lote con SHA, rutas exactas, evidencia y cambios; STOP ante conflicto con trabajo en curso o producción no verificable. Ningún merge, despliegue o borrado sin aprobación del owner.
