# Ejecución C00 — baseline congelado

Fuente: main `54b8d5407a8576459448c4d059a877297d18ca7a`; worktree aislado `/tmp/agente-cognition-v2-baseline`. Instalación frozen-lockfile exit 0. Node v24.22.1; pnpm disponible 11.25.0, pin declarado 11.19.0.

- Typecheck raíz/worker: exit 0.
- `pnpm test` del baseline: exit 1, **790 tests, 772 pass, 0 fail, 1 cancelled por timeout de 30 s, 12 skip, 5 todo**. El foco afectado es `tests/laia-hierarchy.test.ts`; se reejecutó aisladamente sobre el baseline con exit 0 (1 pass). No se convierte el timeout en PASS de toda la suite.
- `gate --only` de las siete auditorías del baseline: exit 1. Cinco verdes; fallan bridges (12/16, cuatro marcas legacy) y contracts (seis contratos sin uso/decisión). Se conserva evidencia para compararla con la implementación.
- `test:browser` del baseline: exit 1, DNS_UNAVAILABLE para httpbin donde el test esperaba NAVIGATION_FAILED. El mismo fallo ocurre en la implementación; no se ocultó cambiando el test ni debilitando el control de red.
- Primera tanda en sandbox: tsx no pudo abrir su pipe local (EPERM). Se reejecutó con permiso para sockets locales. La lectura web de un worktree con dependencias compartidas produjo un fallo ambiental de pnpm/SQLite; las dependencias de los dos worktrees se separaron antes de continuar. Los resultados web de implementación se obtuvieron después con su compilador real y build correcto.

Resultados crudos por comando: `../C15/evidence/BASELINE-COMMANDS.json`; logs completos del baseline bajo `/tmp/cognition-v2-baseline-frozen/`, `/tmp/cognition-baseline-audits.log`, `/tmp/cognition-baseline-browser.log` y `/tmp/cognition-baseline-laia-focus.log`.

El inventario y el callgraph corresponden a las superficies inspeccionadas; no se declara auditoría exhaustiva de todas las rutas ni proveedores. La clasificación REUTILIZAR/SUSTITUIR/LEGACY TEMPORAL precedió a los cambios profundos. C00 permanece PARTIAL_BASELINE hasta cerrar el resto de sus gates operacionales.
