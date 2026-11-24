# 09 · Chat IA

Refinamiento visual conservador del chat, autorizado por el founder. **Ejecutado en la rama `feat/ui-lab-chat-ux-v2` como preview aislada de UI Lab**; no hay merge, deploy ni cambios en `apps/web`.

Preview: **Chat UX V2 · Refinamiento** (`?view=chat-ux-v2`), junto al chat original (`?view=chat`).

- [CAMPAÑA-EJECUCION.md](./CAMPAÑA-EJECUCION.md) — encargo y secuencia.
- [GUIA-MAESTRA-BRANDING-UX-V2.md](./GUIA-MAESTRA-BRANDING-UX-V2.md) — identidad y motion.
- [HANDOFF-REDISENO-PREMIUM.md](./HANDOFF-REDISENO-PREMIUM.md) — alcance vinculante y proceso.
- [PROMPT-MAESTRA-INTERFAZ-UX.md](./PROMPT-MAESTRA-INTERFAZ-UX.md) — límites de esta pantalla.
- [auditoria-baseline.md](./auditoria-baseline.md) — rutas, baseline, discrepancias y matriz.
- [direccion-visual.md](./direccion-visual.md) — tokens, tipografía, componentes y responsive.
- [storyboard.md](./storyboard.md) — entrada, transición, streaming y reduced motion.
- [patchset.md](./patchset.md) — archivos, reutilización, rollback.
- [matriz-paridad.md](./matriz-paridad.md) — control → handler → prueba y diferencias propuestas.
- [QA.md](./QA.md) — reproducción, 76/76 checks, evidencias y límites.
- [bitacora.md](./bitacora.md) — decisiones, comandos y bloqueos.
- [componentes-finales/](./componentes-finales/) — copia exacta de los componentes finales.
- [capturas/](./capturas/) — evidencias visuales.

Comandos: `pnpm --filter @agente/ui-lab dev` y abrir `http://localhost:5178/?view=chat-ux-v2`. QA: ver [QA.md](./QA.md). Artifact: `bash apps/ui-lab/qa/build-chat-ux-v2-artifact.sh`.

La captura fundacional (1366×599) muestra controles de texto/voz/vídeo que **no existen** en `main`; no se reconstruyen. El chat transversal, el menú y el shell quedan fuera de alcance.
