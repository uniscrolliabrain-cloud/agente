<!-- MULTITENANT_PENDIENTES_V1 -->
# -pendientes.md - fixes bloqueados de la Campana 1

> Los 13 fixes que NO se pueden aplicar en la fase actual.
> Los misses de ejecucion van a missed/_multitenant_pendientes.md, no aqui.

| ID | Fix | Causa del bloqueo | Desbloquea con | Fase prevista |
|---|---|---|---|---|
| F00.1 | checksum fixes.md | Fase 0 no verifico el hash completo | F01.14 aplicado + Get-FileHash | Fase 1 |
| F00.5 | 16 prohibidas | AUDIT_TENANT_DEFAULT.md sin lista explicita verificada | humano confirma lista | Fase 1 (condicional) |
| F00.6 | nombre paquete | apps/server/package.json puede no existir | Fase 0 M0.2 | Fase 9 |
| F00.7 | node_modules | puede no estar instalado en apps/server | pnpm install raiz | Fase 9 |
| F01.5 | A.5 16 default | depende de F00.5 | F00.5 | Fase 1 (condicional) |
| F02.1-F02.4 | worker.ts | fichero roto, Copilot lo repara en otra rama | Copilot publica fix + pnpm typecheck verde | Fase 2 (extendida) |
| F04.1 | clasificar 16 default | depende de F00.5 | F00.5 | Fase 5 |
| F04.7 | indice por prefijo | requiere EXPLAIN real en Postgres prod-like | entorno con datos reales | Fase 8 |
| F04.8 | worker y DLQ con tenant | worker.ts roto | F02.1-F02.4 | Fase 6 |
| F04.9 | worker y DLQ con tenant | worker.ts roto | F02.1-F02.4 | Fase 6 |
| F05.2 | ejecutar E2E | tests congelados por instruccion | reactivar tests | Fase 9 |
| F05.3 | ejecutar test CI | idem | reactivar tests | Fase 9 |
| F05.5 | ejecutar CI multi-tenant | idem | reactivar tests | Fase 9 |

