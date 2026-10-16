# 26 — Capability E2E Audit

**Versión:** v1  
**Fecha:** 2026-10-06  
**Estado:** PLANNED

## Propósito

Auditar capacidades empresariales completas de extremo a extremo, no módulos aislados.

Una capability solo se considera realmente existente cuando el recorrido completo funciona desde la entrada del usuario hasta el efecto empresarial, incluyendo política, ejecución, resultado, estado, memoria, UI, observabilidad, recuperación y trazabilidad.

## Flujo E2E de referencia

```text
USER / INPUT
    ↓
INTENT
    ↓
CONTEXT
    ↓
PLANNING
    ↓
CAPABILITY
    ↓
POLICY
    ↓
APPROVAL (si aplica)
    ↓
EXECUTION
    ↓
EXTERNAL EFFECT
    ↓
OUTCOME
    ↓
EVENT
    ↓
MEMORY / STATE
    ↓
UI / FEEDBACK
    ↓
AUDIT / PROVENANCE
```

Principio:

```text
implemented ≠ wired ≠ tested ≠ verified ≠ real-use ≠ production-ready
```

## Alcance

El audit cruza:

- server
- domain
- kernel
- context
- memory
- planner
- orchestrator
- policies
- capabilities
- SOPs
- tasks
- approvals
- event bus
- integrations
- persistence
- observability
- frontend
- ViewSpec
- auth
- tenant isolation
- recovery

## 20 capabilities iniciales

1. Crear una task desde chat.
2. Ejecutar una task durable.
3. Crear un documento.
4. Generar una factura.
5. Preparar / enviar una comunicación.
6. Recibir y procesar WhatsApp.
7. Identificar un contacto y relacionarlo con la empresa.
8. Consultar memoria / contexto empresarial.
9. Ejecutar un SOP.
10. Proponer una acción que requiere aprobación.
11. Aprobar una acción.
12. Rechazar una acción.
13. Leer Google Drive.
14. Crear / modificar información en Drive.
15. Ejecutar una operación mediante browser worker.
16. Ejecutar una operación mediante computer sandbox.
17. Resolver un ViewSpec.
18. Persistir resultado y provenance.
19. Recuperar un fallo de provider.
20. Recuperar una task con outcome desconocido.

## Matriz E2E

Cada capability debe revisarse como mínimo en estas etapas:

| Capability | Input | Intent | Context | Planning | Capability | Policy | Approval | Execution | External effect | Outcome | Event | State | Memory | UI | Audit | Recovery | Test | Real-use |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

Para cada celda debe existir evidencia cuando corresponda.

## Identidad de ejecución

Toda ejecución relevante debe poder reconstruirse mediante una identidad consistente:

- `runId`
- actor
- tenant
- capability
- capability version
- SOP version
- policy version
- model / provider
- contexto relevante
- `taskId`
- `eventId`
- `approvalId`
- outcome
- timestamps
- provenance

## Regla de autoridad

El LLM puede:

- interpretar
- clasificar
- extraer
- proponer
- transformar
- planificar dentro de límites

El LLM no debe poder saltarse:

- schemas
- policies
- permissions
- approvals
- contracts
- tenant boundaries
- validation
- audit

## Failure Experience Audit

No basta con comprobar que técnicamente existe recuperación.

Para cada fallo hay que comprobar:

1. Qué sabe el sistema.
2. Qué sabe el usuario.
3. Qué estado queda persistido.
4. Si puede reintentarse.
5. Si el retry es seguro.
6. Cómo se evita duplicar efectos.
7. Qué queda registrado.
8. Cómo se recupera.

Casos mínimos:

- LLM timeout / error.
- Provider `429` / `5xx`.
- Schema inválido.
- Capability inexistente.
- Permiso insuficiente.
- Approval pendiente.
- Approval rechazado.
- Worker timeout.
- Integración externa caída.
- Respuesta ambigua.
- Request duplicada.
- Retry.
- Crash.
- Outcome desconocido.
- Desconexión de UI.

## Invariantes

El audit debe comprobar al menos:

1. Las acciones críticas requieren autorización.
2. Existe aislamiento entre tenants.
3. Las tareas durables no desaparecen silenciosamente.
4. `outcome_unknown` nunca se convierte silenciosamente en `success`.
5. Las acciones externas tienen provenance.
6. El actor está identificado.
7. Las operaciones sensibles tienen idempotencia cuando corresponda.
8. El LLM no puede saltarse una policy.
9. El usuario puede conocer el estado real de una task.
10. Los cambios importantes son trazables.
11. Un fallo de provider no destruye el estado empresarial.
12. Una nueva versión no degrada silenciosamente una capability crítica.

## Estados de madurez

Cada capability debe clasificarse como:

```text
DESIGNED
IMPLEMENTED
WIRED
TESTED
VERIFIED
REAL_USE
PRODUCTION_READY
```

No deben tratarse como equivalentes.

## Criterios de cierre

Una capability no se considera cerrada hasta disponer, según corresponda, de:

- happy path
- fallo relevante
- persistencia
- autorización / policy
- outcome explícito
- observabilidad
- provenance
- UI / feedback
- test automatizado
- real-use cuando sea posible

## Evidencia

Cada PASS o FAIL debe poder señalar evidencia concreta:

- archivo
- función
- test
- endpoint
- event
- schema
- log
- captura
- comando
- fix marker

Formato recomendado:

```text
PASS — [qué se verificó]
EVIDENCE — [archivo / función / test / comando]
NOTES — [observación]
```

o:

```text
FAIL — [qué falla]
EVIDENCE — [archivo / función / test / comando]
IMPACT — [impacto]
FIX — [fix requerido]
```

## 20 deep gaps a buscar

1. Producer sin consumer.
2. Consumer sin producer.
3. Capability declarada pero no registrada.
4. Capability registrada pero inaccesible.
5. Ruta alternativa que evita una policy.
6. Approval que no bloquea realmente.
7. Outcome persistido pero no mostrado.
8. Event emitido pero no consumido.
9. State actualizado sin provenance.
10. Retries inseguros.
11. External effect sin idempotency key.
12. `unknown outcome` tratado como error genérico.
13. Error técnico mostrado directamente al usuario.
14. Error operacional sin audit.
15. UI afirmando éxito antes del resultado real.
16. Durable task no reanudable.
17. Configuración hardcodeada.
18. Capability que funciona únicamente en tests.
19. Capability que funciona internamente pero no en integración real.
20. Resultado que no puede reconstruirse.

## Relación con audits 01–25

El Capability E2E Audit no sustituye los audits anteriores.

Los utiliza como evidencia transversal.

Debe comprobar especialmente la conexión entre:

- arquitectura
- coherencia
- contratos
- contexto
- memoria
- planner
- orchestrator
- policies
- SOPs
- tasks
- approvals
- event bus
- integrations
- observability
- frontend
- ViewSpec
- auth
- tenant isolation
- recovery
- deploy
- real use

La pregunta deja de ser:

> ¿Existe este módulo?

Y pasa a ser:

> ¿Puede esta capacidad empresarial recorrer todo el sistema y producir correctamente el resultado que promete?

## Dogfooding radical

La primera empresa compilada por el sistema es la propia empresa que comercializa el software.

Por tanto, el dogfooding debe formar parte del audit:

```text
INCIDENT
   ↓
ROOT CAUSE
   ↓
CAPABILITY GAP / BUG / UX / POLICY / SOP / ARCHITECTURE
   ↓
FIX
   ↓
TEST
   ↓
REAL USE
   ↓
GENERALIZABLE CAPABILITY
```

Cada problema encontrado usando el sistema sobre la propia empresa debe convertirse, cuando corresponda, en conocimiento generalizable del producto.

## Empresa compilada

Modelo:

```text
CORE
+
BUSINESS CONTRACT
+
SOPs
+
CAPABILITIES
+
CONFIGURATION
=
COMPILED COMPANY
```

El objetivo es que una nueva empresa requiera principalmente nueva configuración, conocimiento, procedimientos y datos de negocio, y no una reescritura del núcleo.

## Resultado esperado

Crear:

```text
docs/audits/26-capability-e2e/report.md
```

El report deberá contener como mínimo:

- resumen ejecutivo
- matriz de las 20 capabilities
- estado de cada etapa E2E
- failures encontrados
- invariantes violados
- evidencias
- fixes necesarios
- capabilities generalizables
- capabilities específicas del negocio
- pendientes
- criterios de cierre

## Principio final

> Una feature demuestra que existe código.

> Una capability demuestra que existe una capacidad empresarial.

> Un recorrido E2E demuestra que esa capacidad realmente pertenece al sistema.
