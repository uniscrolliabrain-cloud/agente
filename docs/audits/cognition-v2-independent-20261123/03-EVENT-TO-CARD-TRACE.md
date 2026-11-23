# Trazabilidad evento → tarjeta → LAIA

| Etapa | Código observado | Evidencia y límite |
|---|---|---|
| Emisión runtime | app.ts crea EventBus con sink V2 | existe conexión; falta mapa exhaustivo de productores |
| Persistencia/proyección | DurableEventSink, CognitiveProjector, KernelReceiptProjector | workers.ts lanza lanes `projection` y `receipts` |
| Análisis Slow | SlowCognitionQueue, lane `slow` | `cognition-v2-routes.ts:81-91` encola explícitamente; falta demostrar disparador automático empresarial |
| Propuesta | slow.ts `cognition.v2.record.proposed` | salida validada y enviada al sink; no equivale a autorización de acción |
| Proyección y selección | ContextServingFacade y CognitiveProjectionStore | revalidación de identidad, política, revisiones y evidencias |
| Reserva/ACK | CardDeliveryLedger y runtime.ts | reserva y ACK en transacción con receipt del turno; no prueba playback ni entrega al navegador |
| Fast | runtime.ts `provider.stream` con `tools: []` | snapshot reducido; Slow no bloquea la inferencia Fast |

**E2E real no demostrado**: no se ejecutó un evento empresarial que causase automáticamente una tarea Slow y una tarjeta visible en el turno siguiente. Test de aceptación imprescindible: fixture empresa A + actor autorizado, operación con receipt kernel, evento durable, encolado automático Slow, clasificación, propuesta, proyección, snapshot, respuesta posterior y denegación a empresa B.
