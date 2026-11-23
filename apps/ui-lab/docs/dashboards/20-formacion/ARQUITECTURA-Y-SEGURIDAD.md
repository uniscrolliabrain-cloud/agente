# Arquitectura objetivo: Cognition V2 + kernel + SOP + Composio

## Flujo
Empleado → LAIA (LLM propone intención) → Cognition V2 (contrato estricto) → Kernel (identidad humana, tenant, política, autorización y aprobaciones) → compilador/selector de SOP versionado → executor determinista → capability/adaptador TypeScript → Composio OAuth/API compatible → recibo/estado/verificación → presenter LAIA.

**El LLM no llama Composio ni ejecuta herramientas externas.** No se expone catálogo remoto MCP completo al modelo, ni endpoints arbitrarios, ni credenciales, ni shell, ni ejecución de código generado.

## Puente cognitivo
Cognition V2 es el destino arquitectónico. V1 es legado a retirar con pruebas de paridad, migración de llamadores y rollback. No asumir que `cognition/v2/business-read.ts` implementa todas las capacidades: el archivo inspeccionado solo permite `read_workspace`.

## SOP
SOP Zod canónico en TypeScript, Pydantic solo en workers Python con contrato generado/verificado. El LLM puede proponer una instancia de SOP existente o un grafo de capacidades permitidas. Nuevos SOPs: validación estructural + semántica + autorización + versionado + pruebas/publicación antes de habilitar efectos. No confundir parseo Zod con autorización.

## Seguridad y brechas a verificar
- `engine/execution/capability-runner.ts`: la comprobación governance observada es condicional a dependencias y `ctx.roleId/actorId`; no considerarlo frontera fail-closed universal sin revisar llamadores.
- `engine/capabilities/bootstrap.ts`: capacidades observadas registradas como `idempotent` por defecto; revisar semántica de escrituras externas.
- `packages/domain/src/sop.ts`: `params` usa `z.unknown()`; definir inputSchema estricto por capacidad.
- `engine/cognition/v2/business-read.ts`: ejemplo de identidad, PDP, recibos y pinning, pero lectura limitada y experimental.
- Idempotency key estable, claims atómicos, outcome_unknown, reconciliación antes de retry, política en frontera del efecto, permisos por usuario y scope.
- Conexiones personales no son propiedad de tenant empresarial; no filtrar información entre ámbitos ni conservar acceso corporativo tras salida de empleado.
- Confirmar disponibilidad, costes, OAuth, permisos, términos de uso y límites comerciales de Composio y cada proveedor antes de prometer un reel funcional.

## Ejemplo
«LAIA, pon música para concentrarme» → propuesta tipada `personal.spotify.playback` → comprobación de conexión, permiso y dispositivo → SOP → adaptador → proveedor → resultado. Puede no estar disponible según políticas de Spotify, cuenta, dispositivo o aprobación de la app; mostrar indisponibilidad honestamente.
