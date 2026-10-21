# -pendientes.md

Marca: MULTITENANT_PENDIENTES_V1

| ID | Fix | Causa | Desbloquea con | Fase |
|---|---|---|---|---|
| F00.1 | checksum fixes.md | Fase 0 no verifico hash | F01.14 + Get-FileHash | Fase 1 |
| F00.5 | 16 prohibidas | AUDIT_TENANT_DEFAULT.md sin lista | humano confirma lista | Fase 1 cond. |
| F00.6 | nombre paquete | apps/server/package.json puede no existir | Fase 0 M0.2 | Fase 9 |
| F00.7 | node_modules | puede no estar instalado | pnpm install raiz | Fase 9 |
| F01.5 | A.5 16 default | depende de F00.5 | F00.5 | Fase 1 cond. |
| F02.1-F02.4 | worker.ts | fichero roto | Copilot publica fix | Fase 2 ext. |
| F04.1 | clasificar 16 default | depende de F00.5 | F00.5 | Fase 5 |
| F04.7 | indice por prefijo | requiere EXPLAIN real | entorno con datos | Fase 8 |
| F04.8 | worker y DLQ | worker.ts roto | F02.1-F02.4 | Fase 6 |
| F04.9 | worker y DLQ | worker.ts roto | F02.1-F02.4 | Fase 6 |
| F05.2 | ejecutar E2E | tests congelados | reactivar tests | Fase 9 |
| F05.3 | ejecutar test CI | idem | reactivar tests | Fase 9 |
| F05.5 | ejecutar CI multi-tenant | idem | reactivar tests | Fase 9 |
