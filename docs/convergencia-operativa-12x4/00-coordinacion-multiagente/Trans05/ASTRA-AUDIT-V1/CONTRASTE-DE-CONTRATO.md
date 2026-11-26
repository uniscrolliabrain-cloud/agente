# Recuperación de anclas y licencias narrativas

Revisión de partida `1a70bbc2c6f78c49fe6b51ed18297f27a9822149`. Superficie auditada `apps/server/src/engine/cognition/v2/context.ts`, blob `84d17ebc6eec8da95eb798568658332e71928924`. Símbolos examinados: ContextServingFacade.getSnapshot y resolve. [Especificación original](../P10-COMPILADOR-DE-SKILLS-NARRATIVAS.md)

## Propuesta original y código actual

P10 exige revisiones de fuente, derechos de uso y retiro de derivados. Trans05 comparte la revisión de código de contexto de Trans02. El selector carga un conjunto reciente acotado antes de aplicar el ranking.

## Diagnóstico

Un ancla antigua fuera de la ventana no participa en el ranking, independientemente de su relevancia. Subir su puntuación solo cambia el orden entre los candidatos ya recuperados. El brief puede retener prosa caducada incluso después de una corrección.

## Decisión propuesta

MEJORAR la recuperación anterior al ranking. Aceptar referencias de ancla en el ámbito del hilo, cargarlas por id/revisión mediante resolve y unirlas al conjunto reciente. Deduplicar antes del único selector. Para skills, resolver también licencia, uso permitido y referencias a hechos al entregar.

## Contrato e invariantes

La representación preparada conserva el vector de dependencias de la revisión publicada, el propósito y la autorización de fuente. La retirada de una dependencia elimina la skill de candidatas. Una facturación aceptada por el proveedor solo permite el lenguaje del estado observado.

## Prueba discriminante pendiente

Fijar maxRefs=5 y desplazar el ancla con más de 41 revisiones recientes diferentes. Medir recall por id y tokens. Cambiar su revisión, retirar una licencia y pasar la misma consulta en otro hilo. Exigir que cada salida derivada se regenere o se abstenga. Evaluar recuperación y fidelidad por separado.

## Compatibilidad y rollback

Desactivar la incorporación de anclas y volver al conjunto reciente. Invalidar briefs que dependan del serializador nuevo. Preservar procedencia y revocaciones durante rollback.
