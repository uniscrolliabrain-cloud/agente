# BEFORE — NC-P00 consolidación

Base de integración `4f81f22`. Punto de partida técnico PR #8 `9f32817`.
PR #7 `ee2a72e`, PR #9 `985b2c6`, comprobados en origin.

| Origen | Conservar | Excluir o corregir |
| --- | --- | --- |
| #7 | Mapa y reserva NC-BR-001 como referencias. | Revisar la integración de esos documentos por separado. |
| #8 | Solicitud persistida, atribución de modelo y recuperación por lease. | Actor heredado inferido, escritura por payload, mutación de identidad, y mantenimiento parcial. |
| #9 | Descubrir todas las empresas y resolver aprobación, recuperación y mantenimiento desde la fila física. | Backfill de actor por owner/ejecutor y bridge de Google. El vertical tiene la propiedad de sus conexiones. |
| Reparaciones previas | Evaluar `d8cdc24` y `e47a739` y rescatar las pruebas y parches de identidad en worktrees de núcleo. | Excluir `c4a46b5` y mantener `db.ts` bajo responsabilidad del vertical. |

La #8 se elige porque su contrato conserva el solicitante y su delta es más acotado.
El comportamiento útil de la #9 se incorpora por caso reproducido y preservando el
origen físico, con un solo contrato durable. Propiedad del núcleo según handoff del
sprint y NC-BR-001 para Store scoped, service, worker, domain, modelos/cuotas y eventos.
El montaje SSE se examina como parte del mismo aislamiento. Google/OAuth, WhatsApp
y db.ts quedan en su ventana del vertical.

## Reproducción inicial

En la #8 con los commits de pruebas `3ddd980` y `b9fb48a` reaplicados:

```powershell
node --import tsx --import ./tests/setup.ts --test --test-timeout=20000 tests/cognition/foundation/current-review.test.ts tests/cognition/foundation/current-scan-review.test.ts
```

Seis fallos por aserción: fila B reclama A, aprobación de A permite que avance B,
el proceso con prefijo A no descubre B, se ejecuta una tarea sin solicitante,
el checkpoint cambia de tenant y el sobre de evento pierde tenant B.
