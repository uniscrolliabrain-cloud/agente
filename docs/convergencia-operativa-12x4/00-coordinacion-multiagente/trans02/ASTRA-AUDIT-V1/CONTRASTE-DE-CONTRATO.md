# Reconstrucción de contexto para Fast

Revisión de partida `89c5925d7a30e70ff41cd81539408d8b0282b92c`. Superficie auditada `apps/server/src/engine/cognition/v2/context.ts`, blob `84d17ebc6eec8da95eb798568658332e71928924`. Símbolos examinados: ContextServingFacade.getSnapshot y readSnapshot. [Especificación original](../REDISENO-FINAL-P01-P14.md)

## Propuesta original y código actual

P02 propone cotejar refs ordenadas, digest y contenido seleccionado. readSnapshot comprueba identidad, expiración y que cada referencia sea resoluble. getSnapshot construye los segmentos de texto y calcula digest en el momento de escritura.

## Diagnóstico

Una referencia válida demuestra que la revisión sigue visible, pero la implementación devuelve los segmentos almacenados sin volver a derivarlos. La disponibilidad de la fuente y la correspondencia del texto son dos obligaciones independientes.

## Decisión propuesta

SIMPLIFICAR P02. Extraer del ensamblado existente una función pura de representación por versión. Crear y recuperar snapshots con el mismo serializador. Ante una referencia obsoleta, invalidar el snapshot completo y pedir uno nuevo mientras el stream aún no haya comenzado.

## Contrato e invariantes

Fijar versión del serializador, orden de referencias, scope, revisión de política, versión de ontología y presupuesto. Recalcular cada segmento a partir de la revisión visible y aplicar el límite sobre el resultado real. Una revisión histórica no se entrega después de supersesión.

## Prueba discriminante pendiente

Usar un registro corregido entre preparación y lectura. Comprobar que el contenido retirado desaparece incluso si los metadatos del snapshot anterior se pueden leer. Medir consultas por referencia con fan-in compartido y validar que el caché por request se invalide por cambio de política.

## Compatibilidad y rollback

Versionar la representación, expirar snapshots legacy por su TTL y conservar el ledger existente. Durante la transición, regenerar por versión admitida. Ante error de lectura o versión desconocida, continuar con contexto mínimo autorizado.
