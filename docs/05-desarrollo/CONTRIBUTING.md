# Contribuir a OpenMuse

> v2 · 2026-10-27 · Estado: current

## Antes de empezar

1. **Leer el código real**: el código es la fuente de verdad. Los docs pueden estar desactualizados.
2. **Leer `docs/05-desarrollo/PROTOCOLO.md`**: protocolo de trabajo (ledger, idempotencia, verificación, PowerShell seguro).
3. **Comprobar idempotencia**: si un cambio tiene marca `XXX_V1`, no reaplicar.
4. **No commitear sin aprobación humana**: `git add`, `git commit`, `git push` los decide el humano.

## Flujo de trabajo

1. Crea una rama desde `main` o desde la rama de campaña activa.
2. Lee el fichero real antes de escribir.
3. Aplica el cambio (quirúrgico o reescritura completa).
4. Ejecuta `pnpm typecheck` y `pnpm test` para verificar.
5. No apilar 20 bloques sin verificar. Un fix, un typecheck.
6. Si algo falla, parar y preguntar. No apilar parches sobre parches.

## Reglas para IAs (PowerShell seguro)

- Un bloque PowerShell por patchset. Sin `&&` ni `;` como separador. Sin `exit`. Sin `Move-Item` para escribir.
- `Assert-MatchCount` antes de `.Replace()`.
- `File.Replace` con `try/catch` y fallback a `Copy-Item`.
- Backup en `.tmp/patchset-backups/`.
- Distinguir errores de `worker.ts` (preexistentes) de nuevos. Si hay nuevo, revertir.
- No tocar `worker.ts`, `service.ts`, `conversation.ts`, `tests/*`, `_multitenant_pendientes.md`.
- No commitear, no `git add`, no `git push`.

## Documentación

Cada cambio de código debe ir acompañado de la actualización o creación del doc correspondiente en `docs/`. Un doc viejo no se corrige: se archiva y se escribe el nuevo (v2 con cabecera `> vN · YYYY-MM-DD · Estado: current|draft|archived`).

## Áreas fuera de alcance para contribuciones externas

- `llm-usage`, coste, cuota, `model-chain.ts`, `planner/**`, `execution/**`: pertenecen a la campaña de Codex (F2/F6).
- `packages/workspaces/**` y `apps/web/src/workspaces/**`: 524 docs internos, fuera de alcance de la campaña de documentación actual.

## Reportar problemas

Si encuentras una contradicción entre un doc y el código, abre una issue con:
1. La ruta del doc y la línea.
2. La ruta del código y la línea que contradice.
3. La pregunta exacta que necesita resolverse.
