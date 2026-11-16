# W5 — Familia outcome desde recibos reales del runtime

Estado: IMPLEMENTED_LOCAL, alcance limitado a trabajos cognitivos Slow. No certifica acciones empresariales ni proveedores.

Se añade `runtimeOutcome` tipado a las tarjetas: familia outcome, versión de ontología aprobada, alcance slow_cognition_job, estado terminal, fecha y referencia de recibo. Es una ruta determinista separada de las valoraciones semánticas propuestas. Slow/JEV no pueden crearla mediante sus DTOs ni mediante record.proposed.

El proyector verifica el evento persistido y su digest, ID/receiptId deterministas, emisor, identidad y estado terminal del job. Construye texto y título canónicos sin intervención de modelo. completed, failed y cancelled se mantienen distintos. Un trabajo completado solo acredita su estado de análisis, no cobros, envíos, aprobaciones ni ACK de entrega.

El runtime revalida el recibo al servir; no realiza inferencia ni escrituras en esa lectura. El grafo puede resolver la evidencia de recibo y ContextServing muestra el alcance verificado. Las memorias derivadas conservan la referencia/atribución y no heredan automáticamente certificación de una nueva síntesis; hipótesis siguen siendo hipótesis.

Pruebas: foco de resultados+ontología 6/6 PASS; suite V2 con Postgres 45/45 PASS, sin skip (129.937 s); foco posterior de memoria derivada/resultados 4/4 PASS. Typecheck raíz exit 0 después de usar el schema tipado de eventos. Se corrige un error inicial de inferencia de tipos de ZodTypeAny, sin casts para silenciarlo.

Casos: hipótesis y estado runtime independientes, evento terminal fabricado, título alterado, estado de job incoherente, fracaso/cancelación sin éxito ficticio, evidencia recuperable y ACK separado. Las pruebas no borran eventos de producto para superar inconsistencias; cada fixture usa un store sintético aislado.

Límites: los recibos de pagos, acciones empresariales y SOPs necesitan verificadores propios. La reconstrucción/verificación conserva dependencia del journal y del store autoritativo de jobs; su retención/backup debe gobernarse conjuntamente. No se declara reconstrucción desde el journal tras perder también el estado autoritativo. Continúan pendientes provider real, costes, RLS compartido global y certificación integral.
