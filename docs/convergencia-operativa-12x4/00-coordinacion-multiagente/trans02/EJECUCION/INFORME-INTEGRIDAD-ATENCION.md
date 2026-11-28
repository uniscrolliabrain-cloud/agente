# Trans02 — integridad de atención

Código `bdb0f510`. Tres regresiones fallaban antes: una vista almacenada podía sustituir epistemia, score o referencias, incluso recalculando su hash. Ahora la lectura valida forma, identidad, snapshot autorizado, consulta, watermark y caducidad; vuelve a derivar cada selección desde las revisiones originales y verifica el ID. No cambia pesos ni crea otro selector.

Versión `attention-v2.3`: conserva la consulta acotada como dato privado de reproducción dentro de la fila existente. No devuelve esa consulta ni la exporta en telemetría. Las vistas anteriores sin ese dato se rechazan y deben reconstruirse; no se reescribe historial.

Validación local: regresiones nuevas y atención/memorias 5/5 PASS; suite cognitiva ampliada 105 pruebas, 95 PASS, 10 SKIP, cero FAIL. Typecheck raíz y worker exit 0. Logs `/tmp/trans02-attention-integrity-{red,green}.log`, `/tmp/trans02-attention-cognition.log`, `/tmp/trans02-attention{,-worker}-tsc.log`. Ejecución en worktree antes del commit; suites solapadas, no sumables. No certifica RLS restringido, proveedores ni cierre global.
