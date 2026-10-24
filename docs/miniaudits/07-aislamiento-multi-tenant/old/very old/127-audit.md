# REAUDIT 07 — AISLAMIENTO MULTI-TENANT

El siguiente bloque del historial de reaudits es el 07 — Aislamiento multi-tenant. La distinción clave es que el repositorio se diseñó inicialmente para desplegar una instalación por cliente: por tanto, que `tenantId` tenga el valor `"default"` no implica automáticamente una vulnerabilidad en ese modelo. El problema aparece si se pretende compartir la misma instalación entre varias empresas sin completar el aislamiento de datos, permisos, cuotas y contexto.

# REAUDIT 07 — AISLAMIENTO MULTI-TENANT

> v1 · 2026-10-17\
> Base documental: `repomix-backend.md`, `docs/miniaudits/07-aislamiento-multi-tenant/miniaudit.md`, `roadmap.md`, `fixes.md` y `audit-tenant-default.txt`.\
> Estado: **auditoría profunda existente; fase de implementación específica todavía no cerrada en la documentación del bloque.**

## Paso 1 — Qué quiero descubrir

1. Si el modelo actual de aislamiento es seguro para el despliegue previsto: una instalación por cliente.
2. Qué ocurriría si una misma instalación atendiese a varios tenants.
3. Si `TenantScopedStore` cubre todas las rutas de lectura y escritura.
4. Si `Files`, `Rag`, `WorkspaceService` y los workers utilizan el contexto de tenant correcto.
5. Si los scans globales y las tareas de mantenimiento están acotados.
6. Si la caché de `TenantService` puede utilizar una asignación de propietario obsoleta.
7. Si la base de datos impone aislamiento mediante RLS o depende exclusivamente del código de aplicación.
8. Si los límites de consumo se aplican de forma coherente a chat, RAG, archivos y ejecución de tareas.
9. Qué cambios son necesarios antes de habilitar un SaaS multi-tenant real.
10. Qué ideas de las 127 dependen de resolver primero la identidad del tenant, su aislamiento y sus cuotas.

El principio central es sencillo: **un tenant no puede leer, modificar, enumerar ni inferir datos de otro tenant**, ni siquiera a través de errores, procesos de mantenimiento, cachés, archivos, métricas o reintentos.

## Paso 2 — Qué hay en el bloque y en el código

### Documentación disponible

- `docs/miniaudits/07-aislamiento-multi-tenant/miniaudit.md`
- `docs/miniaudits/07-aislamiento-multi-tenant/roadmap.md`
- `docs/miniaudits/07-aislamiento-multi-tenant/fixes.md`
- `docs/audits/_prep/audit-tenant-default.txt`

El estado documental importa: `miniaudit.md` está en `audited-deep`, pero `fixes.md` sigue siendo un placeholder. No debe interpretarse como una prueba de que no existen mejoras de aislamiento en el código: el propio Repomix documenta componentes reales y correcciones de otros bloques que afectan a este.

### Archivos relevantes

| Nivel | Archivo o componente                                   | Responsabilidad                                       |
| ----- | ------------------------------------------------------ | ----------------------------------------------------- |
| A     | `apps/server/src/engine/db.ts`                         | Store y consultas de persistencia                     |
| A     | `apps/server/src/engine/db-tenant.ts`                  | `TenantScopedStore`, prefijos y separación por tenant |
| A     | `apps/server/src/engine/db-rls.ts`                     | Integración opcional de Row-Level Security            |
| A     | `apps/server/src/engine/service.ts`                    | Mantenimiento, scans y operaciones de servicio        |
| A     | `apps/server/src/app.ts`                               | Construcción y cableado de dependencias               |
| A     | `apps/server/src/engine/files.ts`                      | Persistencia y acceso a archivos                      |
| A     | `apps/server/src/engine/rag.ts`                        | Datos y operaciones de recuperación contextual        |
| B     | `TenantService`                                        | Resolución y caché de asignaciones de tenant          |
| B     | `DatabaseTenantConfigResolver`                         | Resolución de configuración del tenant                |
| B     | `ServiceTenantResolver`                                | Resolución de tenant en servicios                     |
| B     | `packages/domain` y contratos de identidad             | Contratos y contexto compartido                       |
| B     | `apps/server/src/engine/worker.ts`                     | Ejecución asíncrona y recuperación de tareas          |
| B     | `apps/server/src/engine/routes.ts` y rutas específicas | Límites de autorización y contexto en endpoints       |
| C     | Auditor `tenant-default` y pruebas asociadas           | Detección de usos de `default` y verificación         |

Los nombres anteriores están respaldados por el inventario documental. Antes de editar, la IA implementadora debe localizar cada archivo y comprobar sus exports, constructores y llamadas reales; no debe asumir que el snapshot sigue siendo idéntico al checkout actual.

## Paso 3 — Cruce del miniaudit con el código real

### 3.1. Modelo de despliegue: clone-por-cliente

**Veredicto: CONFIRMADO COMO MODELO PREVISTO.**

La documentación establece un deployment independiente por cliente. En ese modelo, `tenantId = "default"` puede ser una decisión válida si la instalación no comparte datos ni recursos persistentes con otros clientes.

Esto no equivale a afirmar que el backend esté preparado para ejecutar un SaaS multi-tenant compartido.

Hay dos objetivos distintos:

- **Modelo actual:** una instalación por empresa, con separación operacional por despliegue.
- **Modelo futuro:** una instalación compartida con identidad, membresías, permisos, datos y cuotas separados por tenant.

No se deben introducir complejidades del segundo modelo si no forman parte del despliegue inmediato. Pero sí se deben evitar contratos que hagan imposible evolucionar hacia él.

### 3.2. `TenantScopedStore`

**Veredicto: IMPLEMENTADO; COBERTURA TOTAL DE TODAS LAS RUTAS NO DEMOSTRADA.**

El miniaudit documenta un wrapper que compone el propietario mediante `tenantId:owner` y utiliza `peel(owner)` para recuperar el identificador lógico al leer.

También se documenta `Store.scanByOwnerPrefix`, que permite buscar registros por prefijo de propietario.

Este diseño ofrece una frontera útil para el aislamiento, pero su garantía depende de que todas las operaciones relevantes pasen por ella.

**Riesgo:** un servicio que escriba directamente mediante el Store crudo puede persistir con un propietario sin prefijo, mientras que las lecturas realizadas con `TenantScopedStore` esperan el propietario compuesto. Además de inconsistencias funcionales, una ruta global sin filtro podría cruzar fronteras entre clientes.

**Pendiente:** inventariar las dependencias que reciben `Store` directamente y comprobar, para cada servicio, las rutas de lectura, escritura, listado, borrado, actualización y mantenimiento.

No basta con sustituir el tipo del constructor. Debe verificarse que el contexto de tenant se conserva en cada llamada.

### 3.3. `Files`, `Rag` y `WorkspaceService`

**Veredicto: HUECO DE CABLEADO IDENTIFICADO.**

El miniaudit señala que `Files`, `Rag` y `WorkspaceService` recibían `db` crudo desde `app.ts` en algunos caminos.

La documentación describe el resultado potencial:

- Escrituras con propietario plano.
- Lecturas que esperan `tenantId:owner`.
- Artefactos que pueden no aparecer donde se espera.
- Riesgo de acceso indebido si otras rutas utilizan consultas globales.

El Repomix también muestra una evolución de `Files`: su constructor acepta `Store` o `TenantScopedStore`, con una marca `FILES_TENANT_STORE_V1`. Esto impide concluir que todo el componente siga necesariamente sin corregir. Lo que permanece pendiente es verificar el cableado de todos los callers y operaciones.

**Archivos prioritarios:**

- `apps/server/src/app.ts`
- `apps/server/src/engine/db-tenant.ts`
- `apps/server/src/engine/files.ts`
- El módulo real de RAG.
- El módulo real de `WorkspaceService`.

**Regla de implementación:** un servicio que opera con datos pertenecientes a un tenant debe recibir un acceso ya acotado o un contexto de tenant validado. No debe reconstruirlo a partir de valores arbitrarios enviados por el cliente.

### 3.4. Resolución del tenant y caché

**Veredicto: CACHÉ EXISTENTE; INVALIDACIÓN POR CAMBIO DE ASIGNACIÓN PENDIENTE.**

El miniaudit documenta una caché de `TenantService` de cinco minutos.

Si un administrador mueve un usuario u owner de un tenant a otro, una caché que conserva la asignación anterior puede mantener temporalmente una resolución obsoleta.

Esto es especialmente delicado si la resolución se utiliza como frontera de autorización y no solo como optimización.

**Corrección recomendada:**

1. Identificar las operaciones que cambian la membresía o asignación.
2. Invalidar las entradas afectadas después de confirmar la transacción.
3. Evitar que una invalidación fallida deje una autorización obsoleta durante un periodo indefinido.
4. Si no puede garantizarse la invalidación, introducir una versión de membresía o una revalidación en las operaciones sensibles.
5. Probar el caso de cambio de tenant durante una sesión activa.

No es necesario eliminar toda la caché. Es necesario definir su coherencia con los cambios de autorización.

### 3.5. Scans globales y mantenimiento

**Veredicto: HUECO CONFIRMADO EN EL DIAGNÓSTICO.**

El documento identifica dos operaciones especialmente relevantes en `service.ts`:

- `collectActiveTenants`, que puede escanear hasta 5.000 filas de `agent-settings`.
- `maintainTenant`, que puede recorrer hasta 500 elementos.

Los cálculos del miniaudit ilustran cómo podría crecer el coste al aumentar el número de tenants. Son estimaciones del documento, no mediciones de rendimiento confirmadas.

**Problema:** un proceso de mantenimiento puede convertirse en un punto de saturación si escanea repetidamente todos los datos o ejecuta las operaciones secuencialmente.

**Corrección recomendada:**

- Preferir enumeraciones de owners/tenants explícitas.
- Utilizar `scanByOwnerPrefix` cuando el trabajo deba limitarse a un tenant.
- Procesar por lotes con límites de concurrencia y tiempo.
- Añadir métricas de duración, número de filas examinadas y errores.
- Evitar que una ejecución de mantenimiento falle para todos los tenants por un error aislado.
- Comprobar que los workers no usan scans globales para recuperar tareas que deberían estar acotadas.

La optimización debe preservar la corrección del aislamiento; no debe reemplazar filtros de seguridad por heurísticas de rendimiento.

### 3.6. Row-Level Security

**Veredicto: IMPLEMENTACIÓN OPCIONAL DOCUMENTADA; ACTIVACIÓN POR DEFECTO NO CONFIRMADA.**

Existe `db-rls.ts`, pero el miniaudit indica que RLS depende de una configuración explícita.

Eso significa que no debe presentarse como una garantía efectiva de todos los despliegues.

RLS es una defensa adicional útil, pero no sustituye la autorización de aplicación ni la correcta construcción del contexto.

Antes de activarla globalmente, hay que verificar:

- El motor de base de datos y el soporte real de políticas.
- Cómo se establece el contexto de tenant por conexión o transacción.
- El comportamiento de conexiones reutilizadas en pools.
- Los caminos administrativos y de mantenimiento.
- Las migraciones y las pruebas de regresión.

**Decisión:** para el modelo clone-por-cliente, puede documentarse la política de despliegue y endurecerse la configuración. Para el modelo compartido, la activación y prueba del aislamiento en la base de datos debe formar parte de los requisitos de lanzamiento, no quedar como un flag opcional olvidado.

### 3.7. Consultas por propietario y rendimiento

**Veredicto: RIESGO DE RENDIMIENTO DOCUMENTADO; MEDICIÓN PENDIENTE.**

El miniaudit señala dos aspectos:

- `scanByOwnerPrefix` puede depender de una consulta `LIKE` cuyo patrón no aproveche adecuadamente un índice.
- Falta un índice compuesto específico para ciertos accesos por `owner` y `kind`, según el diagnóstico.

El documento menciona el coste potencial con un millón de filas, pero no se debe convertir esa estimación en una medición real sin ejecutar benchmarks.

**Acciones:**

1. Examinar las consultas SQL generadas.
2. Revisar el plan de ejecución con datos representativos.
3. Añadir un índice solo si el plan demuestra que es necesario.
4. Medir la mejora y el coste de escritura.
5. Mantener pruebas que aseguren que la optimización no elimina el filtro por propietario.

No se recomienda cambiar el esquema únicamente por una cifra estimada en un audit.

### 3.8. Cuotas por tenant

**Veredicto: PARCIAL.**

La documentación identifica `TenantQuota` y el uso de `takeForTenant` en la creación de tareas. El problema declarado es que chat, RAG y archivos no aplican de forma uniforme las cuotas por tenant.

Debe distinguirse entre:

- Límite de concurrencia por usuario.
- Rate limit por IP o usuario.
- Cuota de consumo por tenant.
- Presupuesto de tokens o llamadas a proveedores.
- Límites de almacenamiento y operaciones de archivos.

No son controles equivalentes.

**Pendiente:** unificar la política de consumo, definir las unidades de cuota y conectar cada operación relevante con el control existente, sin añadir un sistema paralelo.

Las cuotas deben aplicarse en el servidor. Una interfaz que simplemente oculte funcionalidades no constituye una cuota.

### 3.9. Identidad, membresía y permisos

**Veredicto: PREPARADO PARCIALMENTE; MULTI-TENANT COMPARTIDO PENDIENTE.**

El roadmap propone, entre otras cosas:

- `tenantId` en la sesión.
- Cambio explícito de tenant.
- Roles mediante membresía.
- `logContext.tenantId`.
- Configuración por tenant.
- Un selector de tenant en la interfaz.

En el modelo actual, algunos de estos elementos pueden no ser necesarios porque cada instalación representa una sola empresa.

En un SaaS compartido, sí son parte del modelo de seguridad. El servidor debe resolver el tenant autorizado desde una sesión autenticada y validar la membresía para la operación solicitada.

**Invariante:** nunca confiar en un `tenantId` enviado por el navegador sin comprobar que el usuario puede actuar dentro de ese tenant.

### 3.10. Logs, métricas y auditoría

**Veredicto: PENDIENTE PARA EL MODELO MULTI-TENANT COMPARTIDO.**

El diagnóstico propone incorporar `tenantId` a los logs y métricas. Es una necesidad de trazabilidad y control de consumo, pero debe hacerse con cuidado.

- Los logs deben permitir atribuir una operación al tenant sin exponer contenido sensible.
- Las métricas deben evitar cardinalidad descontrolada si hay muchos tenants.
- La auditoría debe registrar el actor y la acción cuando la operación sea relevante.
- Los datos de un tenant no deben filtrarse a otro por dashboards, exportaciones o endpoints de diagnóstico.

No debe etiquetarse cada métrica con identificadores arbitrarios sin evaluar el coste. Para métricas de alta cardinalidad, conviene separar agregados globales de registros de uso consultables por tenant.

### 3.11. Las dos ocurrencias prohibidas de `default`

**Veredicto: DOS CASOS CONCRETOS IDENTIFICADOS POR EL AUDIT; REVISIÓN DEL ESTADO ACTUAL NECESARIA.**

`audit-tenant-default.txt` documenta 63 ocurrencias permitidas y dos prohibidas, asociadas a `notification-prefs` y al enum de vistas.

No se debe reemplazar cada literal `default` indiscriminadamente. Puede representar un valor válido de configuración o un modo de funcionamiento legítimo.

La revisión debe responder para cada caso:

1. ¿Es un valor de dominio o una identidad de tenant?
2. ¿Se utiliza como fallback cuando falta contexto?
3. ¿Puede provocar que dos tenants compartan una clave?
4. ¿Es una preferencia global, de usuario o de empresa?
5. ¿Existe un test que detecte la regresión?

La condición de cierre es que no quede ningún uso prohibido en el ámbito definido por el auditor, no que desaparezca la palabra del repositorio.

## Paso 4 — Fixes aplicados y marcas reales

### Estado del bloque

`docs/miniaudits/07-aislamiento-multi-tenant/fixes.md` figura como placeholder. La ruta de seis fases está documentada, pero no se acredita en ese archivo una implementación completa del bloque 07.

Esto no significa que no haya código útil ya implementado: el Repomix contiene `TenantScopedStore`, `db-rls.ts`, resolución de tenant y modificaciones relacionadas con Files. También existen fixes de otros bloques que interactúan con este.

### Componentes y marcas documentados

| Elemento                 | Estado que puede sostenerse                                     |
| ------------------------ | --------------------------------------------------------------- |
| `TenantScopedStore`      | Existe en el snapshot                                           |
| `peel`                   | Documentado como parte del wrapper                              |
| `scanByOwnerPrefix`      | Existe en el modelo de almacenamiento                           |
| `db-rls.ts`              | Existe; activación opcional documentada                         |
| `TenantService`          | Existe; caché de cinco minutos documentada                      |
| `FILES_TENANT_STORE_V1`  | Marca presente en el constructor de Files                       |
| `TenantQuota`            | Componente referenciado por el diagnóstico                      |
| `RATE_LIMIT_TENANT_V1`   | Fix aplicado en el bloque de rate limiting, según el inventario |
| Auditor `tenant-default` | Existe; detecta casos permitidos y prohibidos                   |

### No atribuir al bloque 07 los fixes de otros bloques

`RATE_LIMIT_TENANT_V1` y otras marcas relacionadas pueden cubrir partes de la infraestructura de cuotas, pero no demuestran que todas las operaciones estén limitadas.

Del mismo modo, aceptar `TenantScopedStore` en un constructor no demuestra que todos los callers le pasen una instancia correctamente configurada.

**Recomendación documental:** sustituir el placeholder de `fixes.md` por un inventario con estas columnas:

- Marca.
- Archivo.
- Operación protegida.
- Estado: `implemented`, `wired`, `tested` o `verified`.
- Test que demuestra el comportamiento.
- Dependencias y riesgos restantes.

## Paso 5 — Estado real y cambios necesarios en el código

### Nivel A — Archivos a tocar

#### A1. `apps/server/src/app.ts`

Revisar la construcción de `Files`, `Rag`, `WorkspaceService` y los servicios que acceden a datos de empresa.

**Cambio propuesto:** asegurar que cada dependencia recibe el Store o contexto correcto para el modelo de despliegue. Evitar inyectar un Store crudo cuando el servicio necesita aislamiento por tenant.

No reescribir toda la composición de dependencias: corregir las fronteras que el inventario demuestre que están mal cableadas.

#### A2. `apps/server/src/engine/db-tenant.ts`

Verificar las operaciones de `TenantScopedStore`:

- Composición y extracción del propietario.
- Lecturas individuales y por lotes.
- Escrituras, actualizaciones y borrados.
- Scans.
- Tratamiento de identificadores ya prefijados.
- Compatibilidad con datos existentes.

**Pruebas necesarias:** impedir doble prefijado, lecturas cruzadas y escrituras sin el prefijo esperado.

#### A3. `apps/server/src/engine/service.ts`

Revisar `collectActiveTenants`, `maintainTenant` y las enumeraciones de registros.

**Cambio propuesto:** reducir scans globales repetidos y utilizar consultas acotadas por propietario o tenant cuando corresponda. Añadir lotes y límites de ejecución para mantenimiento.

No convertir un scan global legítimo de administración en uno por tenant sin comprobar primero su semántica.

#### A4. `apps/server/src/engine/files.ts`

Verificar todas las operaciones de lectura, escritura, listado y eliminación.

**Cambio propuesto:** garantizar que los registros de metadatos y los accesos al contenido del archivo mantienen el mismo contexto de propietario/tenant. Comprobar también las rutas de importación y las operaciones asíncronas.

#### A5. Módulo de RAG

Localizar el archivo exacto en el snapshot y revisar:

- Ingesta de documentos.
- Recuperación de chunks.
- Metadatos.
- Filtros por propietario.
- Cachés y resultados almacenados.
- Tareas de indexación y mantenimiento.

La búsqueda semántica no puede ser una vía alternativa para recuperar documentos de otra empresa.

#### A6. `apps/server/src/engine/db-rls.ts`

Verificar cómo se activa RLS y cómo se establece el contexto por conexión/transacción.

Para el modelo compartido, diseñar un modo de despliegue que falle de forma segura si la política de aislamiento requerida no está disponible.

#### A7. `TenantService`

Añadir coherencia de caché para cambios de membresía y asignación. Mantener el comportamiento eficiente, pero no permitir que una autorización anterior sobreviva indefinidamente.

#### A8. Workers y procesos asíncronos

Revisar `apps/server/src/engine/worker.ts` y las tareas de mantenimiento.

Toda tarea debe conservar el contexto de tenant con el que fue creada y validar ese contexto al ejecutarse. Un worker no debe depender de que exista una sesión HTTP activa.

### Nivel B — Archivos a leer antes de modificar

- Contratos de identidad y sesión.
- Configuración de base de datos.
- Resolver de tenant.
- Contratos de archivos y RAG.
- Middleware de autenticación y autorización.
- Tests de almacenamiento, Files, RAG y workers.
- Migraciones de `records` e índices.
- Auditor `tenant-default`.
- Tests de rate limit y cuotas.

### Nivel C — Auditorías y pruebas

Revisar los auditores `tenant-default`, `contracts` e `idempotency`, además de las pruebas de integración de persistencia.

La presencia de un auditor no garantiza que detecte todos los accesos indirectos. El cierre debe incluir pruebas funcionales de aislamiento.

### Nivel D — Wires externos

No hace falta añadir Redis, un proveedor de billing ni un servicio externo solo para cerrar el aislamiento del modelo clone-por-cliente.

Redis y la coordinación distribuida pasan a ser relevantes si el despliegue exige estado compartido entre réplicas. El billing multi-tenant se vuelve relevante cuando exista un SaaS compartido con cuotas y facturación por empresa.

## Paso 6 — Roadmap frente a realidad

El roadmap define como promesa: **un tenant no ve a otro; una instalación por cliente**.

Su criterio de cierre propone un test con 50 tenants concurrentes, cero usos prohibidos de `default` y RLS activa con `MULTI_TENANT_SHARED=true`.

Ese criterio debe interpretarse según el modelo de despliegue. Si la instalación sigue siendo una por cliente, el test de 50 tenants no describe por sí solo el funcionamiento productivo actual; es una prueba de preparación para el modelo compartido.

### Fase 1 — Preparar el modelo sin activarlo

Elementos propuestos en la documentación:

- `tenant_id`.
- `tenant_members`.
- `tenant_configs`.
- Cableado de `DatabaseTenantConfigResolver`.

**Objetivo:** introducir contratos y persistencia compatibles con el futuro modelo sin cambiar de golpe el comportamiento de producción.

**Condición de salida:** migraciones reversibles, compatibilidad con el despliegue actual y pruebas de regresión.

### Fase 2 — Identidad y autorización

- `tenantId` en sesión.
- Cambio explícito de tenant.
- Roles por membresía.
- `logContext.tenantId`.

**Condición de salida:** el servidor determina la identidad autorizada y valida la membresía en cada operación sensible.

### Fase 3 — Cuotas y observabilidad

- Aplicar `takeForTenant` a chat, RAG y archivos.
- Medir consumo por tenant.
- Añadir contexto de tenant a la observabilidad.
- Verificar límites y concurrencia.

**Condición de salida:** las cuotas no pueden eludirse llamando directamente a una ruta secundaria.

### Fase 4 — Billing

- `usage_events`.
- Agregación del consumo.
- Facturación por tenant.

**Condición de salida:** los eventos de consumo son atribuibles, deduplicables y conciliables. Esta fase depende de que la identidad y las cuotas estén bien definidas.

### Fase 5 — Pruebas end-to-end y selector de tenant

- Pruebas de aislamiento con muchos tenants.
- Cambio de tenant.
- Verificación de permisos.
- Pruebas de caché y revocación.

**Condición de salida:** cero accesos cruzados en la batería de pruebas definida, incluyendo operaciones asíncronas y administración.

### Fase 6 — Migrar el primer cliente a SaaS compartido

Solo después de cerrar las fases anteriores.

Debe existir un plan de migración de datos, verificación de propiedad, rollback y comprobación posterior. No se debe activar `MULTI_TENANT_SHARED=true` en producción como sustituto de esas pruebas.

## Paso 7 — Qué falta para el state of the art e integración de las 127 ideas

El nivel máximo no se alcanza añadiendo muchos identificadores de tenant a las tablas. Se alcanza garantizando que cada operación tiene una frontera de seguridad coherente, medible y comprobable.

### 7.1. Aislamiento por defecto

Cada servicio debe recibir un contexto explícito y validado. El acceso sin tenant debe reservarse a operaciones globales deliberadas, con permisos administrativos y auditoría.

### 7.2. Defensa en profundidad

Combinar:

- Autorización de aplicación.
- Almacenamiento con ámbito de tenant.
- Consultas acotadas.
- RLS cuando la infraestructura lo soporte.
- Tests de no interferencia.
- Auditoría de operaciones administrativas.

No asumir que una sola capa compensa los errores de todas las demás.

### 7.3. Cachés conscientes de la autorización

Las cachés deben considerar la identidad y el ámbito de los datos. Cambios de membresía, revocaciones y movimientos de propietario deben invalidar o versionar la información que afecta a permisos.

### 7.4. Cuotas y uso

La cuota debe medir operaciones reales y aplicarse de forma consistente. Los límites de tareas no sustituyen los límites de tokens, almacenamiento o consultas.

### 7.5. Aislamiento de workers

Las tareas asíncronas necesitan identidad de tenant persistida y validada. La recuperación de una tarea no puede perder el contexto original ni asignarle accidentalmente el tenant por defecto.

### 7.6. Rendimiento bajo carga

Utilizar índices y scans acotados cuando las mediciones los justifiquen. Medir latencia y volumen por tipo de operación; evitar que el mantenimiento global degrade las peticiones normales.

### 7.7. Cómo aterrizan las 127 ideas

| Idea o familia                   | Relación con el bloque 07                          | Decisión                                                           |
| -------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------ |
| Cuotas por tenant                | Depende de identidad y contexto fiable             | Prioridad para SaaS compartido                                     |
| Billing y consumo de agentes     | Necesita atribución inequívoca de uso              | Después de cuotas y `usage_events`                                 |
| Reputación contextual            | Debe evitar mezclar datos de empresas              | Solo con aislamiento y permisos validados                          |
| Memoria institucional            | La memoria de una empresa no debe filtrarse a otra | Integrar filtros de tenant en toda la cadena de recuperación       |
| Observabilidad por tenant        | Permite medir consumo y detectar anomalías         | Implementar con control de cardinalidad                            |
| Equipos dinámicos y colaboración | Requieren presencia y ownership coherentes         | Dependen también de los bloques 04 y 08                            |
| CRDTs y edición compartida       | No son necesarios para un deployment aislado       | Posponer hasta justificar colaboración multi-tenant en tiempo real |
| Redis para locks                 | Relevante si el estado se comparte entre réplicas  | No introducirlo solo por anticipación                              |
| SaaS billing                     | No necesario para la instalación por cliente       | Activar cuando exista el modelo comercial compartido               |

Las ideas se incorporan al bloque como requisitos de aislamiento y dependencias. No deben implementarse como sistemas duplicados que compitan con los servicios existentes.

## Paso 8 — Fixes propuestos y pruebas de cierre

### 8.1. Inventario de fixes

| ID propuesto | Cambio                                                             | Prioridad                      |
| ------------ | ------------------------------------------------------------------ | ------------------------------ |
| `07-A1`      | Auditar y corregir el cableado del Store en `app.ts`               | Crítica para SaaS compartido   |
| `07-A2`      | Completar cobertura de `TenantScopedStore` en operaciones de datos | Crítica                        |
| `07-A3`      | Revisar rutas de Files, RAG y Workspace                            | Crítica                        |
| `07-A4`      | Invalidar/versionar caché al cambiar membresía                     | Alta                           |
| `07-A5`      | Acotar scans y mantenimiento                                       | Alta                           |
| `07-A6`      | Definir política de RLS y activación por despliegue                | Crítica para modelo compartido |
| `07-A7`      | Aplicar cuotas de tenant a chat, RAG y archivos                    | Alta para SaaS                 |
| `07-A8`      | Propagar identidad de tenant a workers                             | Crítica                        |
| `07-A9`      | Corregir los dos usos prohibidos de `default`                      | Alta                           |
| `07-A10`     | Revisar índices con planes de consulta reales                      | Media                          |
| `07-A11`     | Añadir pruebas de aislamiento end-to-end                           | Crítica                        |
| `07-A12`     | Documentar `fixes.md` con marcas y evidencia                       | Alta                           |

Los identificadores `07-A1` a `07-A12` son propuestas para organizar el trabajo, no marcas ya existentes en el repositorio.

### 8.2. Pruebas mínimas

**A. Aislamiento de lectura**

Crear dos tenants con registros de la misma clase y propietarios distintos. Verificar que cada uno solo puede leer sus registros.

**B. Aislamiento de escritura**

Intentar escribir un registro con un owner ajeno y verificar que la operación se rechaza o queda bajo el ámbito autorizado, sin posibilidad de falsificar el tenant.

**C. Enumeración**

Probar `list`, `scan`, búsqueda y consultas por estado. Ningún listado de usuario debe devolver registros de otro tenant.

**D. Files y RAG**

Subir documentos con contenido identificable a dos tenants. Verificar que la recuperación de uno no puede devolver contenido del otro, ni siquiera a través de chunks, cachés o tareas de indexación.

**E. Cambio de membresía**

Cambiar un usuario de tenant, invalidar o actualizar su contexto y comprobar que no conserva acceso al ámbito anterior.

**F. Workers**

Crear una tarea para un tenant, ejecutarla de forma asíncrona y verificar que las lecturas y escrituras se mantienen dentro de su ámbito.

**G. RLS**

Cuando el motor y el despliegue la soporten, intentar acceder a registros de otro tenant incluso mediante consultas que omitan el filtro de aplicación.

**H. Scans y rendimiento**

Ejecutar el escenario de 50 tenants del roadmap y medir tiempo, número de filas examinadas, errores y consumo de recursos.

**I. Usos de `default`**

Ejecutar el auditor y verificar que los casos prohibidos desaparecen sin eliminar valores legítimos de configuración.

**J. Cuotas**

Agotar el límite de un tenant y comprobar que no afecta a los demás, y que chat, RAG, archivos y tareas respetan la misma política.

### 8.3. Condiciones de cierre

El bloque no debe marcarse como terminado hasta demostrar:

- Ninguna lectura o escritura cruzada.
- Ninguna ruta sensible que dependa de un tenant arbitrario enviado por el cliente.
- Todas las dependencias de almacenamiento correctamente acotadas.
- Workers y tareas asíncronas con contexto validado.
- Cachés coherentes con membresías y revocaciones.
- Cuotas aplicadas en las operaciones incluidas en el alcance.
- Auditoría de `default` sin falsos positivos relevantes.
- Pruebas de aislamiento repetibles y ejecutadas en CI.

## Paso 9 — Diagnóstico honesto

### Confirmado

- El modelo operativo previsto es clone-por-cliente.
- Existe `TenantScopedStore`.
- Existe `peel` y se documenta `scanByOwnerPrefix`.
- Existe `db-rls.ts`, con activación opcional documentada.
- Existe `TenantService` con caché de cinco minutos.
- El auditor documenta 63 usos permitidos y dos prohibidos de `default`.
- Hay una ruta de seis fases hacia un modelo SaaS multi-tenant.
- El constructor de Files acepta `Store` o `TenantScopedStore` en el snapshot.

### Confirmado como hueco documental o de diseño

- `fixes.md` del bloque 07 sigue siendo un placeholder.
- RLS no se describe como activa por defecto.
- El diagnóstico señala scans globales de mantenimiento.
- Se identifican rutas de Files, RAG y Workspace que deben comprobarse con respecto al Store utilizado.
- La caché de tenant necesita una política de invalidación o coherencia.
- No se acredita una batería completa de pruebas con muchos tenants.
- Cuotas, métricas y contexto de tenant necesitan completarse para el modelo compartido.

### Parcial

- `TenantScopedStore`: existe, pero falta demostrar que cubre todos los caminos.
- Files: el constructor está adaptado, pero falta verificar el cableado de todos los callers.
- Cuotas: existe `TenantQuota`, pero la cobertura de todas las operaciones no está demostrada.
- Seguridad de la base de datos: existe la integración RLS, pero su activación y cobertura dependen del despliegue.
- Auditoría de `default`: hay un resultado documentado, pero hay que volver a ejecutarla sobre el checkout que se vaya a desplegar.

### No verificado

- La ausencia total de fugas con 50 tenants concurrentes.
- Los planes de consulta y la magnitud real de los costes de los scans.
- La invalidación de caché en todos los cambios de membresía.
- La propagación completa del tenant a workers y operaciones indirectas.
- La cobertura real de los tests de RLS.

### Bloqueado por decisiones de arquitectura

- Billing multi-tenant completo, si el producto sigue desplegándose por cliente.
- Selector de tenant, si una instalación solo representa una empresa.
- Redis o locks distribuidos, si no existe un estado compartido entre réplicas.
- Colaboración CRDT, si no se requiere edición simultánea entre usuarios de una instalación compartida.

### Conclusión

**El repositorio tiene una base de aislamiento útil, pero el bloque 07 no debe considerarse cerrado para SaaS compartido.** La prioridad no es añadir de inmediato billing, Redis o CRDTs: es cerrar las fronteras del Store, verificar Files/RAG/Workspace, asegurar workers y cachés, definir RLS y demostrar el aislamiento con pruebas end-to-end.

Para el modelo actual de una instalación por cliente, el objetivo es mantener el aislamiento operacional y eliminar los usos prohibidos detectados. Para evolucionar a SaaS multi-tenant, las seis fases del roadmap son la secuencia correcta de trabajo, con la seguridad como requisito de salida de cada fase.

**Siguiente bloque:** REAUDIT 08 — Bus de eventos.

Separa claramente los dos modelos de despliegueAñade una matriz de cobertura por rutaConvierte los fixes en un plan ejecutable