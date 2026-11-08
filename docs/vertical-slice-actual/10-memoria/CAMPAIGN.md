# 10 · Hechos compartidos y recall acreditado

**Entrada:** el SHA integrado y aprobado de la campaña 09. Contrato transversal y ramas en el [índice](../README.md).

## Anclaje en código

bootstrapAgency siembra scoped; ConversationAgent recupera por owner; meta-hints se leen tras un import asíncrono.

[apps/server/src/engine/conversation.ts](../../../apps/server/src/engine/conversation.ts) · [apps/server/src/engine/feedback/meta-hints-store.ts](../../../apps/server/src/engine/feedback/meta-hints-store.ts)

## Superficie de trabajo

### Crear

- `tests/vertical-slice-memory.test.ts`

### Modificar

- `apps/server/src/engine/memory.ts`
- `apps/server/src/engine/context/engine.ts`
- `apps/server/src/engine/conversation.ts`
- `scripts/lib/agency-bootstrap.ts`

Las rutas de prueba nuevas pertenecen a Codex. Si el contrato ya tiene una implementación equivalente al entrar, extenderla y registrar el cambio de ruta en la entrega.

## Patchsets de Freebuff Cloud

1. **10.P1 · Contrato.** Publicar hechos versionados de perfil con origen y política de precedencia; guardar recuerdos privados aparte.
2. **10.P2 · Conexión.** Wirear recall empresarial y privado a ensamblador con fuentes autorizadas; probar reemplazo y relectura tras reinicio.
3. **10.P3 · Bordes y compatibilidad.** Capturar meta-hints antes del import y probar persistencia sin mezclar ese canal con el perfil canónico.

**Cableado:** semilla → hechos publicados → recall → contexto del fast.

Registrar SHA por patchset, casos legacy afectados y punto de rollback. Los cambios de formato, refactors globales y proveedores ajenos al camino quedan fuera del diff.

## Rama de Codex Cloud

Partir del SHA de implementación entregado. Inspeccionar el diff y añadir o ampliar pruebas en estos archivos según el caso:

- `tests/context-engine.test.ts`
- `tests/kernel-meta-context.test.ts`
- `tests/vertical-slice-memory.test.ts`

```bash
pnpm exec tsx --import ./tests/setup.ts --test --test-timeout=30000 --test-force-exit tests/context-engine.test.ts tests/kernel-meta-context.test.ts tests/vertical-slice-memory.test.ts
git diff --check
```

**Aserción de cierre:** Dos humanos de A recuperan el hecho sembrado; ni B ni otra persona ven el recuerdo privado.

Guardar SHA probado, exit, resumen y evidencia mínima sin secretos. Si aparece un fallo de producto, devolver a Freebuff la reproducción y verificar de nuevo sobre su SHA corregido. Si hace falta ejecutar una prueba real, usar las dos cuentas de staging y registrar el identificador del proveedor tras aprobación.

## Entrega a la siguiente campaña

Entregar el SHA que contiene producto y pruebas, el resultado del gate y el contrato que consume el siguiente tramo. Si falla una aserción de cierre, la campaña sigue abierta. Revertir los commits propios por orden inverso si se requiere deshacer; para datos, seguir el diario de migración y preservar escrituras posteriores.
