# W11 — Primer adaptador empresarial V2

Base `22311de`. `CognitionBusinessRead` es un puerto interno **no montado** en HTTP, chat o workers. Admite exclusivamente `read_workspace` con input vacío, actor humano activo, identidad/tenant/policy revisados dos veces, PDP real explícito `read/project`, contrato V1 de bajo riesgo y único efecto de lectura workspace. Reutiliza `CapabilityRunner` y fija el contrato comprobado. El receipt scoped registra started/completed/unknown, sin entrada ni respuesta privada; un retry concurrente o con resultado incierto no ejecuta de nuevo.

No está conectado a la aplicación: se requieren resolvers de identidad/actor y PDP confiables de servidor, y el adaptador no devuelve el resultado de la lectura. El contrato V1 por sí solo no garantiza aislamiento real de Workspace; la prueba usa executor sintético. Tampoco implementa aprobación, SOP, capability mutante, recuperación manual de resultados inciertos ni paridad empresarial completa. V2 mantiene `tools: []` y el estado C15 NO_GO. La autorización del PDP se comprueba al dispatch, no prueba atomicidad frente a revocación externa concurrente.

Prueba: `tests/cognition-v2-business-read.test.ts` con PostgreSQL 17.9 sintético local: 3/3 PASS, 0 omitidas. Incluye PDP sin allow, actor inactivo, cambio de policy antes de ejecutar, input/otras capacidades rechazadas, receipts aislados, ejecución única con dos conexiones y fallo desconocido sin retry. `tsc --noEmit`: PASS; primer intento agotó el límite de 120 s sin salida y el segundo terminó en 47.9 s con exit 0.

Sin proveedor, datos reales, merge ni despliegue. No sustituye el flujo real de aprobaciones ni justifica activar el adaptador.
