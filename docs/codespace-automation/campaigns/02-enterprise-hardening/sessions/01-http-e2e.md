# Sesion 01 - Crear escenario E2E HTTP

**Estado:** test creado, ejecucion bloqueada.

- `tests/tenant-http-e2e.test.ts` crea dos usuarios con membresias distintas.
- El escenario comprueba tenant resuelto en `/api/agent-personas`, crea una memoria por HTTP e intenta modificarla desde el otro tenant.
- No puede arrancar: `apps/server/src/app.ts` importa `apps/server/src/engine/service.ts`, que no existe en el checkout.
- La prueba no se considera evidencia aprobatoria hasta ejecutarse de extremo a extremo.

**Siguiente paso:** restaurar la implementacion de `AgentService` y ejecutar el test de forma aislada y dentro de la suite.
