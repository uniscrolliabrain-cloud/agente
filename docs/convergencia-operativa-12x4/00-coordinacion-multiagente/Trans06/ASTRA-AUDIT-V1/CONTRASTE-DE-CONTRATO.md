# Polaridades independientes y abstención

Revisión de partida `4905ec63c7de50d0ee34f2ae5e21f01dde80ee9d`. Superficie auditada `apps/server/src/kernel/cromos/physics/field.ts`, blob `31bc3f10491fce8793c1a1f83de86bd73e6812fa`. Símbolos examinados: fieldEnergy e isHighEnergy. [Especificación original](../PASADA-06-EJECUCION-CONSOLIDADA.md)

## Propuesta original y código actual

P05 y P06 conservan los seis polos y proponen experimentación pura sin almacenamiento. El campo calcula la media de cuadrados y asigna cero al conjunto vacío. El umbral decide sobre un escalar.

## Diagnóstico

Un campo escalar no distingue observación de cero de ausencia, y pierde la identidad de los polos. Un promedio tampoco conserva qué objetivo, escala o revisión justificó la evaluación. La propuesta original ya evita activar los cromos.

## Decisión propuesta

PRESERVAR la opción sin almacenamiento. Comparar dos evaluadores puros sobre las mismas referencias en orden estable. Registrar por afirmación los ejes observados, evidencia, criterio y alcance. Usar abstención explícita cuando falte una premisa. El resultado no escribe entidades ni participa en el PDP.

## Contrato e invariantes

Identificar cada juicio por referencia revisada, objetivo, escala y versión de criterios. Permitir dos polos altos y desconocimiento parcial. Una valoración de unidad y otra de organización pueden discrepar y conservarse simultáneamente.

## Prueba discriminante pendiente

Preparar pares de escenarios con los mismos recursos y objetivos distintos. Invertir el orden de relaciones y duplicar una arista. Exigir invariancia al reordenamiento y límite explícito de profundidad y visitas. Medir abstención por falta de evidencia y coste por nodo visitado.

## Compatibilidad y rollback

Retirar el evaluador experimental al no superar una comparación ciega con la ontología existente. Para fijar nuevos axiomas queda pendiente observación del fundador en tres empresas propias.
