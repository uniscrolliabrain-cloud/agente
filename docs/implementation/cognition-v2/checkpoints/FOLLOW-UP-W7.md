# Seguimiento posterior al checkpoint — W7

El checkpoint congelado es [734b687c3936e7157ee184410736a69049a605d9](https://github.com/uniscrolliabrain-cloud/agente/commit/734b687c3936e7157ee184410736a69049a605d9), con pruebas sobre código `640a55db01fc9f934bf927dec53e97035f0455f3`. Sus hallazgos y resultados originales se mantienen para auditoría independiente. Este seguimiento documenta la reanudación efectiva del programa, no una segunda certificación.

| Hallazgo original | Corrección posterior | Evidencia |
|---|---|---|
| P1-01: tres runs compartían un ACK | [db2991d74d935465236ec24708a3a470fcd92562](https://github.com/uniscrolliabrain-cloud/agente/commit/db2991d74d935465236ec24708a3a470fcd92562): consumidor por run, columna aditiva, recibo y ACK atómicos | [Informe C09](../C09/REPORT-W7-CHECKPOINT-FIX.md); reproducción actual: 3 runs / 3 ACK |
| P1-02: eventos privados alcanzaban el observable público | [66a567311302ec19278a8be5b2160acb79c5b97c](https://github.com/uniscrolliabrain-cloud/agente/commit/66a567311302ec19278a8be5b2160acb79c5b97c): eventos de texto mínimos permitidos, metadatos eliminados, error controlado | [Informe C11/C12](../C12/REPORT-W7-PUBLIC-EVENTS.md); reproducción actual: 0 eventos privados |

Verificación conjunta: **47/47 tests V2 PASS**, 0 fallos/omitidos/cancelados, 131.659302 s, incluyendo Postgres 17 local, RLS restringida, concurrencia/recovery, HTTP sintético, voz simulada y dos regresiones nuevas. TypeScript raíz y worker PASS. [Resultados depurados](POST-CHECKPOINT-RESULTS.json).

No se vuelve a atribuir el gate completo al nuevo HEAD: se ejecutó sobre el código congelado del checkpoint. Sus fallos de contratos/bridges, browser no disponible y c8 ausente siguen pendientes. No se ha ejecutado release:verify ni desplegado un destino real.

Campañas reanudadas: C09/C11/C12. Ninguna campaña completa ha superado su gate integral. Próximas dependencias: integrar W6/JEV de forma controlada y construir egreso gobernado, consumidores legacy durables, RLS transversal y paridad empresarial; mantener pendiente la activación externa. No se ha hecho merge a main ni despliegue.
