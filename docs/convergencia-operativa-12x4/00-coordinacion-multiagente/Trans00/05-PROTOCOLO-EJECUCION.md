# Protocolo ejecutivo candidato — tres macroturnos, seis barreras

Conservar la metodología de la canónica [PROTOCOLO-3-MACROTURNOS.md](https://github.com/uniscrolliabrain-cloud/agente/blob/8672f8c1035067e77de76080aabbe8d4c8030fe5/docs/convergencia-operativa-12x4/00-coordinacion-multiagente/PROTOCOLO-3-MACROTURNOS.md), que distingue tres paradas conversacionales de seis barreras técnicas. Trans00 no inventa una séptima ejecución funcional. El founder autoriza explícitamente cada macroturno y cualquier integración, merge, owner real, efecto externo o despliegue que lo requiera. Dentro de la preparación documental no se ejecuta ninguno.

## E-M1: B1/B2

Cada agente recorre toda su campaña, no solo los módulos que le resultan cómodos. En las doce fases y 48 bloques reevalúa requisitos, código existente, anclas, dependencias y pruebas; realiza lo autorizado de P1/P2 núcleo F01–03 según protocolo canónico, prepara pruebas/pure scaffolds independientes de fases posteriores, deja restantes explícitamente pendientes. B1: inventario reconciliado + ABI + test baseline. B2: cimientos y wiring mínimo, regresiones de familias disponibles; no promover un stub a LIVE. Instrumentación básica causal desde primera ejecución: ID local, estado, tiempo, reason code, correlation/causation, vínculos a receipts. Integración incremental sobre SHA aislado al pasar B1/B2, nunca producción. Si B1 técnico histórico NO_GO sigue vigente, corregir causa y permitir solo trabajo independiente; no certificar ni activar dependencia.

## E-M2: B3/B4

Nueva pasada integral de seis agentes, actualizar los mismos 48 estados. P2 F04–12 según canónica, completar partes de núcleo pendientes, slices existentes, continuidad, primitivas mínimas, instrumentación y pruebas. B3 antes de owner real; no provisionamiento real sin autorización. B4 prueba circuito completo con synthetic data y capacidades actuales. No crear dominios adicionales de gestoría/recompilación: infraestructura de contratos según aclaración founder. Reconciliar nuevos secretos contra consumidores, usar preview/sandbox autorizado, no prod. Trans00 integra las entregas permitidas, si un proveedor falta sigue test hermético y marca BLOCKED_EXTERNAL. No "green" de proveedor real.

## E-M3: B5/B6

Nueva pasada integral de todos, P3 y P4 todas las fases. Auditor cruzado no autor de patch. B5 regresiones y refactor mínimo, no refactor por estética ni rediseño. B6 carga, dos procesos PostgreSQL restringido, crash/replay, revocación, backup/restore, seguridad, evidencia completa. Toda deuda pendiente visible. Integración final es candidato a release, NO_GO hasta evidencia y aprobación. No desplegar por cierre documental. 

## Operación de cada barrera

1. Supervisor captura HEAD de las seis entregas, commit base común y paths reservados. Comprueba no hay ramas movidas ni paths fuera de ownership. Diffs contra base exacta, no merge ciego de rama histórica.
2. Integrar primero contratos/DB/H01–03, luego runtime/bus, Cognition, adaptadores, continuidad/primitivas y composición coordinada. La ordenación depende de DAG de contratos; usar commits coherentes y pruebas, no cortar un conjunto de cambios atómicos.
3. Candidato integrado en ref aislada autorizada, sin deploy. Typecheck y suites focalizadas por delta, luego gate de barrera. Cualquier conflicto semántico se devuelve al propietario. Trans00 solo resuelve coordinación documental y merge mecánico verificable; no inventar fixes de código.
4. Si gate falla: registrar paso, comando, SHA, backend, evidencia, owner, dependencia; continuar trabajo no afectado; no actualizar base compartida como certificada. Si bloqueo externo: separar gate local y proveedor. Conservar última base aceptada, no reset ni force push.
5. Tras aprobación de barrera, fijar SHA integrado nuevo y entregarlo a agentes; reconciliar cambios en ramas de ejecución preservando refs históricas. No reutilizar evidencia de otro SHA como prueba nueva. En B1/B3/B5 no solicitar intervención del founder por cada paso si ya autorizado, pero no saltar dependencias. En B2/B4/B6 revisión combinada y única parada conversacional.
6. Protocolo de bloqueo: STOP extraordinario solo riesgo de pérdida datos, exposición secreto, efecto no autorizado o conflicto que impide todo trabajo seguro. En límite de contexto persistir punto exacto, no decir que se continuará en background.

## Entrega por agente

Manifest por bloque: fase/pasada; ID original + Axx/Cxx/Gxx; SHA inicio/fin; path/símbolo/blob; estado PENDING/IN_PROGRESS/DONE/BLOCKED_DEPENDENCY/BLOCKED_EXTERNAL/NOT_RUN; dueño; contrato/consumidores; prueba roja y verde; comando, exit, skips y backend; migración/rollback; dependencia; revisión cruzada. DONE no equivale a PASS global. Añadir resumen de cambios funcionales ya presentes vs nuevos. No editar docs ajenas ni canónica. El supervisor guarda tabla de seis manifests y SHA integrado, y es único escritor de esta tabla. Reporte chat final por macroturno: RAMA | Ex/Bx | READY/BLOCKED/INCOMPLETE | SHA | enlace | decisión requerida.

## Hitos de decisión humana

Scope de aplicación real, owner real, acceso a cuentas y credenciales, activación de proveedores con coste/efecto, producción, migraciones destructivas, merge a main, cierre/borrado de ramas. No pedir confirmación de ingeniería rutinaria. Aprobación explícita y evidencia separada. No se propone despliegue automático por estos documentos.
