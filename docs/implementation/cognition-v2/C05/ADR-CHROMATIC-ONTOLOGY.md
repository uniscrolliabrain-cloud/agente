# ADR — Ontología cromática pendiente de decisión del fundador

Estado: BLOCKED_DECISION. No cambia ADR-009 ni aprueba semántica.

Evidencia: kernel/cromos/cromo.ts declara cinco tipos (logic, physics, intent, memory, policy). FUTURE.md describe dos polos por cromo. NC-COORDINATION/CONTRACT-CANDIDATES.md propone seis polaridades y diez dimensiones todavía sin definir. No son taxonomías equivalentes.

Implementación revisable: registro versionado, validación numérica finita, checksum e identidad de recibo aprobado verificado por un puerto autoritativo. No hay endpoint para que un modelo se autoapruebe; el registro no es usado por el kernel ni está activado.

Para aprobar una ontología concreta hace falta un documento con: nombres y significados de las seis polaridades, relación con los polos opuestos, nombres/escalas de las diez dimensiones, ejemplos positivos/negativos, tratamiento de desconocidos, reglas de interacción y migración de los cinco tipos legacy. La alternativa de conservar solo los cinco tipos también necesita confirmación explícita; no se asume.

Hasta esa decisión: ningún dato de tenant recibe una interpretación cromática. Atención/contexto continúan sin este motor. A12 y aceptación integral C15 permanecen bloqueados.
