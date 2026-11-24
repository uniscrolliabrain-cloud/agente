# Campaña · Estudio de operaciones ACME

## Orden y gates

Este documento se crea y se commitea **antes del código de la demo**, junto con la auditoría y reglas visuales. Baseline: landing desplegada `113dcb7`.

| Etapa | Entrega | Criterio de salida |
| --- | --- | --- |
| C0 · Auditoría | Inventario de datos, rutas, backend, mock, riesgo y rama | Fuentes contrastadas, baseline acotada ejecutada, docs en GitHub |
| C1 · Identidad | Tokens scoped y guía para agentes | Manrope/Fraunces, marfil, marca original; landing intacta |
| C2 · Modelo demo | Fixture ACME coherente + reducer único | Selección/reloj/filtros/edición sin API; reset reproducible |
| C3 · Inspector y visualizador | Crear/editar, Kanban/Grafo/Digital Twin/Empresa 360 | Selección compartida; humano/agente/proyecto/cliente navegables; ninguna pestaña vacía |
| C4 · Timeline | Pistas de actores, procesos, proyectos, entradas y riesgos/aprobaciones | Reloj único, seek/play/pause/presente, capas plegables y selección sincronizada |
| C5 · Integración y acabado | Entrada en shell actual, responsive y movimiento | Sin segundo sidebar, foco/teclado, reducción de movimiento, scroll contenido y no hueco muerto |
| C6 · Verificación | Tests de modelo, build, typecheck, revisión visual y reporte | Evidencia y límites escritos; rama reviewable; no deploy de producción implícito |

## Composición comprometida

Escritorio: cabecera compacta; inspector a la izquierda (aprox. 260–300 px); gran visualizador a la derecha; timeline en toda la anchura debajo. La primera imagen inspira las pistas y la tercera la composición superior. Evitar el hueco de la segunda. La landing gobierna color, tipografía y movimiento, no el tamaño de las letras del área de trabajo. Un acento violeta único enlaza elemento seleccionado, inspector y bloque temporal.

Móvil: controles simplificados, visualizador primero, inspector accesible, timeline con desplazamiento propio; nunca encoger escritorio entero. Cada control tiene acción comprobable; sin exportaciones ficticias ni toasts de ejecución real.

## Límites de la demo

Empresa inventada ACME, actores y operaciones inventados. Estado en memoria, reinicio explícito y recarga restablece escenario. Crear tarea/evento/proyecto/SOP produce una actividad de demostración, no entidades del backend. Cambiar responsable, estado y horario solo modifica ese escenario. Modo observar deshabilita edición; Game Master habilita intervención **simulada**. Pasado/presente/futuro describe la posición del reloj respecto al presente fijo del escenario, no el estado histórico de producción. No conexiones externas, no notificaciones a terceros ni persistencia privada.

## Archivos previstos

- `apps/web/src/workspaces/business-command-studio/`: componente, paneles, modelo, fixtures, estilos y guía local.
- `apps/web/src/design-system/agntia-tokens.css`: valores tomados de landing, opt-in.
- `apps/web/src/App.tsx` y `components/SidebarV2.tsx`: entrada adicional; conservar rutas reales.
- `tests/business-command-studio.test.ts`: selección, invariantes de intervalos, guardas modo observar y coherencia de vistas.
- `docs/design/agntia-interface-standard.md`: patrón reutilizable para otros agentes.

## Frontera futura propuesta (diseño, no API implementada)

`StudioReadModel` sería una proyección con `sourceRef: {kind, id}`, tenant obtenido de sesión, actores autorizados, relaciones y rangos planned/actual/forecast. El frontend la consume a través de un proveedor; el actual proveedor es exclusivamente demo. Los futuros comandos (`assign`, `changeStage`, `reschedule`, `requestApproval`) necesitarán sourceRef, expectedVersion e idempotencyKey, y se resolverán en servicios existentes. Primero mapear Assignment/Project/Linear/Trello; no crear una tabla paralela llamada StudioTask. SSE notificará invalidaciones/revisión con cursor; no tratar sus conteos por hora como intervalos de trabajo.

## Revisión y rollback

Publicar la rama y un informe de resultados. No sustituir automáticamente el inicio real ni desplegar esta campaña por una autorización antigua de deploy de la landing. Revertir el commit de integración retira la entrada demo sin migraciones ni cambios de backend. Una futura sustitución del centro real exige campaña aparte con pruebas de autorización y migración de navegación.
