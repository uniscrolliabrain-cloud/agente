# Trans01 · E-M1 en curso

Base común `7535917e`. Seis commits funcionales revisables hasta `56d038a2`. La campaña sigue abierta. El registro de 48 bloques conserva pendientes los cierres integrales y las revisiones independientes.

Se corrigieron reserva del probe, clasificación 422 y respuesta tardía del cortacircuitos, decisión humana independiente del resultado externo, atomicidad de acción e intento, conciliación de receipt tardío, lease durable renovable, ancla y entrada de auditoría atómicas, verificación por identidad de toda la cadena, identidad inmutable del pensamiento y revalidación de quiescencia. El servicio conserva un único camino de recuperación y los intentos inciertos nunca se reenvían.

La última regresión anterior al cambio de quiescencia finalizó con 139 tests, 137 pass, 0 fail y 2 skipped. Incluye las suites Trans01, actions, deferred-actions, persistence y kernel. La prueba focal de quiescencia posterior también pasó. TypeScript root compiló sin diagnósticos. Se ejecutaron controles rojos contra I0 para breaker, auditoría, identidad de pensamiento y recuperación activa, además del control de decisión humana previo al arreglo. Los digests locales constan en EVIDENCIA.json.

Backend PGlite y proveedores simulados. La prueba de lease utiliza dos instancias de servicio sobre el mismo almacén, aún falta la certificación PostgreSQL restringida en procesos separados. La revisión externa sigue pendiente.

Sigue pendiente la composición con factory/receipts/telemetría de Trans02–04, la matriz completa por operación y los gates globales sobre integración. Las fases de owner y proveedores reales requieren sus permisos y configuración específicos. Este informe permite revisión simultánea y no declara cierre de campaña ni B2 conjunto.

Rollback por commits sucesores, deteniendo primero nuevas admisiones. Conservar acciones, decisiones, intentos, leases y auditoría. Reconciliar resultados desconocidos y mantener sus IDs.
