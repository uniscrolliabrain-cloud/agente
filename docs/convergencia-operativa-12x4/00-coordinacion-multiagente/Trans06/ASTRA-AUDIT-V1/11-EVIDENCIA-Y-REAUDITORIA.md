# Evidencia ejecutada y límites de la primera pasada

Código auditado en `5ccddc7d1d05f0a89257e0638b9cadfce2998081`. Ejecución local con Node 24.22.3 y pnpm 11.19.0. Instalación con `--frozen-lockfile`. Las pruebas se ejecutaron con `ALLOW_NETWORK=0` y el setup del repositorio.

```bash
ALLOW_NETWORK=0 corepack pnpm exec tsx --import ./tests/setup.ts --test --test-timeout=30000 --test-force-exit tests/cognition-v2-ontology.test.ts tests/kernel-meta-context.test.ts tests/audit-bridge-integration.test.ts
```

Resultado del runner. Ocho pruebas aprobadas, cero fallidas, omitidas o pendientes. Exit 0.

| Archivo | Evidencia |
|---|---|
| `tests/audit-bridge-integration.test.ts` | Un montaje real de los bridges en la aplicación de prueba proyecta auditoría, notificaciones y métricas y crea un turno a partir del bus. Incluye registro repetido de listeners. |
| `tests/cognition-v2-ontology.test.ts` | Vocabulario de ocho familias con seis polos independientes y anulables. Aprobación persistente y revocable. Desacuerdo explícito. Cards de Slow, estabilidad en replay, contexto compacto y ocultación de derivados tras revocación. |
| `tests/kernel-meta-context.test.ts` | Cuatro casos de clasificación de progreso de Slow. Evidencia unitaria sobre los hints de Meta. |

Estas pruebas no cubren concurrencia real en Postgres, autorización de operaciones empresariales, rutas completas de Fast ni comportamiento de proveedores. El resultado de replay de cards no alcanza por sí solo el replay de cualquier escritura disparada por el bus. La revisión de propuestas todavía requiere contrastar el comportamiento en cada punto de montaje.
