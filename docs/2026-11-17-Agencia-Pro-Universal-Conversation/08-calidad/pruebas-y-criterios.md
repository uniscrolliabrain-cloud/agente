# Pruebas y criterios de aceptación

## E2E fundamentales
1. Usuario escribe en Gmail y cierra pestaña: mensaje y respuesta aparecen en AgntiaPro.
2. Usuario escribe en Drive: misma secuencia, sin duplicación.
3. AgntiaPro abierto en segundo dispositivo recibe actualización sin recarga.
4. «Nuevo chat» en Gmail cambia active thread en AgntiaPro y Drive; antiguo permanece.
5. Abrir hilo antiguo en modo lectura no cambia puntero global.
6. Dos mensajes simultáneos se ordenan de forma determinista y no se pierden.
7. Doble POST con misma idempotencyKey crea un mensaje.
8. Pérdida de red durante stream: recuperación por cursor y estado del run.
9. Revocación OAuth: lectura/acciones Google fallan cerrado; historial sigue disponible.
10. Dos empresas del mismo usuario: cero contaminación de mensajes, memoria o tokens.
11. Dos trabajadores: conversaciones personales aisladas.
12. Email con instrucciones maliciosas no altera system policy ni ejecuta acciones.
13. Envío de email con aprobación requerida no se ejecuta sin autorización.
14. Complemento con contexto de documento sin permisos recibe rechazo.
15. UI host sin streaming muestra progreso/resultado por polling permitido sin alterar semántica.

## Pruebas técnicas
Unit: Zod, ACL, pointer CAS, sequence, idempotencia, cursors. Integration: Postgres transacciones, RLS, bus replay, auth OAuth. Contract: AG-UI/events, SDK, Google/Microsoft mocks. E2E: web-web antes de Gmail/Drive. Load: multiinstancia, reconexiones, 1000 eventos/hilo, race. Security: pen-test de tenant isolation y prompt injection. Observabilidad: correlationId por turno.

## Criterio de cierre
No declarar «universal» hasta que todos los clientes activos lean el mismo historial autoritativo; el puntero activo sea consistente; no haya reemplazo de listas desde UI; identidad y ACL estén validadas; y los flujos de reconexión y aprobación pasen pruebas.
