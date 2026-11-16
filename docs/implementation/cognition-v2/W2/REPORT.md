# W2 — Integración local y correcciones de revisión

Commit de código congelado: `13caec2f0ec47b859b9613965a9967c8ae64d418`.

REUTILIZAR: kernel/policy, Store, bus fuente, registry RAG y SDK hijo reales.
SUSTITUIR: flujo conversacional/contexto one-shot, captura Slow dependiente del padre y fallback Fast→Slow.
LEGACY TEMPORAL: camino V1 solo para tenants fuera de allowlist; no retirado como si ya hubiese migración.

Se implementó el recorrido HTTP autenticado de trabajo de análisis: memoria de trabajo→snapshot→job durable→Thought kernel+Card→journey→revocación. Dos empresas sintéticas no comparten referencias. El proyecto no ejecutó los cientos de patchsets íntegros; el alcance exacto y lo pendiente están en CAMPAIGN-STATUS.md.

Correcciones de revisión: conexión pgvector preservada; última revisión elegida antes de revoke; tombstones transitivos también al aplicar replay tardío; ACL antes de límite; scope coherente del sink; fencing también al registrar retry; ACK idempotente tras TTL; cancelación que aborta proveedor; eventos terminales al agotar intentos; circuitos por tenant sin contar cancelación; límite global de entrada/salida; Thoughts fuera del resolver público; objetos de provider separados; revalidación justo antes de dispatch y detección de revocación en vuelo; generaciones RAG y digest de contenido; actor activo fresco; commit incierto conservado como unknown con eventId.

El buffer ya enviado a un proveedor no se puede retirar retroactivamente. Los monitores abortan al detectar revocación; el estado final vuelve a validarse y no confirma resultados desautorizados. Eso no certifica cancelación física del proveedor ni playback Anam.

Typecheck y focos ejecutados constan en C15/EXECUTION-REPORT.md. Gate general iniciado en 24b4e8d: 818 tests, 801 PASS, 0 FAIL, 12 skipped, 5 TODO; 8/10 controles verdes. Solo bridges/contratos heredados bloquean el gate del repositorio. C15 conserva NO_GO; véase informe de ejecución para patchsets posteriores y evidencia focal.
