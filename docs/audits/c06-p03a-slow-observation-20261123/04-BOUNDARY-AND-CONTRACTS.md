# Contratos reales

`SlowObservationBridge.observe` recibe `CognitiveIdentity`, sourceId, sourceRevision, operationId y prompt. Usa `ContextServingFacade.assertAuthorized` y `resolve` y delega a `SlowCognitionQueue.enqueue`.

`SlowInput` exige identity validada, prompt no vacío y ≤4000 caracteres, entre 1 y 30 `cognitiveRefSchema`, todos en mismo tenant. El puente genera una referencia `{tenantId,kind,id,revision}` de tarjeta o memoria, compatible con ese contrato.

`ContextServingFacade.resolve` consulta última revisión y devuelve null si revocada, inaccesible o no coincidente; vuelve a autorizar el registro y evidencias relacionadas. `enqueue` valida nuevamente identidad y evidencia.

`observe` rechaza operationId vacío o >200, sourceId vacío, revisión no positiva/no segura y prompt vacío o >4000. No limita longitud máxima de sourceId ni whitespace puro; el schema de referencia y consulta de contexto lo cubren parcialmente. No hace validación explícita de `input` null: desestructuración falla con TypeError, sin ejecución de trabajo.

El test usa `as any` para los doubles, por lo que no acredita compatibilidad estricta de mocks ni contrato de DB. Los imports son rutas relativas explícitas; solo el typecheck ejecutado puede certificar compilación.
