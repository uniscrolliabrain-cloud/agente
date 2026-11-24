# Protocolo de turnos largos — obligatorio

Prevalece sobre cualquier instrucción anterior de parar por oleada, patchset o informe. Un turno es una unidad de trabajo autónoma, no una respuesta de chat ni un límite temporal. Cada agente ejecuta todos los pasos de su TURNO actual, en orden, con commits pequeños y bitácora persistente. No solicita confirmación entre pasos. W0–W5 son etiquetas de dependencia, no paradas de chat.

## Barreras únicas
T01 = pasada 01 completa: inventario, scaffold documental, contratos y pruebas baseline; STOP B1 antes de código funcional. T02 = pasada 02 núcleo (fases 01–03): STOP B2 para integración de contratos, observabilidad y proveedores. T03 = pasada 02 slices (04–07): STOP B3 para integración y seguridad previa a owner real. T04 = pasada 02 extensiones (08–12): STOP B4 para integración completa. T05 = pasada 03 completa: STOP B5 para auditoría cruzada. T06 = pasada 04 completa: STOP B6 final. Todos los agentes sincronizan en las mismas seis barreras; no saltar barrera sin autorización del supervisor. El supervisor puede autorizar siguiente turno con una sola instrucción para todos. Owner real, despliegue, merge, borrado y efectos externos requieren autorización específica; si falta, dejar plan/stub y continuar trabajo independiente.

## Ejecución sin interrupciones
1. Leer HANDOFF, TURNOS, contratos y bitácora; identificar turno autorizado y SHA base.
2. Ejecutar cada paso: inspección → cambio propio (si permitido) → prueba → commit → bitácora. No emitir informes conversacionales por paso.
3. Si dependencia no disponible, registrar BLOCKED_DEPENDENCY, preparar contrato/test/stub fail-closed en superficie propia y continuar siguiente tarea independiente del mismo turno. No inventar PASS ni modificar archivos ajenos.
4. Si falla test, investigar y corregir dentro de ownership; si persiste, registrar evidencia y continuar tareas independientes. No desactivar gate.
5. Si se agota contexto/tiempo del agente, persistir checkpoint exacto (turno/paso, SHA, comandos, siguiente acción), reanudar desde ahí en siguiente invocación; no confundir límite de herramienta con barrera completada.
6. Al terminar todos los pasos posibles, ejecutar gate focalizado y gate general si disponible, revisar diff/ownership, publicar evidencia y PR hacia campaña maestra. No auto-merge. STOP únicamente en B1–B6 o si no queda trabajo seguro independiente.
7. Parada extraordinaria inmediata solo por riesgo de pérdida de datos, secreto expuesto, efecto externo no autorizado o conflicto de autoridad que impida todo avance seguro. Documentar y pedir decisión concreta, no reporte genérico.

## Único formato de chat al parar
`RAMA | Txx/Bx | READY / BLOCKED / INCOMPLETE | SHA | enlace bitácora/PR | decisión requerida (o ninguna)`. Máximo 5 líneas. No copiar logs, listas de archivos ni informes. Toda evidencia vive en GitHub. READY no equivale a PASS global: el supervisor verifica SHA combinado. Si no hay decisión requerida, esperar siguiente autorización de turno, sin nuevas preguntas. No prometer continuar en segundo plano si el entorno no lo permite.
