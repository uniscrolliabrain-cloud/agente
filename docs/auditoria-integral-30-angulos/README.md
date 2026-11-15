# Auditoría integral AgntiaPro — 30 ángulos

> Inicio 2026-11-15 · Rama `docs/audit-30-dominios-runtime-20261115` · SHA base `54b8d5407a8576459448c4d059a877297d18ca7a` · **Documentación de arranque, no certificación**.

## Decisiones del fundador (fuente de verdad)

1. Finalizar primero las puntas de los 15 repositorios; no intervenir los hijos desde esta rama.
2. Instalar y cablear cada hijo en `agente` uno por uno, empezando preferentemente por ciberseguridad; crear el dominio padre, observar, probar transversalmente y usarlo manualmente antes de sumar inteligencia.
3. **El LLM propone; el kernel autoriza; el runtime ejecuta.** SOPs, skills, pipelines, workers y efectos pertenecen al runtime, no al agente conversacional.
4. Dos motores API LLM: **fast** para Laia y demás agentes de conversación; **slow** para razonamiento estructurado del runtime. No insertar slow en la ruta crítica del avatar.
5. Voz Anam y chat textual utilizan **el mismo harness propio**, identidad y memoria; Anam es canal audiovisual intercambiable. Probar su LLM integrado solo como benchmark opcional.
6. Laia y finanzas son agentes conversacionales personalizados, no orquestadores técnicos. Tarjetas de contexto empresarial/metadatos de hasta ~1000 tokens precargadas, preferentemente deltas; las reglas técnicas se validan fuera del LLM.
7. El fast puede hablar de una solicitud pendiente, pero solo afirmar ejecución o resultados tras confirmación del runtime. Barge-in cancela voz, no tareas empresariales aceptadas.
8. Todo dominio debe certificar contratos, seguridad, observabilidad, smoke, E2E, efectos, recuperación y uso humano antes de declararse operativo.

## Hallazgos preliminares sustentados en código

- `apps/server/src/engine/policy/engine.ts`: `can()` permite cuando el rol no declara permisos; evaluar alcance real del bypass y corregir antes de efectos.
- `apps/server/src/engine/execution/executor.ts`: puede devolver `succeeded` con pasos omitidos; definir éxito de negocio por pasos obligatorios.
- `apps/server/src/engine/notifications-stream.ts`: lee `x-user-id`; verificar autenticación real y evitar suplantación.
- `packages/domain/src/capability.ts`: `inputs`/`outputs` son registros de `unknown`; tipar cada operación en ejecución.
- `packages/domain/src/sop.ts`: herramientas enum cerrado, pero `params` genéricos.
- `apps/server/src/engine/events/replay.ts`: consulta/relectura de eventos, no prueba por sí sola reconstrucción completa ni replay de efectos.
- `docs/08-auditorias/latencia-anam-2026-11-11.md`: auditoría previa reporta ausencia de Anam/ElevenLabs integrados en aquel SHA, fast/slow existentes y 8–12 round trips en caliente, 15–25 en frío antes del primer token (estimaciones; medir en la revisión actual).

## Índice de los 30 informes

- [01-inventario-y-verdad-del-codigo](./01-inventario-y-verdad-del-codigo/INFORME.md)
- [02-arquitectura-tres-planos](./02-arquitectura-tres-planos/INFORME.md)
- [03-harness-conversacional](./03-harness-conversacional/INFORME.md)
- [04-latencia-anam](./04-latencia-anam/INFORME.md)
- [05-motor-fast-llm](./05-motor-fast-llm/INFORME.md)
- [06-motor-slow-llm](./06-motor-slow-llm/INFORME.md)
- [07-tarjetas-contexto](./07-tarjetas-contexto/INFORME.md)
- [08-perfiles-laia-y-agentes](./08-perfiles-laia-y-agentes/INFORME.md)
- [09-intent-bridge](./09-intent-bridge/INFORME.md)
- [10-kernel-autoridad](./10-kernel-autoridad/INFORME.md)
- [11-identidad-multitenant](./11-identidad-multitenant/INFORME.md)
- [12-aprobaciones-mandatos](./12-aprobaciones-mandatos/INFORME.md)
- [13-catalogo-capacidades](./13-catalogo-capacidades/INFORME.md)
- [14-sops-tipados](./14-sops-tipados/INFORME.md)
- [15-skills-tipadas](./15-skills-tipadas/INFORME.md)
- [16-pipelines-dag](./16-pipelines-dag/INFORME.md)
- [17-workers-colas](./17-workers-colas/INFORME.md)
- [18-efectos-idempotencia](./18-efectos-idempotencia/INFORME.md)
- [19-bus-eventos](./19-bus-eventos/INFORME.md)
- [20-observabilidad](./20-observabilidad/INFORME.md)
- [21-replay-reparacion](./21-replay-reparacion/INFORME.md)
- [22-presenter-notificaciones](./22-presenter-notificaciones/INFORME.md)
- [23-dominio-ciberseguridad](./23-dominio-ciberseguridad/INFORME.md)
- [24-fabrica-repos-hijos](./24-fabrica-repos-hijos/INFORME.md)
- [25-dominio-finanzas](./25-dominio-finanzas/INFORME.md)
- [26-ui-workspaces](./26-ui-workspaces/INFORME.md)
- [27-memoria-rag](./27-memoria-rag/INFORME.md)
- [28-seguridad-privacidad](./28-seguridad-privacidad/INFORME.md)
- [29-testing-certificacion](./29-testing-certificacion/INFORME.md)
- [30-release-operacion](./30-release-operacion/INFORME.md)

## Protocolo de ampliación

Cada informe debe incorporar: árbol real de archivos, SHA/ramas, mapa de llamadas, evidencias con líneas, estado existente/parcial/ausente/no comprobado, riesgos P0–P3, contratos propuestos, patchsets granulares, pruebas negativas y positivas, métricas, dependencias, rollback y reporte de ejecución. **No tratar hipótesis como hechos.** Mantener un reporte por campaña con desviaciones y aprendizajes.

## Orden recomendado

- **Ahora:** auditar sin reescribir; corregir P0 al habilitar efectos; completar repos hijos fuera de esta rama.
- **Primer vertical:** ciberseguridad (23), con soporte de 09–22 y 28–29.
- **Después:** certificar cada repo y su dominio; perfilar y medir la ruta fast de Anam (03–08, 22, 27).
- **Luego:** acoplar slow LLM al runtime verificado; incorporar agentes conversacionales personalizados sin mover la autoridad.

## Estado de ejecución

Se han creado 30 informes iniciales y este índice. **No se ha ejecutado typecheck, test, build, smoke, despliegue ni integración con los repos hijos.** Ninguna conclusión debe presentarse como certificación de producción.
