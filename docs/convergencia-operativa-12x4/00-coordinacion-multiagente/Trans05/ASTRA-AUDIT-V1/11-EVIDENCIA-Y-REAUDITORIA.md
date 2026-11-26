# Evidencia ejecutada

Rama Trans05, revisión `1a70bbc2c6f78c49fe6b51ed18297f27a9822149`. Node 24.22.3 y pnpm 11.19.0, dependencias instaladas desde el lockfile congelado de esta rama.

```bash
ALLOW_NETWORK=0 corepack pnpm exec tsx --import ./tests/setup.ts --test --test-concurrency=1 --test-timeout=90000 --test-force-exit tests/cognition-v2-context-cache.test.ts tests/trans02-attention.test.ts tests/trans02-fast-revocation.test.ts
```

| Descubiertas | Aprobadas | Fallidas | Canceladas | Omitidas | TODO |
|---:|---:|---:|---:|---:|---:|
| 3 | 3 | 0 | 0 | 0 | 0 |

La selección se limita a los archivos del comando. Los circuitos completos de producción y la ejecución concurrente con dos conexiones Postgres quedan pendientes.

## Cobertura del selector de anclas

Revisión funcional `1a70bbc2c6f78c49fe6b51ed18297f27a9822149`. Experimento local en PGlite con los módulos reales CognitiveProjectionStore y ContextServingFacade. Se sembraron doce registros generales y una card nueva con el término exacto de la consulta en cada uno de dos tenants de control. Mismo actor, permisos, orden de inserción, señales y contenido. El id del ancla era la única diferencia relevante para el ranking. Se llamó a getSnapshot con maxRefs=1 y maxTokens=4000. La consulta de candidatos trae nueve filas ordenadas por latest.id.

| Id del ancla | Resoluble directamente | Ganador | Snapshot truncado |
|---|---|---|---|
| z-anchor | sí | m-0 | sí |
| a-anchor | sí | a-anchor | sí |

El resultado demuestra un sesgo de cobertura por id incluso para la card más nueva. Modificar el peso de relevancia dentro del scorer no puede recuperar una referencia ausente antes de ordenar. La prueba utiliza un término léxico controlado y un corpus pequeño. La evaluación de fidelidad en conversaciones de 100 000 tokens requiere el corpus profesional especificado en la campaña original. [Código del experimento](EXPERIMENTO-VENTANA-ANCLAS.md)
