# Trans01 — corrección del ranking empresarial existente

Código `64f160b3`, reserva RESERVA-TRUTH-RANKING.md. Tres regresiones reproducidas por Trans06 fallaban antes: fecha futura amplificaba reliability, candidato de otro field se devolvía bajo el solicitado, y fecha inválida entraba en el ranking con NaN. Ahora usa truthCandidateSchema, exige coincidencia de field y captura un único reloj válido. Freshness conserva la fórmula y límite inferior existentes; el futuro se trata como actual, sin factor superior a 1. No confirma que la observación futura sea real.

Validación local previa al commit: regresiones y test original 5/5 PASS, cero SKIP; typecheck raíz exit 0. Logs `/tmp/trans01-truth-integrity-{red,green,tsc}.log`. Tres pruebas rojas anteriores; el cuarto test nuevo comprueba reloj y conservación del kind, sin contarlo como bug previo.

No se cambian pesos ni se crea otro motor. Ranking continúa siendo ranking: no autoriza verified_fact, operaciones ni beneficio empresarial. No escritura de negocio. Falta verificar escenarios de todos los callers y evaluación del circuito completo; no cierra Trans01 ni Trans06.
