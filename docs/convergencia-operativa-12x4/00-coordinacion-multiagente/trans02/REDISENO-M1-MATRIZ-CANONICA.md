# M1 — matriz de reconciliación de las 48 pasadas

Fuente: PATCHSETS.md de las 12 fases canónicas, contrato y wiring; Trans01 V3 0ef3132b; Trans02 T2 8c8c84ad y T3 78931ca1. Se han inspeccionado los patchsets de fase, no los 48 README individuales. Matriz candidata, no modifica canónica ni autoriza implementación.

| Fase / blob PATCHSETS | P1 inventario | P2 integración | P3 reauditoría | P4 hardening | Trans02 |
|---|---|---|---|---|---|
| 01 f9c35e86 | factory, scope | V2/legacy/AGUI, bridge | bypass, duplicados | PG A/B, replay | P01/P03/P04/P10 |
| 02 1d7a6450 | métricas existentes | H02 sobre H01 | doble conteo | collector caído | P05 |
| 03 2543813d | puertos Fast/Slow/JEV/media | lanes separadas | abort, egress | saturación, revocación | P04/P06/P01 |
| 04 4680b534 | receipt y binding WhatsApp | proyección autorizada | accepted vs delivered | replay, unknown | P07 |
| 05 e17ca977 | scopes y receipts cinco servicios | evidencia autorizada | ACL y revisión | revocación | P08 |
| 06 2157880a | fixture y schema | semilla reproducible | deriva y secretos | reset aislado | P09 |
| 07 28a8883c | plan sin escritura | identidad y consentimiento | reanudación | aislamiento | P10 |
| 08 21b94c1d | SDK instalado y contratos | findings como evidencia | permisos, falsos positivos | timeout, objetivos denegados | P11 |
| 09 e6edf467 | señales y baseline | lag/coste/outcome | cardinalidad | collector y retención | P05 |
| 10 b21f3b3d | upstream y contratos | receipt conciliación | precisión y duplicados | revocación | P12 |
| 11 0ea3e481 | procedencia y versiones | conservar referencias | divergencia grafo/memoria | replay/rollback | P13 |
| 12 cfed6550 | matriz gates | jornadas reproducibles | auditoría independiente | PG, carga, restore | P14 |

## Decisión de alcance propuesta al fundador
F01–03, F06, F09 y F12 contienen gates directamente pertinentes al core. F08 utiliza middleware existente como superficie de certificación. F04–05 pueden demostrar contratos de integración si se aprueba su alcance. F07, F10 y F11 mezclan certificación con provisión real, instalación de dominios o recompilación empresarial: no ejecutar estas ampliaciones sin aprobación. Mantener los 48 bloques en trazabilidad; no declarar PASS de fase por fixture parcial.

## Dependencias concretas Trans01 → Trans02
- A01/A02: una propuesta Slow no constituye decisión ni permiso; admisión por el único borde gobernado. No usar role narrativo como principal.
- A03: outcome_unknown no es hecho de éxito ni autoriza retry; distinguir aceptación de proveedor y confirmación. Proyectar únicamente estado verificable.
- E01: usar envelope real y registro de schemas; no añadir un segundo bus. Intención humana raíz, análisis derivado con causationId y correlationId; confirmar ABI.
- E02: no consumir replayTenant legacy como fuente exhaustiva; comprobar DurableProjector y secuencia existente antes de diseñar consumidor.
- E03: receipt discriminado y journal durable; conservar KernelReceiptProjector; no atribuirle verificación universal.
- S01: no asumir que todos los SOP pasan por CapabilityRunner. Exigir evidencia del borde real, no del nombre del ejecutor.
- C01: composición app/service/conversation reservada a Trans01; agent.ts/chat adapter Trans02. No fallback por error.
- H01: hooks existentes; H02 requiere ABI coordinada, sin cast ni segundo registry.

## Orden de trabajo candidato
P01 y P10 preflight en paralelo con inventario P03; P03 antes de P02 y P04; P04 antes de P06; P05 instrumenta contratos confirmados; P09 fixtures antes de P07/P08/P11/P12; P13 después de resolver consumidores y supersession; P14 gate final. P10 owner real y P12 dominio quedan sujetos a decisión de alcance. Mantener barreras B1–B6 canónicas; estos macroturnos son de rediseño documental, no nuevas autorizaciones de implementación.

## Corrección de taxonomía
R04 del documento anterior: ledger pertenece a P02 según plan T2; P05 corresponde a observabilidad H02. No renumerar P01–P14 ni gates Cxx. Snapshot y ledger son subpatchsets separados de P02.

## Evidencia pendiente
Leer README de cada pasada y verificar callers, tests y blobs de composición; obtener ABI E01/E03/H01 y propuesta Slow. Los hunks de Trans01 V3 son candidatos, no contratos ya implementados. NOT_RUN para todos los gates. No nueva nota ni GO.
