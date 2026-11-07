# A05 · WhatsApp saliente

**Carril:** C5 · **Rama:** `sprint/r01-a05-whatsapp` · **Superficie:** `sprints/r01/a05-whatsapp/`

## Estado medido sobre `0c8fe81` — esto es lo mejor del repo

`apps/server/src/engine/whatsapp-outbound.ts` está por encima de la media:

- **Revisión explícita**: `revisionFor()` firma SHA-256 de destinatario, texto, generación de conexión y caducidad. Aprobar un texto distinto del revisado da `409`.
- **Ledger autoritativo**: `insertIfAbsent` sobre `whatsapp-outbound-operations` antes de enviar. Un reintento devuelve la operación existente, no reenvía.
- **CAS al cerrar**: `compareAndSwap` con `attemptId`; si falla, responde "requiere reconciliación, no reintentes".
- **Resultado incierto tratado como incierto**: `OutcomeUnknownError` → `outcome_unknown`, con `reconcile()` humano que exige `providerChecked: true` y `evidenceRef`.
- **Scope real**: `requireIdentity` compara contra `currentTenantScope()` y la credencial descifrada lleva `tenantId`/`owner`/`generation` verificados.
- **Lista blanca de destinatarios** del piloto en la conexión.

## Los huecos

1. **No hay doble aprobación de dos personas distintas.** `approve()` es una sola llamada con la revisión. El nombre "doble aprobación" no está en el código: no hay segundo actor, ni rol aprobador, ni registro de quién revisó vs quién aprobó.
2. **No hay límite de frecuencia** por destinatario ni por día. 50 aprobaciones legítimas del mismo borrador distinto pueden salir 50 veces.
3. **La prueba de concurrencia no existe**: el ledger la soporta, pero ningún test lanza N aprobaciones simultáneas para demostrar que sale **un** envío.

## Preguntas

1. ¿`approve` concurrente sobre el mismo draft: cuántos `sendText` se ejecutan? (mídelo, no lo deduzcas)
2. ¿Qué actor queda en cada operación y puede distinguirse "revisó" de "aprobó"?
3. ¿Cuántos destinatarios permite `allowedRecipients` y qué pasa al llegar a 100?
4. ¿La caducidad de 30 min del draft se respeta con reloj del servidor o del inyectado?

## Entregable del sprint

`sprints/r01/a05-whatsapp/concurrencia.test.ts`: **50 aprobaciones concurrentes del mismo borrador → exactamente 1 llamada al sender** y 1 `accepted`, 49 replays. Sin tocar el código de producción: si falla, el entregable es el bug reproducido, no un parche a ciegas.

## Gate

```bash
node --import tsx --test --test-timeout=30000 sprints/r01/a05-whatsapp/*.test.ts
node --import tsx tests/whatsapp-outbound.test.ts
```

## Trampa

Añadir un `mutex` en memoria como "arreglo": no sobrevive a dos instancias de Fly. Si el ledger no basta, el reporte dice por qué, con el test que lo demuestra.
