# Business Command Studio

Antes de editar, leer `docs/design/agntia-interface-standard.md` y la campaña en `docs/audits/2026-11-22-business-command-studio/` desde la raíz.

- Demo ACME exclusivamente. No importar APIs, auth tokens, servicios backend ni ejecutar comandos reales desde este directorio.
- La landing premium es la fuente visual. Reutilizar BrandMark/BrandLockup y fotografías originales, tokens opt-in y clases `bcs-`.
- Una sola selección/reloj/modelo para inspector, visualizador y timeline. No crear mocks inconexos por pestaña.
- El shell, chat, permisos y centro real siguen perteneciendo a App. No duplicarlos.
- Cualquier conexión futura requiere otra campaña y probar tenant, permisos, concurrencia, idempotencia y estados nativos antes de habilitar escrituras.
