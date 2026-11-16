# W3 — Ontología aprobada, recuperación y contexto por consulta

Código: `393b990` (C05 `fab6299`, C09 `b323ab3`/`40b12dc`). Estado: PARTIAL_IMPLEMENTED, C15 NO_GO.

## Resultado

El fundador aprobó explícitamente la ontología del commit 83ae5a0. Se integra una versión 1.0.0 con ocho familias, seis intensidades/tres pares y diez dimensiones tipadas, manteniendo unknown, fuentes, desacuerdos y ausencia de autoridad semántica. [Informe C05](../C05/IMPLEMENTATION-REPORT.md).

Las entregas abandonadas tienen reconciliación transaccional, auditoría y worker independiente con cursor durable, fencing y autorización fresca. [Informe C09](../C09/RECOVERY-REPORT.md).

La caché de ContextServing ahora está ligada al digest de la consulta. Antes podía recuperar un snapshot reciente de otra pregunta. El test nuevo verifica aciertos por consulta, recuperación de la entrada correcta aunque haya seis entradas ajenas recientes, revocación y privacidad.

## Evidencia ejecutada

- Suite V2 consolidada con Postgres 17 sintético: **37/37 PASS**, 0 fail/skip/cancelados; 53.265 s.
- Tanda nativa: **5/5 PASS**, incluida recuperación concurrente, conexiones transaccionales y RLS restringido de las 17 tablas.
- Foco integración HTTP/ontología/Slow: **6/6 PASS**; foco ontología final **3/3 PASS**.
- Typecheck raíz de la integración: exit 0.
- Gate completo 11b3ebd: **827 tests, 810 PASS, 0 FAIL/cancelados, 12 skip, 5 TODO**; 737.9 s total. **8/10** controles; bridges 12/16 y seis contratos huérfanos heredados siguen fallando. Typecheck raíz/worker y cinco auditorías pasan. C15 ejecutado conserva NO_GO y ya no presenta C05 como decisión pendiente.

## Límites

La decisión semántica C05 está resuelta. No están resueltos la API real de JEV, Anam audiovisual, integración RLS global, migración/retirada de todos los consumidores legacy ni métricas de proveedor/costes. No se midió aún una mejora empresarial ni se declara el ranking calibrado. Las valoraciones tipadas permanecen propuestas y no se usan para conceder permisos o certificar hechos.

Sin push, merge o despliegue. El flag de tenants V2 sigue siendo explícito. Ningún dato de empresas reales se utilizó.
