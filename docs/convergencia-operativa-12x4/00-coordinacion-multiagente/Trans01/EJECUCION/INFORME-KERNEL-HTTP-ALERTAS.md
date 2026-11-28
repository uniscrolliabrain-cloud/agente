# Composición kernel HTTP y alertas — en curso

Código `fdacd31bdf2c77bb4abd0295520e7e6389e615cc`. 16/16 pruebas locales PASS, cero skips, typecheck raíz y worker exit 0; control anterior tres regresiones fallidas. No full gate ni certificación.

Nueve rutas que construyen KernelContext ahora toman tenant y actor autenticados, owner consistente y rol vigente del UserService. Antes faltaba actorId obligatorio y se fijaba admin; el helper además resolvía tenant primario en vez del elegido. Servicio o scope ausente deniega. Métricas de debug usan el mismo tenant; no_data/null, measured/number y overflow/+Inf son estados diferentes.

index monta createAlertSnapshotReader de Trans04, sin casts de mapas privados ni cinco ceros fijos. Worker local desconocido si API-only o deshabilitado; no declara caído un worker remoto. Cuotas sin productor continúan no disponibles, visibles por gauge de fuente. Cooldown durable y lifecycle de sink ya montados por el incremento previo.

Reserva concreta kernel-routes.ts para composición Trans01 con revisión Trans04. Otros handlers legacy que acceden directamente a deps.tenants o Store aún requieren revisión de scope y no se acreditan por este helper. La agregación sólo cubre filas visibles al rol DB; no sustituye certificación RLS ni autorización por actor. Archivos históricos preservados; campaña y convergencia siguen abiertas.
