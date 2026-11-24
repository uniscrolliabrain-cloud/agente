# Bitácora — Campaña Chat UX V2

| Fecha | Revisión | Agente | Archivos | Decisión | Prueba | Resultado | Bloqueo | Siguiente acción |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-11-24 | `6e1512c` | Buffy | `docs/dashboards/09-chat/*` | Leer campaña, handoff, guía, componentes reales y propuestos | `diff` snapshot vs activo | 7/7 componentes idénticos | — | Crear rama de campaña |
| 2026-11-24 | `6e1512c` | Buffy | `src/chat-ux-v2/*`, `registry.tsx` | Preview aislada con compositor estable y fixture sin red | `pnpm typecheck` | PASS | pnpm no instalado; se instaló 11.19.0 en `$HOME/.local` | Build |
| 2026-11-24 | `6e1512c` | Buffy | CSS, componentes, fuente local | Tokens, container queries, motion contenido, Manrope offline | `pnpm build` | PASS | Chromium sin libs ni fuentes del sistema; se instalaron libs locales y DejaVu/FONTCONFIG para QA | QA |
| 2026-11-24 | `6e1512c` | Buffy | `qa/chat-ux-v2.qa.mjs` | QA Playwright 1.62.1 con 8 viewports, 3 contenedores y estados | ejecución local | 75/75 PASS tras corregir expectativas de pruebas | — | Revisión visual |
| 2026-11-24 | `6e1512c` | Buffy | CSS | Ajuste de titular móvil 30 px, fade inferior y medición FLIP | QA + capturas | 76/76 PASS | — | Documentar y empaquetar |
| 2026-11-24 | `6e1512c` | Buffy | docs, artifact, workflow | Cierre de campaña sin merge ni deploy | typecheck/build/QA/verify ZIP | Pendiente de registro final | — | Aprobación del founder |

## Registro de decisiones

1. La campaña se ejecuta **solo en UI Lab**; `apps/web` no se toca. El chat original permanece accesible.
2. Se copian únicamente los componentes que necesitan adaptador de fixture o cambio visual profundo; chips, herramientas, adjunto, espiral, typewriter y reduced motion se importan del código real.
3. La fixture reproduce la API de `useChat` y no hace red. Los estados «error» y «cancelado» internos se conservan aunque el panel no los pinte, para mantener paridad y documentar la deuda.
4. El compositor se mantiene montado entre portada y conversación; el movimiento se resuelve con FLIP y no con un remount.
5. Se añade Manrope local para que el artifact funcione sin Internet; el marco del UI Lab puede usar fallback.
6. Playwright se fija en `1.62.1` para que el QA sea reproducible y no dependa de una versión global.

## Entorno (no forma parte del repositorio)

- Node 26.13.1, pnpm 11.19.0, Python 3.12.3.
- Sin root: Playwright Chromium requirió extraer libs de Ubuntu Noble en `$HOME/.chromium-libs` y configurar `FONTCONFIG_FILE` con DejaVu. En CI/equipos normales basta `playwright install --with-deps chromium`.
- El servidor de preview se sirvió en `127.0.0.1:4173`. El servidor de artifact usa `127.0.0.1:8080`.

## Cierre

- **Implementado:** preview `chat-ux-v2` registrada, fixture, CSS, documentación y QA.
- **Probado:** typecheck, build y 76/76 checks automatizados; inspección visual de capturas.
- **Publicado:** no. Sin merge, sin push a main, sin Vercel.
- **Aprobado:** no. Requiere revisión visual y aprobación del founder.
- **Artifact:** `chat-ux-v2-chromebook.zip`, generado desde la revisión de la rama; su SHA256 se registra en el cierre de la entrega.
