# Trans04 — ejecución E-M1 en curso

Estado **PARTIAL_LOCAL**. Commit de código probado: `ca67a44214a4ad13bf5d7a684dca452dac4c2606`. No cierre de campaña, certificación C15, GO ni despliegue. Los originales y diagnósticos históricos permanecen intactos en sus ramas.

Cambios: identidad/escaping de series, copia de labels, validación numérica y límite de cardinalidad; cooldown de alertas durable y exclusión de evaluaciones simultáneas; captura del tenant autenticado tras middleware; sink kernel de cola acotada sin identificadores exportados; rechazo de bundles no escaneables y límite de lectura JSON; propagación de errores de lecturas autoritativas de provision; gate completo con commit, lockfile, logs y hashes; selección vacía del slice rechazada y smoke sin credenciales heredadas; backup de archivos por tenant con inventario, hashes y restore validado en staging con recuperación de raíces anteriores.

## Evidencia local

54/54 pruebas, cero fallos y cero skips sobre el commit indicado; typecheck raíz y worker con exit 0. Smoke autenticado sample: 1/1 paso, health, rechazo anónimo, login y acceso autorizado correctos. Control anterior `0de40ec1`: 9/9 regresiones fallan por los comportamientos corregidos. Gate C15 anterior acepta informe parcial inventado (NO_GO exit 1); corregido lo rechaza como NOT_RUN exit 2. Las fixtures del validador son sintéticas y no acreditan ejecución del gate general. Rutas y hashes de logs en EVIDENCIA.json; logs temporales requieren conservarse para revisión independiente.

## Composición y pendientes

P03 sink disponible, montaje y retirada por lifecycle pendientes del escritor Trans01; sin import global ni activación automática. P02 scope/exportación compartida y comparación de token pendientes; no se acredita aislamiento del exporter con este incremento. H02/H03, OTLP, dashboards/SLO y fuentes reales de cinco alertas en index pendientes; no sustituir ausencia por cero. P11 fencing de provision y carrera PG pendientes; no ejecutar apply real ni activar shared. Secrets GitHub-first/Supabase y CI pendientes. No se modificó deploy ni se enviaron secretos.

El backup es del árbol de archivos, no un snapshot transaccional de PostgreSQL. Backups históricos sin manifiesto verificable se rechazan explícitamente al restaurar. No hay prueba de caída de proceso durante swaps ni restauración productiva.

Reservas adicionales concretadas por coordinación local: scripts/verify-vertical-slice.ts (P13 selección vacía y smoke aislado) y nuevos tests/trans04-*.test.ts (incluido gate-evidence); no se modificó el test histórico tests/gate/gate-report.test.ts. El ledger de 48 bloques conserva PENDING hasta completar evidencias por bloque y revisión horizontal; los resultados focalizados no lo cierran.
