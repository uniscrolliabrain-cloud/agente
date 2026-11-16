# Revisión independiente local

Se realizaron dos pasadas independientes sobre las fuentes y reproducciones en PGlite, sin confiar en los informes de implementación. La segunda revisión final verificó `b8b99fc` más los fixes incorporados en `738a576`.

Hallazgos corregidos y reverificados con exit 0:

1. Contexto revocado durante la admisión: el proveedor no es invocado; termina RUN_ERROR.
2. Usuario inactivo con membership conservada: serving y dispatch denegados.
3. Reingesta RAG con revisión externa idéntica: la referencia antigua deja de ser válida.
4. Hit de una generación antigua frente al registry nuevo: se excluye y señala degraded.
5. COMMIT confirmado con ACK perdido: eventId conservado, commitOutcome=unknown; nunca se afirma rollback.

Pasadas anteriores también detectaron revocación tardía transitiva, publicación live antes del commit, cancelación sin abort real, fallo terminal sin evento y circuito compartido que contaba cancelaciones. Los tests faults/receipts más los focos de Postgres cubren estos límites.

Scripts independientes de reproducción, conservados en el entorno: `/tmp/cognition-review-admission-revoke.ts`, `rag-version.ts`, `rag-ingest-race.ts`, `unknown-commit.ts`. Los resultados se agregan como evidencia local, no como certificación externa. El nuevo adapter Cyber→contexto tiene prueba de integración separada; no se afirma revisión independiente exhaustiva de todas las superficies.

No quedan abiertos los P1 de esas reproducciones. Esto no demuestra RLS shared con rol restringido, seguridad de proveedores, acceso real a Cyber, cancelación audiovisual física ni aceptación C00–C15. Permanecen NO_GO los gates de CAMPAIGN-STATUS.md.
