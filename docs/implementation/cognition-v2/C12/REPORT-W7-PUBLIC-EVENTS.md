# C11/C12 W7 — Frontera pública de eventos después del checkpoint

Checkpoint de referencia: `734b687c3936e7157ee184410736a69049a605d9`. Corrige P1-02 sin alterar el resultado histórico de auditoría.

El proveedor y el runtime aplican una lista de eventos permitidos: TEXT_MESSAGE_START/CONTENT/END, con campos mínimos reconstruidos. No se reenvían reasoning, estado, custom, tools, rawEvent ni campos arbitrarios del proveedor. RUN_STARTED/FINISHED/ERROR públicos siguen perteneciendo al runtime. Un evento de texto inválido falla de forma controlada; las excepciones en el observer del cliente SDK terminan la inferencia en lugar de quedar como errores RxJS no manejados. No se pretende detectar semánticamente cualquier afirmación de un LLM dentro del texto.

Tests: helper rechaza eventos privados y metadatos, valida forma y rol; la regresión completa del chat inyecta reasoning/state/custom y rawEvent con un marcador sintético en diez ejecuciones, manteniendo el streaming de texto. TypeScript raíz+worker pasa.

Suite V2 ampliada: `node --import tsx --import ./tests/setup.ts --test --test-timeout=30000 --test-force-exit tests/cognition-v2-*.test.ts`, con Postgres local sintético configurado: 47 total, 47 pass, 0 fail, 0 skip, 0 cancelados, 0 todo; 131.659302 s. No inferencias externas ni llamadas a empresas reales.

Reproducciones ejecutadas otra vez: tres chat runs / tres delivery ACK y cero eventos REASONING_MESSAGE_CONTENT públicos (antes tres runs / un ACK y tres eventos privados). Ambos procesos devuelven 0. La auditoría/gate completa del checkpoint continúa atribuida a su SHA original; no se ha vuelto a ejecutar `pnpm test` completo ni `pnpm gate` sobre este patchset. C11/C12 siguen EN CURSO por paridad empresarial, carga/proveedores reales y UX integral pendientes.
