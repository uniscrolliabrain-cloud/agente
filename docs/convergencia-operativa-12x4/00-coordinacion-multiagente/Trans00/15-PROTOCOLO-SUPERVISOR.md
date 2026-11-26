# Protocolo definitivo documental — Trans00 supervisor

Precedencia: founder/alcance autorizado > README vigente > canónica invariantes > 14/15/16 > refinamientos 08–13 > adendas 04 > candidatos anteriores. No cambiar el significado de las campañas originales por resolver integración. Este protocolo no autoriza ninguna mutación funcional por sí mismo.

## Arranque E-M1: I0

- Registrar autorización founder explícita: ámbito (integración local, ramas nuevas, tests herméticos; exclusión producción/efectos/owner real), SHA de docs Trans00, actor supervisor y permisos de runner. Actualizar main y seis HEADs; verificar manifest 09 contra árboles y revisar workflows de nuevo. Toda diferencia nueva requiere revisión, no sobrescribir.
- Capturar baseline main M0, Node/pnpm y gate real; guardar fallos previos sin alterar pruebas. Crear integración aislada solo si autorización lo permite. Revisar y recuperar grupos T01(33), T02(10), T03(3), T04(4) en orden de contratos; hooks transferido a 04 tras integración inicial. No incluir .gitignore histórico ni UX/main antiguo. Guardar commits fuente, hashes exactos y lista de paths. Si un grupo falla en ABI, T00 pide al dueño delta focal; no reescribir rama ni instalar otro motor.
- I0 designa el SHA **efectivamente** integrado, no main candidato de 14 ni un SHA hipotético. Registrar evidencia baseline, typecheck y pruebas de importación. B1 solo PASS del alcance probado; NO_GO histórico no desaparece por importación. Si queda fallo baseline, registrar y autorizar trabajo independiente en alcance explícito, no activación dependiente.
- Crear seis ramas exclusivas desde I0, conservar Trans01…06 históricos en lectura. Si alguna ref ya existe, no sobrescribir; comparar y registrar reanudación. Publicar acto E-M1 con SHA documental, I0, ref de cada agente, reserva activa y ámbito de trabajo. Si faltan runner, permisos o base, INCOMPLETE; no presentar la documentación como código integrado.

## Secuencia de integración

| Barrera | Macroturno | Entradas mínimas | Gate y salida |
|---|---|---|---|
| B1 | E-M1 | I0/preflight, seis manifest iniciales, reserva, K1–K7 | baseline real y ABI compatible, no activación de dependencias no aprobadas |
| B2 | E-M1 | núcleo F01–03, adendas disponibles, test de contratos | I1 integrado, typecheck, focales, wiring mínimo, telemetría inicial; STOP E-M1 |
| B3 | E-M2 | I1, slices/fixtures, contratos proveedor y aislamiento | prueba sintética, ACL, autorización separada owner/externo; checkpoint |
| B4 | E-M2 | wiring core completo + F04–12 en alcance, continuidad, primitives | I2 integrado, circuitos locales, regresiones, telemetría; STOP E-M2 |
| B5 | E-M3 | I2, reauditoría cruzada P3 todos bloques | revisión independiente y tests tras refactor; checkpoint |
| B6 | E-M3 | P4 hardening, full gate y evidencia | I3 candidato; PostgreSQL restringido/multiproceso, restore, fallos, gates y revisión independiente; STOP final. Sin GO producción por defecto |

B1/B3/B5 no necesitan otra autorización de chat si incluidos en acto del macroturno. Sí necesitan evidencia y aprobación técnica de dependencia. No asumir que Trans00 vigila automáticamente; agentes publican en Git y trabajan en independiente si aún no se ha certificado barrera. Nunca saltar B1/B3/B5 para conectar una ruta bloqueada. I1/I2/I3 son nombres de resultado, no valores existentes.

## Algoritmo al recibir entregas

1. Registrar SHA de base y seis HEADs entregados (capturar una vez y usar exactos), commits, manifest por bloque (18), path reservation y transferencias, pruebas rojas/verdes, evidencia y bloqueos. Revisar `git diff <base>...<head>` y si base es ancestro. Un branch viejo o stale no entra por nombre; devolver a dueño para reconciliación. Verificar docs no autorizadas y secretos sin imprimirlos.
2. Confirmar dependencias de contrato en orden: K1 identidad y K2 outcome/receipt, K3 bus/DB, K6 hook interfaz; K4 selector/Slow/egress, K5 voice, K7 provider config. Evitar ciclo: publicar tipos y fixture mínimo primero; implementación consumidor después; un único mount T01 al final. Los tests puros avanzan sin activar stubs. No fusionar PR con contrato pendiente que rompe typecheck o autoridad.
3. Revisar colisiones en 11; nombres sin path exacto no son reservas. Un solo writer y transferencia fechada. El dueño de composición incorpora los callsites, no otro agente. Si conflicto semántico, rechazar el conjunto afectado y devolver evidencia al dueño; T00 no escribe fix funcional ajeno. No auto resolver por ours/theirs. Cambios atómicos multiarchivo entran juntos.
4. Integrar commits exactos en rama aislada autorizada mediante merge explícito revisado (sin auto-merge a main). Verificar árbol resultante contra delta esperado, mantener ancestry de HEADs aceptados para que siguiente base permita fast-forward, sin force. Si un HEAD ya avanzó, no incorporar cambios no revisados; dejar nuevo HEAD para revisión siguiente. Cada paso focal; gate completo de barrera sobre SHA exacto limpio. Evitar mezclar bases de tests.
5. Registrar ACTA con `PASS_SCOPE / FAIL / NOT_RUN / BLOCKED_DEPENDENCY / BLOCKED_EXTERNAL / INCOMPLETE` por evidencia. `LOCAL_PASS_EXTERNAL_BLOCKED` distingue funcionamiento hermético de provider; NO_GO de la dependencia permanece. No marcar READY conjunto si falta requisito obligatorio. Mantener estado de los 48 bloques y causas de PENDING/BLOCKED; no forzar 100% si owner real fuera de alcance.
6. Si fallo: no avanzar base aceptada. Dejar candidato fallido inmutable referenciado por SHA; corregir por commit sucesor o revert de commit exacto tras revisar consumidores. No reset/force push. Si migración/efecto fuera de sandbox, parar; no deshacer historia ni repetir dispatch. Rollback operativo: suspender writers/feature/bindings incompatibles, preservar datos/receipts, restore probado y revalidación de ACL; no borrar evidencia para verde.
7. Tras gate de barrera aceptado, registrar nuevo SHA. Agentes sincronizan su rama exclusiva por fast-forward cuando su HEAD aceptado es ancestro; si no, reconciliar commits no integrados bajo dueño, no reset. Si una rama quedó bloqueada, conservar sus commits y hacer merge/rebase solo mediante estrategia aprobada y sin reescribir refs compartidas (preferir merge no destructivo). No iniciar siguiente macroturno hasta acto de autorización. Main puede avanzar en paralelo; antes de release revisar delta actual de main, preservar UX/legal y ejecutar gates de nuevo sobre integración actualizada.

## Auditoría cruzada independiente

Propuesta de pareja de revisión (no permiso de escritura): T01 revisa T03 (efectos); T03 revisa T01 (adapter boundary); T02 revisa T05 (serving); T05 revisa T02 (continuidad); T06 revisa T04 (telemetry/estructura); T04 revisa T06 (evidencia/aislamiento). T00 comprueba independencia real: ningún autor aprueba su propia prueba ni se presenta revisión cruzada como ejecutada si no disponible. Si pareja carece de competencia o también escribió el cambio, reasignar. T04 guarda artefactos de gate, T00 decide promoción de candidato, founder decide GO/producción. El revisor reporta hallazgo al escritor, no toma archivo.

## Acta por barrera

Campos: fecha, autorización y ámbito, doc SHA, base aceptada, candidato SHA, seis HEADs exactos, commit list, ownership/review, 288 estados (6×48), 37 disposiciones de auditoría con test IDs, resultado por cada circuito 06 relevante, runner/environment/roles, pruebas (comando, exit, counts, skips, logs/digest y clean), dependencias, bloqueos, decisión por scope, rollback y próxima acción. Cada acta vive en Git bajo Trans00, no contiene claves ni texto cognitivo privado. Mantener historial append-only de actas, corregir por nueva acta.

## Reporte al founder

`Trans00 | E-Mx/Bx | READY_LOCAL / INCOMPLETE / BLOCKED / RELEASE_CANDIDATE | SHA | enlace acta | decisión`. Un único reporte por macroturno, no por archivo. El supervisor informa solo bloqueo material y autorización de siguiente paso. El release candidate no es autorización de merge a main, tag ni despliegue.
