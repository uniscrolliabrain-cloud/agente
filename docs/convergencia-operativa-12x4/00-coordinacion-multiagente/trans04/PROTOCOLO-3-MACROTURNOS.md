# Protocolo de ejecución en tres macroturnos — Freebuff y agentes de código

Propuesta de revisión del protocolo anterior, activada únicamente cuando el founder autorice explícitamente M1/M2/M3. No invalida decisiones NO_GO ni autoriza saltar dependencias. Las seis barreras técnicas B1–B6 permanecen como checkpoints persistentes; se reducen a tres paradas conversacionales, no a tres controles técnicos.

M1: reconciliar T01 existente, completar T02 (F01–03), checkpoint B1 y B2. STOP al finalizar trabajo seguro de M1.
M2: T03 y T04 (F04–12), checkpoint B3 antes de owner real y B4 antes de integración final. STOP al finalizar trabajo seguro de M2.
M3: T05 y T06 (P3/P4 todas las fases), checkpoint B5 y B6. STOP final.
En B1/B3/B5 no pedir autorización conversacional adicional para trabajo independiente ya autorizado por macroturno; si falta contrato o gate, marcar BLOCKED_DEPENDENCY y continuar lo independiente. No integrar ni activar dependencias no aprobadas. B2/B4/B6 requieren revisión combinada del supervisor. Owner real, efectos externos, deploy, merge y cierre de ramas requieren autorización específica.

## Algoritmo obligatorio
1. Verificar repo, rama exacta, HEAD y git status; no reset/force push. Leer HANDOFF, TURNOS, BITACORA, revisiones y especificaciones propias; consultar campaña general en lectura y documentación agntia-demo. Reconciliar commits existentes antes de editar.
2. Crear índice de patchsets con estado PENDING/IN_PROGRESS/DONE/BLOCKED_DEPENDENCY/NOT_RUN; cada fila: ID, fase/pasada/ola, path y símbolo, contrato, test, SHA, rollback. Reservar paths no asignados mediante solicitud al owner.
3. Por patchset: abrir código y consumidores, escribir prueba roja reproducible cuando proceda, aplicar hunk mínimo, ejecutar prueba focal y typecheck, revisar diff, commit pequeño, actualizar bitácora. No crear subsistemas paralelos. No aplicar hunks ilustrativos sin cotejar firmas reales.
4. Si herramienta o contexto termina, persistir checkpoint exacto y reanudar mismo macroturno; no declarar READY. No reportar por archivo ni por commit.
5. En cada barrera técnica registrar evidencia, dependencias, gates y SHA; no declarar PASS de tests no ejecutados. Mantener NO_GO existentes. Al final del macroturno ejecutar gates disponibles, revisar ownership y publicar PR hacia campaña general sin merge.
6. Reporte único: RAMA | Mx | READY/BLOCKED/INCOMPLETE | SHA | enlace bitácora/PR | decisión necesaria. Parada extraordinaria solo riesgo de datos, secreto, efecto no autorizado o imposibilidad de trabajo seguro.

## Autoridad
Kernel gobierna, runtime ejecuta, Slow/JEV interpretan y proponen, Fast presenta contexto autorizado como LAIA por defecto. Persona no es principal. Mantener V1 hasta paridad; no UX/demo, no secrets, no nuevos buses/registries/dispatchers. Los contratos compartidos son responsabilidad de sus propietarios. Las pruebas simuladas no certifican proveedores reales.
