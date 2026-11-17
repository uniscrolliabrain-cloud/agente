# Sincronización, secuencia y concurrencia

## Algoritmo
1. Superficie autentica usuario con AgntiaPro.
2. GET active devuelve threadId y versión de puntero.
3. GET thread obtiene historial paginado + último cursor.
4. Suscripción SSE/WebSocket con cursor. Ante reconexión recuperar eventos desde cursor.
5. Al enviar: generar clientMessageId e idempotencyKey; POST append; esperar ACK duradero; servidor asigna sequence y crea run.
6. Engine emite eventos run.started/progress/tool/approval/completed; guardar resultado en servidor y notificar suscriptores.
7. Todas las ventanas renderizan el mismo hilo desde eventos + snapshots; si hay hueco de secuencia, reconciliar.
8. Nuevo chat: transacción crea hilo y actualiza active pointer con CAS; evento active.changed; superficies cambian tras confirmar identidad/empresa.

## Riesgos del estado actual
useThreads usa localStorage agente_active_thread; no sincroniza entre hosts. useChat monta history desde mensajes del cliente y hace saveThreadMessages al final; guardar listas completas puede sobrescribir cambios simultáneos. threads-routes PUT admite reemplazo de messages con CAS y lock local: transición hacia append por mensaje y control transaccional de servidor.

## Semántica de concurrencia
Orden total por hilo mediante secuencia asignada transaccionalmente; idempotencia por (tenantId, actorId, clientMessageId). Nunca dos mensajes con misma secuencia. Dos mensajes simultáneos pueden generar runs serializados por hilo, o runs concurrentes con causalidad explícita; para v1 preferir cola por hilo y respuesta ordenada. Estado de envío: pending, accepted, processing, completed, failed. Cierre de pestaña no cancela ejecución persistente salvo acción explícita. Doble entrega de eventos no duplica burbujas.

## Active pointer
La selección activa global se actualiza solo mediante intención explícita. Abrir Gmail/Drive no crea hilo ni altera selección. Para hilos antiguos: modo vista local vs «establecer activo en todas las superficies». CAS impide cambios perdidos. Un usuario con dos empresas mantiene punteros independientes.

## Recuperación
Red caída -> conservar borrador, reintentar idempotente; stream interrumpido -> GET run state + eventos posteriores; cliente atrasado -> snapshot + cursor; fallo de worker -> reanudar o marcar fallo con auditoría. No usar localStorage como verdad ni confiar en entrega exact-once del transporte.
