# 04 - Informe de auditorias

Se invocaron directamente los seis scripts que ejecuta el job `unit` de CI. Los scripts existentes escriben los reportes sin procesar en `docs/`.

| Auditoria | Resultado | Observacion |
|---|---|---|
| `audit:layers` | PASS | 0 violaciones |
| `audit:bridges` | PASS | 16/16 wired |
| `audit:console` | PASS | 21 ocurrencias en 206 ficheros; el script reporta, no bloquea por cantidad |
| `audit:tenant-default` | FAIL | 458 ficheros, 60 permitidas, 16 prohibidas |
| `audit:idempotency` | FAIL | 1.400 marcas; 90 duplicadas, 10 huerfanas, 67 repetidas |
| `audit:contracts` | FAIL | 250 contratos: 82 OK, 14 pending, 154 huerfanos |

**Gates globales:** 3 pasan, 3 fallan. `audit:coherence` retorna fallo por estos findings.

## Reportes generados por los scripts

- [Layers](../../AUDIT_LAYERS.md)
- [Bridges](../../AUDIT_BRIDGES.md)
- [Console](../../AUDIT_CONSOLE.md)
- [Tenant default](../../AUDIT_TENANT_DEFAULT.md)
- [Idempotency](../../AUDIT_IDEMPOTENCY.md)
- [Contracts](../../AUDIT_CONTRACTS.md)

Los reportes de tenant-default, idempotency y contracts fueron regenerados con el checkout presente. El antiguo `AUDIT_TENANT_DEFAULT.md` de HEAD tenia 324 ficheros revisados y 2 findings; el nuevo recorre 458 ficheros y da 16. Revisar los 16 antes de clasificar falsos positivos o aceptar el gate.
