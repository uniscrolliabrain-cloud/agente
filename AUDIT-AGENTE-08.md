# Auditoría del agente 8 · R01

Estado: abierta en el gate general. El criterio documental de R01-A08 quedó verificado.

Inicio registrado: 7/11/26, 15:44:53 (Madrid). Base: 0c8fe81. Rama: sprint/r01-a08-fuente-despliegue.

## Preparación

- [x] Identificar la raíz de la campaña.
- [x] Leer la auditoría vecina para identificar la convención de carpetas.
- [x] Enumerar carpetas hermanas y registros de worktrees.
- [x] Crear esta bitácora provisional en la raíz.
- [x] Crear el worktree wt-r01-a08 y su rama aislada a partir de la base de R01.
- [x] Localizar el encargo y sus criterios de aceptación.
- [x] Registrar la fuente del encargo.
- [x] Trasladar esta bitácora al worktree tras el checkout.

## Stepper · 30 minutos

- [x] 00–01 · Registrar hora de inicio, rama y SHA base.
- [x] 01–02 · Confirmar el aislamiento de la rama. Se verificó el estado Git tras finalizar el checkout.
- [x] 02–03 · Leer las instrucciones locales aplicables.
- [x] 03–04 · Desglosar el entregable en criterios observables.
- [x] 04–05 · Identificar dependencias y puntos de entrada.
- [x] 05–07 · Localizar archivos candidatos y validaciones existentes.
- [x] 07–09 · Reproducir el estado inicial y anotar el resultado.
- [x] 09–10 · Sustituir los pasos genéricos por tareas concretas por archivo.
- [x] 10–14 · Aplicar el primer cambio y comprobar su efecto.
- [x] 14–17 · Revisar el primer diff y registrar la evidencia.
- [x] 17–20 · Completar los cambios restantes del alcance.
- [x] 20–22 · Verificar cada criterio de aceptación.
- [x] 22–24 · Ejecutar las comprobaciones focalizadas y registrar comandos y resultados.
- [x] 24–26 · Corregir fallos reproducibles dentro del alcance.
- [x] 26–27 · Repetir las comprobaciones afectadas.
- [x] 27–28 · Revisar el diff y el estado Git.
- [x] 28–29 · Anotar pendientes con evidencia y siguiente acción.
- [x] 29–30 · Actualizar casillas, registrar hora de cierre y resumir el entregable.

## Bitácora

- Preparación · Se detectó la convención `wt-r01-aNN`. Git registra A01, A02, A03, A04 y A06. Pendiente localizar A08 y la fuente de su encargo.

- 7/11/26, 15:44:53 · Encargo confirmado en docs/operacion/SPRINTS-10-AGENTES-10-RONDAS.md, §7, fila R1 A08. Base 0c8fe81, confirmada con la rama de medición. Git está materializando el nuevo worktree wt-r01-a08.
- Alcance de escritura: docs/04-operaciones/** y docs/archive/**. Cierre: un solo DEPLOY.md vigente y cero enlaces rotos.
- [x] Identificar las tres guías en 04-operaciones y las copias en operacion.
- [x] Comparar ambas rutas y separar contenido de despliegue, altas de cliente y runbook.
- [x] Preservar enlaces y anclas de entrada existentes.
- [x] Consolidar requisitos, configuración, comandos, backups y verificación en DEPLOY.md.
- [x] Convertir guías secundarias en referencias con el contenido específico de su tema.
- [x] Registrar duplicados y enlaces fuera de la superficie para revisión del portero.
- 7/11/26, 15:47:11 · Comparadas las guías antiguas y actuales con el workflow y los scripts de release. El DEPLOY.md antiguo ya se declara histórico. Se actualizó el DEPLOY.md canónico y se enlazaron desde él las guías de incidentes y aprovisionamiento. Se mantuvieron rutas y secciones de entrada.
- 7/11/26, 15:48:27 · Comprobación estática: 16 enlaces locales en docs/04-operaciones, incluidas anclas de Markdown, 0 rotos. Se encontraron dos ficheros llamados DEPLOY.md en la base. El de docs/operacion está marcado como histórico y apunta al vigente.
- 7/11/26, 15:49:43 · Inventario de referencias con git grep en la base. El índice y docs/README.md apuntan a la guía vigente. El handoff histórico apunta a la guía histórica. Se reemplazaron los pasos duplicados de despliegue y configuración en ONBOARDING-CLIENTE.md por enlaces canónicos.
- 7/11/26, 15:52:57 · Verificación final de documentación: 19 enlaces locales comprobados en docs/04-operaciones y el DEPLOY.md histórico, incluidos destinos y anclas. Cero rotos. Git diff --check sin hallazgos. Git status muestra cuatro archivos de producto modificados, todos dentro de docs/04-operaciones.

## Informe de entrega

- Cambio: DEPLOY.md reúne la secuencia de publicación en Fly, configuración, verificación y rollback. Los documentos de cliente, onboarding y producción remiten a esa guía.
- Evidencia antes/después: producción tenía instrucciones repartidas entre la guía canónica, las notas vigentes y una guía antigua. La ruta histórica conserva su aviso y enlace al procedimiento vigente.
- Comprobaciones pendientes del gate general: typecheck y secrets:check. La validación dirigida fue estática y no ejecutó releases ni comprobó endpoints externos.
- Publicación: git remote -v no devuelve remotos configurados.
- Petición al portero: el índice docs/INDICE-REORGANIZACION.md todavía clasifica DEPLOY.md como draft, aunque enlaza al destino correcto. Está fuera de la superficie asignada.
- Commit local: 6fa36ec. La auditoría se conserva como bitácora local en el worktree.

## Beta · 7/11/2026, 19:20:10

- [x] R01 · Verificar 19 enlaces y anclas, cero rotos.
- [x] R02 · Contrastar resolución de credencial con los casos existentes. Ejecución dirigida pendiente de resultado.
- [x] R03 · Identificar la dependencia del endpoint de Laia por automatización.
- [x] R04 · Añadir prueba HTTP de control, intención y canal.

Estado y handoff por ronda en [la ficha de A08](docs/operacion/agents/A08.md).
