# Sesion 04 - Revisar notificaciones

**Estado:** pendiente de remediacion.

- `audit:tenant-default` informa referencias a `notification-prefs` con id `"default"` en `apps/server/src/engine/events/bus.ts`.
- No se ejecuto una prueba HTTP que intente leer o actualizar notificaciones desde otro tenant.
- El resultado de la auditoria necesita clasificacion, pero debe mantenerse como finding hasta demostrar lo contrario.

**Siguiente paso:** revisar resolucion de tenant y agregar una prueba cross-tenant para las preferencias y las notificaciones.
