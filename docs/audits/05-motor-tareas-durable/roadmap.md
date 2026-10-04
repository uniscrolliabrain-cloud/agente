# Roadmap — 05 motor de tareas durable

> v1 · 2026-10-04 · Estado: planned

## 1. Promesa del repo
Una tarea sobrevive reinicios, no se duplica, no se pierde.

## 2. Estado verificado
- TaskWorker con lease CAS, heartbeat, checkpoint.
- recoverInterruptedTasks al arrancar.
- Fuente: repodump worker.ts, service.ts.

## 3. Huecos contra producción
- this.active sin tope real.
- Sin cuotas por owner en ejecución.
- Sin cancelación real del handler.
- Sin métricas de task.

## 4. Objetivo
Cobertura 100% de casos de lease expirado sin duplicar efecto. Tope real
de concurrencia.

## 5. Fronteras
- No Kafka.
- No sharding entre procesos.

## 6. Conexiones
- Depende de: 08.
- Dependen de esta: 03, 06, 22, 24.
- Archivos compartidos: worker.ts, service.ts, db.ts.

## 7. Principios del PRODUCT.md
Tareas durables.

## 8. Cómo se verifica el cierre
- Test: matar el proceso a mitad, reiniciar, la tarea continúa.
- Tope MAX_ACTIVE respetado con 100 tareas largas.
- Métrica task_duration_seconds visible.
