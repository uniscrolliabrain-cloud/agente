# 13 · Automatización, vínculo de hilo y hechos de ejecución

**Entrada:** el SHA integrado y aprobado de la campaña 12. Contrato transversal y ramas en el [índice](../README.md).

## Anclaje en código

personas/routes.ts:41 devuelve referencia de hilo; el contexto de conversación no pasa entityId por ese camino.

[apps/server/src/engine/agents/personas/routes.ts](../../../apps/server/src/engine/agents/personas/routes.ts) · [apps/server/src/engine/events/operational-facts.ts](../../../apps/server/src/engine/events/operational-facts.ts)

## Superficie de trabajo

### Crear

- `apps/server/src/engine/automation-thread.ts`

### Modificar

- `apps/server/src/engine/agents/personas/routes.ts`
- `apps/server/src/threads-routes.ts`
- `apps/server/src/engine/conversation.ts`
- `apps/server/src/engine/events/operational-facts.ts`
- `apps/web/src/hooks/useChat.ts`

Las rutas de prueba nuevas pertenecen a Codex. Si el contrato ya tiene una implementación equivalente al entrar, extenderla y registrar el cambio de ruta en la entrega.

## Patchsets de Freebuff Cloud

1. **13.P1 · Contrato.** Proyectar SOP instalado, habilitación y ejecución como entidades distintas con permisos.
2. **13.P2 · Conexión.** Crear/reanudar hilo con vínculo persistente tenant/actor/persona/automatización y verificarlo al iniciar stream.
3. **13.P3 · Bordes y compatibilidad.** Resolver entidad/ejecución para ContextEngine y exponer referencias autorizadas y siguiente responsable.

**Cableado:** panel → hilo acreditado → fast con hechos → enlace a evidencia.

Registrar SHA por patchset, casos legacy afectados y punto de rollback. Los cambios de formato, refactors globales y proveedores ajenos al camino quedan fuera del diff.

## Rama de Codex Cloud

Partir del SHA de implementación entregado. Inspeccionar el diff y añadir o ampliar pruebas en estos archivos según el caso:

- `tests/laia-automation-chat.test.ts`
- `tests/context-engine.test.ts`
- `tests/laia-vertical-acceptance.test.ts`

```bash
pnpm exec tsx --import ./tests/setup.ts --test --test-timeout=30000 --test-force-exit tests/laia-automation-chat.test.ts tests/context-engine.test.ts tests/laia-vertical-acceptance.test.ts
git diff --check
```

**Aserción de cierre:** Un hilo ajeno se rechaza; una consulta cita la ejecución correcta y excluye otra del mismo tenant.

Guardar SHA probado, exit, resumen y evidencia mínima sin secretos. Si aparece un fallo de producto, devolver a Freebuff la reproducción y verificar de nuevo sobre su SHA corregido. Si hace falta ejecutar una prueba real, usar las dos cuentas de staging y registrar el identificador del proveedor tras aprobación.

## Entrega a la siguiente campaña

Entregar el SHA que contiene producto y pruebas, el resultado del gate y el contrato que consume el siguiente tramo. Si falla una aserción de cierre, la campaña sigue abierta. Revertir los commits propios por orden inverso si se requiere deshacer; para datos, seguir el diario de migración y preservar escrituras posteriores.
