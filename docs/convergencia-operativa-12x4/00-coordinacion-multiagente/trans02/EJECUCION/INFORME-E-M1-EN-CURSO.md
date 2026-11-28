# Trans02 · E-M1 en curso

Base `03c80b00`, implementación `69f1e9a8`. La campaña sigue abierta a integración y revisión independiente.

Se montó CognitionV2ChatAgent en la factory para tenants habilitados, conservando AGUI explícito. El contexto consulta candidatos ordenados por coincidencia y señales antes del límite, vincula la caché a presupuestos exactos y cuenta revisiones y revocaciones para detectar escrituras directas. La lectura valida digest, texto canónico, referencias y presupuesto. La generación usa conteos de tablas append-only y requiere medición a escala antes de certificación de rendimiento.

El circuito decide admisión antes de gastar cuota. Cancelar conserva fallos anteriores. Una inferencia remota incierta retiene su slot hasta expirar, según el contrato de campaña. Las autobiografías incluyen revisiones y política en su identidad. El grafo devuelve aristas únicas con extremos y revisiones vigentes. RAG usa identidad independiente del score y retira representaciones antiguas de la misma fuente.

Slow valida antes de guardar salida reutilizable. Una salida inválida termina en fallo. El campo aditivo opcional inferenceDependencies conserva las entradas completas, independientemente de las citas, y participa en autorización y revocación transitiva. El servidor lo deriva de las entradas del trabajo.

Verificación ejecutada con PGlite y proveedores simulados. Comando cognitivo y Trans02 combinado, 92 tests, 83 pass, 0 fail, 9 skipped. Typecheck completo del servidor y browser worker con pnpm 11.19.0 terminó con exit 0. Nueve regresiones nuevas cubren caché, presupuestos, revisión autobiográfica, cuota/cancelación, renderer manipulado, selección antes de LIMIT, grafo exacto, salida inválida y revocación de entradas no citadas. Se ejecutaron controles rojos contra la base en /tmp/trans02-red.log y /tmp/trans02-dependencies-red.log.

Pendientes de campaña completa: certificación PostgreSQL restringida y multiproceso, revisión externa, binding de voz con Trans03, telemetría y gate completo de Trans04, continuidad y skills con Trans05, wiring automático de observaciones con verificador real y contratos de receipt de cada familia. Las pruebas omitidas siguen sin acreditar aislamiento distribuido. La implementación actual no activa proveedores reales ni modo compartido.

Rollback mediante commits sucesores y desactivación de admisión/serving, conservando revisiones, tombstones, jobs, cuotas y receipts. No redespachar operaciones con resultado desconocido.
