# Handoff D-M1 → D-M2 (Trans00)

Se ha completado una primera pasada integral documental, no la preparación final. D-M2 recorre las seis campañas, todos los 37 hallazgos, 16 familias, deltas históricos, propiedad, contratos, gates y prompts. Prioridad: falsar lo que se da por seguro, no abrir nueva arquitectura. Read 01–06 y fuentes exactas. Revalidar HEADs antes de empezar. Si se actualizan diagnósticos de Codex/Astra, incorporar únicamente nueva evidencia con fuente; no reescribir inventario histórico.

## Pasos de D-M2

1. Leer diseños Astra R1–R3/C1–C3 y experimentos originales completos, más 6 informes GPT y Codex, T04-S. Inspeccionar paths/símbolos/callers por familia. Reconciliar cada propuesta original con blob vivo: en especial T01 ya contiene claim/outbox/seq y T02/05 comparte deltas; no reimplementar lo que funciona.
2. Revisar ownership candidato vs T01 contratos B1 y T04 paths. Fijar los paths exactos de las superficies compartidas, especial hooks/index/app, db/rls, circuit-breaker/inference, kernel graph vs cognition graph, leads/actions, voice/runtime, domain barrels y root manifest. No reservar indiscriminadamente carpetas.
3. Validar plan de base común: conservar main y extraer cambios funcionales autorizados desde los cuatro deltas únicos. Comprobar cambios en app/CI/deploy/lock y no tocar UX. Preparar orden de cherry-pick o patch selectivo por commit y relación de dependencias; no ejecutar merge durante documentación.
4. Clasificar 37 filas con estados de 02, dedup exacto; añadir solo evidencias de tests o inspección directa. Hacer prueba roja como tarea de ejecución si herramienta no permite correr repo. No afirmar runtime PASS. Completar contrato exacto productor/consumidor y tests de integración.
5. Refinar los tres macroturnos y seis barreras sin sustituir canónica; generar 6 prompts de ejecución versionados. En D-M3 simular fallos de integración, auditoría cruzada, rollback y handoff supervisor.
6. Registrar qué está bloqueado por credenciales/cuentas, no pedir secretos por chat. Supabase funcional (founder), no migrar. GitHub-first, Doppler opcional. Las integraciones reales requieren ABI y autorización.

## Instrucción común candidata para futuras prompts (NO autorización de ejecución)

Eres Trans0N, propietario de una superficie de AgntiaPro. Lee README y whitepaper, canónica, tu campaña original y adenda Trans00 aprobada. No sustituyas el diseño; abre el código real sobre SHA común, prueba cada defecto antes de parchear, reusa motores existentes. Fast comunica y registra intención humana, Slow propone, JEV clasifica, kernel autoriza, runtime ejecuta. Persona no es principal. Cualquier cambio ajeno se solicita a su dueño. Cada macroturno recorre toda la campaña con estrategia, diagnóstico, diseño, simulación, feedback, ejecución y reauditoría, respetando las dos barreras técnicas. Haz lo independiente, no inventes éxito para dependencias. No informar por chat hasta STOP B2/B4/B6, salvo riesgo extraordinario; persiste bitácora. Entrega SHA y evidencia. No despliegue, merge a main, owner real ni efecto externo sin autorización.

## Restricción de la preparación

Los siete documentos anteriores son candidatos de ingeniería documental. D-M1 no modifica ninguna campaña ejecutora ni fuente canónica. No hay todavía una rama de integración funcional, ni 6 prompts finales, ni gates ejecutados. No lanzar los seis agentes hasta D-M3 y aprobación del founder. 
