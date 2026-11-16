# W11 — RLS explícita en módulos opcionales

Base `cf5f4b6`. `installCognitionRls(db, {voice:true, cyber:true})` incluye opcionalmente cinco tablas de voz y dos del relay Cyber además del inventario core. Los módulos deben instalarse previamente; si falta una tabla, la transacción de migración falla y revierte. La invocación sin opciones conserva el inventario anterior. No se modifica el bloqueo `COGNITION_V2_SHARED_RLS_NOT_CERTIFIED` ni se ejecuta migración sobre base real.

Prueba con PostgreSQL 17.9 sintético loopback: `node --import tsx --import ./tests/setup.ts --test --test-isolation=none --test-timeout=30000 tests/cognition-v2-rls.test.ts tests/cognition-v2-rls-modules.test.ts`: 2/2 PASS, 0 omitidas. Crea rol sin superusuario ni bypass, valida sin scope y con dos tenants lectura/borrado en sesiones de voz y cursor Cyber, inserción falsificada rechazada y políticas instaladas en todo el inventario. El test previo limita su inventario a las tablas core para no depender de módulos opcionales instalados por otras pruebas. `tsc --noEmit`: PASS.

Esto valida políticas de tablas y dos ejemplos de acceso, no la integración end-to-end de HTTP/worker/voz/relay bajo RLS ni la tabla general `records`. No se verificaron operaciones de cada tabla individual ni permisos reales de despliegue. C15 sigue NO_GO.
