# Contrato de journal humano y hallazgo del gate — en curso

Commits b630afdc/e389c4e8, contrato domain de Trans02 8e781750. Se añade al enum cerrado existente cognition.v2.turn.admitted y su payload estricto. EventBus exige root causal, actor humano autenticado, owner/tenant/actor concordantes y fuente context. No da permiso operativo ni acredita hechos. Runtime todavía no lo produce: montaje de Trans02 pendiente. El contrato no sustituye al bus ni introduce storage nuevo.

22 pruebas de envelope, causalidad y principal PASS; después, 9 pruebas de envelope/PDP PASS. Typecheck raíz/worker correcto antes del último ajuste de una condición booleana del runner; full gate posterior pendiente. Logs /tmp/trans01-human-envelope.log, /tmp/trans01-human-envelope-tsc.log y /tmp/trans01-explicit-governance.log. Se corrigió una aserción inicial: EventBus.emit conserva su API no-throw y comunica el rechazo con persisted=false/error; se verifican ambos campos.

Gate completo anterior b25f286c: 1119 tests, 1087 PASS, 4 FAIL, 23 SKIP, 5 TODO; audit:contracts falla con tres tipos de Trans05 sin consumidor. Archivo íntegro preservado en /tmp/trans00-first-full-gate/, aceptación NO_GO. E2E-05 reveló un fallo real: legacy_v1 ignoraba un PDP explícitamente configurado para lecturas puras. Ahora respeta ese PDP; una lectura legacy sin PDP conserva compatibilidad. El test original se mantiene y pasa. Los otros tres fallos corresponden a fixtures Gmail sin membresía vigente exigida por OAuth; Trans03 los revisará manteniendo los checks. Los tipos de Trans05 requieren uso real, no allowlist para ocultar deuda.

No se declara la suite completa verde por estas correcciones focalizadas. No despliegue, y permanecen las barreras de migración de claims y RLS.
