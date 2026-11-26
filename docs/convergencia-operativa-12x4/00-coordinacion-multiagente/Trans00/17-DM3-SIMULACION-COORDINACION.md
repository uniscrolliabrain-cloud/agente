# Simulación documental D-M3

Ejecutada en JavaScript durante la revisión de Trans00; no carga módulos del repo ni usa PostgreSQL, CI, red de proveedores o runtime. Comprueba consistencia de un modelo mínimo de decisiones de coordinación, no comportamiento real de AgntiaPro. Resultado: 27/27 aserciones concordantes.

## Oráculo

Entrada: autorización, SHA/evidencia exactos, ownership, riesgo/efecto, dependencias pasadas, ejecución real declarada, pruebas requeridas por barrera. Si falta autorización, SHA, propietario o existe efecto no autorizado, exposición de secreto o stale HEAD: BLOCKED. Proveedor ausente y activación pretendida: BLOCKED_EXTERNAL. Dependencia no pasada: BLOCKED_DEPENDENCY. Afirmación PASS sin ejecución: NOT_RUN. Prueba faltante: INCOMPLETE. Si solo provider externo falta, scope local completo: LOCAL_PASS_EXTERNAL_BLOCKED; nunca readiness del provider. PASS_SCOPE solo en modelo. Para efectos: deny si no autorizado o revocado; accepted/unknown no resend; confirmed exige receipt exacto; retry requiere prueba positiva de no efecto, autorización vigente y binding exacto.

| Escenario | Esperado | Obtenido |
|---|---|---|
| No autorizar por publicar documentación | BLOCKED | BLOCKED |
| HEAD movido | BLOCKED | BLOCKED |
| Dos escritores o path ajeno | BLOCKED | BLOCKED |
| SHA no coincide con pruebas | BLOCKED | BLOCKED |
| Efecto externo no autorizado | BLOCKED | BLOCKED |
| Secreto expuesto | BLOCKED | BLOCKED |
| B2 intenta saltar B1 | BLOCKED_DEPENDENCY | BLOCKED_DEPENDENCY |
| B4 intenta saltar B3 | BLOCKED_DEPENDENCY | BLOCKED_DEPENDENCY |
| No test ejecutado | NOT_RUN | NOT_RUN |
| Informe parcial B6 | INCOMPLETE | INCOMPLETE |
| PG owner no prueba RLS | INCOMPLETE | INCOMPLETE |
| Restore sin prueba | INCOMPLETE | INCOMPLETE |
| Proveedor ausente sin activación, local completo | LOCAL_PASS_EXTERNAL_BLOCKED | LOCAL_PASS_EXTERNAL_BLOCKED |
| Proveedor ausente intentando activación | BLOCKED_EXTERNAL | BLOCKED_EXTERNAL |
| Unknown no resend | RECONCILE_NO_RESEND | RECONCILE_NO_RESEND |
| Accepted no resend ni confirmed | RECONCILE_NO_RESEND | RECONCILE_NO_RESEND |
| Revocado aunque hubiera receipt | DENY | DENY |
| Confirmación no vinculada | DENY | DENY |
| Confirmación exacta | RECORD_CONFIRMED | RECORD_CONFIRMED |
| Retry sin nueva autorización | DENY | DENY |
| Retry permitido con ausencia de efecto | RETRY_ELIGIBLE | RETRY_ELIGIBLE |
| Secuencia nominal B1 | PASS_SCOPE | PASS_SCOPE |
| Secuencia nominal B2 | PASS_SCOPE | PASS_SCOPE |
| Secuencia nominal B3 | PASS_SCOPE | PASS_SCOPE |
| Secuencia nominal B4 | PASS_SCOPE | PASS_SCOPE |
| Secuencia nominal B5 | PASS_SCOPE | PASS_SCOPE |
| Secuencia nominal B6 | PASS_SCOPE | PASS_SCOPE |

## Simulación manual de wiring y concurrencia

| Caso | Decisión de integración |
|---|---|
| T01 y T04 quieren hooks.ts | importar existente una vez; transferencia registrada a 04, T01 productores, no dos writers |
| T02 y T05 quieren context.ts | 02 writer; 05 fixture/corpus, una implementación de selección |
| T06 necesita alterar store de Thoughts y conversation | 01 writer; 06 funciones y tests, verificar caller de Promoter |
| T03 necesita cambiar runtime para voz | 03 adapter/coordinator, 02 runtime; 01 mount; contrato snapshot servido |
| T01 espera receipt de T03 y T03 espera ABI de T01 | publicar outcome discriminante y fixture de familia primero, test independiente; activar consumidor tras integración |
| JEV no configurado | puerto fail-closed; Fast/runtime independientes; no fallback silencioso |
| Fuente de card revocada mientras Slow infiere | validar contexto completo y dependencias en commit/serve, no solo citas; card derivada no autorizada; prueba real pendiente |
| Respuesta externa tardía tras crash | mismo intento y binding, reconciliación sin reenvío, autoridad no depende del texto de LLM |
| Restore falla a mitad | mantener estado anterior y efectos deshabilitados; revalidar DB/archivos/ledger; no certificar restore no probado |
| Main avanza después de I2 | mantener SHA de evidencia, revisar nuevo delta antes de release y reejecutar gates |
| Un agente termina con prueba roja | reportar FAIL y bloqueo, trabajo independiente continúa; no avanzar base aceptada |
| Corpus largo no llega a objetivo hipotético | medir y documentar; no inventar pesos ni cancelar la integridad del core por calidad no calibrada |
| Telemetry sink falla | error no altera efecto; señales faltantes explícitas; no metric cero falso |
| Las 6 ramas tienen green local, combinado falla | no GO; devolver conflicto a dueño y ejecutar nuevo gate conjunto |

Todos los casos manuales son análisis de protocolo, no tests realizados. Ningún efecto ni integración funcional se ejecutó. Las pruebas rojas/verdes de las 37 filas, 14 circuitos, restricted PG y backup/restore siguen pendientes sobre SHA integrado. 
