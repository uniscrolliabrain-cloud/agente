# NC-P00 — cierre de base compartida antes del trabajo del vertical

Decisión de Alfonso: 2026-10-30. Estado del acuerdo: aprobado por el propietario; ejecución y aceptación técnica pendientes. No acredita fixes realizados.

## Objetivo

Resolver cuanto antes y una sola vez los defectos de infraestructura que necesitan ambas campañas. La fase 0 del equipo del núcleo incluye inventario, contratos, fixes compartidos y traspaso técnico. El vertical no modifica esos mismos archivos mientras están reservados. Puede avanzar en producto, documentación y módulos exclusivos contra los contratos acordados.

Este acuerdo modifica la prioridad anterior del handoff: jefe NC implementa/integrará la base común, jefe VS aporta requisitos, revisa y acepta el traspaso. Se requiere evidencia antes de llamar cerrado un archivo. No se espera a terminar NC-01/02/03 para reanudar el vertical.

## NC-P00a — acuerdo operativo corto

1. Registrar SHA de main y ramas/PRs activas de ambos equipos. Preguntar al jefe VS por cambios no publicados si no son visibles. Si Freebuff ya implementó parte de VS-01, conservar y revisar sus commits: no sobrescribir, reimplementar ni descartarlos por cambiar la asignación.
2. Crear FILE-OWNERSHIP.md con paths exactos, escritor NC asignado, consumidores, branch/PR, reserva y criterio de liberación. El jefe VS identifica qué necesita de cada path. La reserva documental no es un lock automático.
3. Crear ARCHITECTURE-MAP.md, CONTRACT-CANDIDATES.md, BRIDGE-REQUESTS.md y PATCHSETS.md: llamadas y firmas reales, contratos existentes reutilizados y mínimos cambios comunes.
4. Pactar pruebas de aceptación, compatibilidad y tratamiento de registros antiguos antes de editar. Las cuestiones que no bloquean a ambos equipos salen de fase 0 para no convertirla en la campaña entera.

## NC-P00b — fixes y base común implementada

Orden prioritario, sujeto a inspección de código:

1. Contexto durable de tenant/actor: creación -> reclamación -> reanudación -> reinicio. Consumo del mismo contexto por memoria/conexiones, sin reconstrucción ambigua desde membership primaria ni fallback system/default.
2. Persistencia/eventos: identificar límites de confirmación, duplicados y recuperación que bloqueen a ambos. Corregir el fallo compartido concreto; no reescribir todo EventBus/Store ni prometer atomicidad no soportada. Separar la durabilidad cognitiva avanzada que puede esperar NC-P02.
3. Puertos mínimos de contexto/memoria: firmas compatibles para que el vertical pueda seguir funcionando y el núcleo pueda añadirse sin otra reescritura. No crear hooks vacíos sin consumidor de prueba verificable ni activar nuevas capacidades.
4. Compatibilidad de composición en service/app/config y contratos: cambios mínimos, comportamiento anterior preservado con capacidades cognitivas ausentes/desactivadas. No aprovechar para migrar auth, motor DB o modelo de despliegue.

Candidatos de reserva, a concretar por archivo y necesidad: engine/service.ts, worker.ts, model.ts, model-chain.ts, conversation.ts, context/**; tenant-scope.ts, db.ts, db-tenant.ts; engine/events/**; app.ts/config.ts; contratos canónicos compartidos. No editar todos por estar enumerados. Canales, OAuth, billing y lógica de producto no pasan al equipo NC por este acuerdo.

Cada patchset tiene un único escritor y PR pequeña, revisión de ambos lados y evidencia por SHA. Corregir código y entregar comportamiento observable, no solo trasladar las tareas de una tabla a otra. Copilot puede verificar el SHA según el estándar común; su resultado no reemplaza revisión de aislamiento.

## Congelación y comunicación entre equipos

- El equipo VS registra lo que ya estaba haciendo y evita nuevos cambios en los paths reservados. No se revierte trabajo para imponer la congelación.
- El jefe NC comunica alcance antes de editar, cambios de firmas antes de que se consuman y SHA de cada integración.
- El jefe VS responde con requisitos/casos límite y revisión de la entrega; no edita simultáneamente el mismo archivo.
- Usar PRs, BRIDGE-REQUESTS.md y FILE-OWNERSHIP.md como registro compartido. Alfonso ha pedido coordinación entre ambos equipos; si las herramientas permiten localizar inequívocamente el otro chat, los jefes pueden comunicar estas reservas y entregas dentro de ese alcance. Si no, Alfonso transmite el handoff; no suponer recepción ni aprobación técnica por silencio.
- Un desacuerdo de arquitectura se documenta con opciones e impacto y se eleva a Alfonso; mientras tanto se continúa por paths exclusivos.

## Criterios de cierre y liberación

La fase 0 no termina porque existan documentos. Cada conjunto de archivos se libera cuando:

- Los fixes acordados están integrados en main con SHA y PR identificados.
- Las pruebas prueban el mismo usuario en dos tenants, contexto tras reinicio/reanudación, rechazo de conexión/ámbito ajeno y compatibilidad de las rutas existentes afectadas. Fallos ajenos de base se distinguen con evidencia y no se ocultan.
- Cambios de contrato/migración y registros antiguos tienen política explícita; no se adivina contexto ausente.
- El jefe VS ha revisado el efecto sobre su campaña y registrado aceptación o pendientes concretos. El jefe NC confirma consumidor y límites de su lado.
- Se publica SHARED-FOUNDATION-CLOSURE.md: SHA base/final, paths, contratos, fixes, comandos/resultados, límites, rollback y ownership posterior.

Es posible liberar paquetes independientes de archivos de forma incremental si ambos jefes aceptan que no dependen de un fix pendiente. Esto evita bloquear todo el vertical por un componente no relacionado. Ninguna fase usa un archivo congelado hasta su liberación explícita.

Después, el vertical actualiza su branch desde main y consume el contrato integrado. El trabajo común cuenta como parte de VS-01: no se repite, pero VS-01 no se marca completo si quedan conexiones o casos propios pendientes. Los archivos compartidos siguen teniendo un escritor por ventana; el núcleo no queda cerrado para siempre ni obtiene propiedad indefinida.

## Mensaje de arranque para ambos jefes

Alfonso ha decidido que NC-P00 cierre primero la base compartida que necesitan las campañas NC y VS. Preparad juntos los documentos de fase 0 y los fixes mínimos; jefe NC implementa con reserva de paths, jefe VS aporta requisitos y revisa. Hasta el cierre y traspaso, VS no modifica los archivos reservados. Conservad cualquier trabajo previo de Freebuff y no dupliquéis VS-01. Entregad un SHA común, evidencia y acta de liberación antes de que ambos equipos vuelvan a usar esos puntos.
