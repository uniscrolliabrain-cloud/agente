# Convergencia de las seis ramas

La unidad de integración propuesta es una operación observada desde la revisión aprobada hasta la representación entregada a una persona. Las seis ramas tienen estados de implementación distintos. Trans01 contiene código de claim y outbox ausente en la canónica. Trans05 hereda Trans02 y le añade once documentos. Un contrato escrito contra Trans05 puede depender de código que Trans06 aún no incorpora. [Comparación de rutas por blob](MATRIZ-DE-BLOBS.md)

## Contratos y responsabilidades propuestos

| Frontera | Productor y responsable de escritura | Consumidor | Regla de integración |
|---|---|---|---|
| Intención autenticada | Trans02 registra actor, hilo y entradas humanas | Trans01 asocia propuesta y revisión | La pertenencia y la delegación se verifican en la decisión. Una persona conversacional no sustituye al principal. |
| Decisión y despacho | Trans01 mantiene actions, approval-requests y action-dispatch | Trans03 recibe la operación autorizada | Vincular el intento a revisión, conexión efectiva y scope permitido. Registrar el resultado local independientemente del transporte. |
| Observación externa | Trans03 normaliza acuse, confirmación y resultado desconocido | Trans01 mantiene el receipt y la reconciliación | Registrar lo observado con referencia del proveedor. Repetir una observación debe ser idempotente. La repetición de un envío requiere una decisión propia. |
| Hecho y proyección | Trans02 verifica la procedencia antes de actualizar la proyección | Trans05 y Trans06 usan referencias revisadas | Un resultado ambiguo conserva incertidumbre durante la proyección. Verificar por separado que existe un acuse y que se materializó la operación empresarial. |
| Contexto autorizado | Trans02 posee la resolución y la serialización de contexto | Trans05 aporta anclas y candidatos narrativos, Trans06 aporta evaluaciones experimentales | Un solo presupuesto de tokens y una sola decisión final sobre qué se entrega. Revalidar política, licencia y revisión después de preparar derivados. |
| Evidencia de ejecución | Trans04 registra revisión probada, comandos, resultados y cobertura | Los seis responsables revisan los gates | Una prueba omitida o no aplicable permanece identificable. La activación necesita el nivel de prueba correspondiente al contrato. |

## Catorce pruebas de integración propuestas

Las filas son especificaciones de pruebas pendientes. El oráculo se comprueba en almacenamiento y desde el último consumidor del circuito.

| Circuito y condición inicial | Fallo intercalado | Recuperación y observación exigida |
|---|---|---|
| 1. Usuario autorizado registra intención y aprueba revisión R | Entra una corrección R+1 antes del claim | La revisión antigua se rechaza. En el caso de control, el ganador produce una decisión y una intención de despacho vinculadas a R. |
| 2. Adaptador observa aceptación y Trans01 emite receipt | La proyección recibe dos veces el mismo evento y después una confirmación | Una observación por identidad causal. El grafo distingue ambos estados y Slow conserva referencia al receipt correspondiente. |
| 3. Fast pide contexto con dos fuentes autorizadas | Una pierde vigencia durante la preparación | El ensamblador regenera contexto bajo la revisión vigente. Comparar referencias y texto final y comprobar el presupuesto efectivo. |
| 4. Humano corrige una afirmación usada en una card y un brief | La invalidación asíncrona se retrasa | Resolver a revisión actual en la lectura. La corrección excluye el derivado anterior antes de que el job de limpieza termine. |
| 5. Se retira licencia o membresía durante un stream | Quedaba texto en el búfer de la aplicación | Suprimir nuevas emisiones que aún controla el servidor. Registrar hasta qué punto se entregó. Probar la siguiente lectura por el mismo actor y por otro. |
| 6. Se ha enviado una escritura al proveedor | La conexión termina antes del acuse | Persistir resultado desconocido, comunicarlo a Fast y reconciliar por referencia cuando sea posible. Contar envíos reales del doble de prueba. |
| 7. El consumidor ya materializó el evento | Se pierde su ACK y se repite el mensaje | Inbox y proyección deben converger al mismo resultado. Verificar ausencia de envío adicional y que la posición del consumidor avanza. |
| 8. Un hilo antiguo declara una restricción humana | Llegan más registros que la ventana reciente y cambia el permiso de una fuente | Recuperar el ancla vigente por referencia, retirar la skill dependiente y comparar el brief resultante con las decisiones humanas trazables. |
| 9. Cambia una entidad y afecta a dos niveles organizativos | Un nivel mejora según su criterio y otro empeora | Preservar ambos juicios y su escala. Verificar que la evaluación pura produce cero comandos empresariales. |
| 10. Una plantilla compila dos empresas con criterios distintos | La segunda instalación se corta después de reservar recursos | Reanudar contra revisión de bundle. Comparar manifiesto deseado con capacidades realmente instaladas y las operaciones disponibles por tenant. |
| 11. Se inicia chat autorizado con trabajo durable pendiente | Slow o JEV queda indisponible | Fast comunica el estado ya observado. Workflows autorizados conservan su avance y las propuestas que requieren clasificación quedan pendientes. |
| 12. Worker sostiene un lease sobre una operación | Caduca y llega una confirmación tardía del worker anterior | Aplicar fence al write local, conservar evidencia externa correlacionada y reconciliar sin duplicar el efecto. |
| 13. Dos usuarios y dos empresas comparten ids locales de prueba | Un usuario pierde membresía en una organización | Desde rol SQL restringido y rutas reales, comprobar aislamiento de filas, selección contextual y conteos. Verificar acceso legítimo en los controles positivos. |
| 14. Gate recibe evidencia local, SQL y del proveedor | Falta un target y aparece un log de otra revisión | Rechazar la certificación conjunta. Mantener disponibles resultados parciales con su nivel y registrar exactamente qué falta repetir. |

## Oleadas, reservas y supervisión

1. Cada responsable parte del SHA fijado y compara los blobs que va a consumir. El supervisor registra para cada superficie compartida la rama escritora, el blob de entrada, el cambio de ABI esperado y el consumidor que debe revisar el resultado. Ante movimiento del blob, caduca la reserva y se revisa el delta.
2. En paralelo, Trans01 prepara las carreras de decisión, Trans02 las pruebas de contexto, Trans03 la matriz de respuestas sintéticas, Trans04 el lector del manifiesto, Trans05 la recuperación por referencia y Trans06 las evaluaciones puras. Las pruebas de contrato que necesitan un productor pendiente deben informar dependencia ausente.
3. Trans01 fija la semántica de decisión y receipt con Trans03 y Trans02. Trans02 fija la semántica de referencia con Trans05 y Trans06. Trans04 registra implementaciones y requisitos de evidencia desde la primera oleada. Reservar individualmente app.ts, db.ts y paquetes de dominio cuando sus respectivos cambios lleguen al montaje.
4. Habilitar primero los circuitos con efectos locales reversibles. Para efectos externos, demostrar reconciliación bajo pérdida de ACK, revisión de conexión y revocación. Para contexto, probar retirada de fuentes tanto en preparación como en entrega. Una rama puede terminar sus pruebas puras con la activación integrada pendiente.
5. El supervisor verifica manifiesto y diferencias frente al último SHA integrado. El fundador resuelve nuevos axiomas, criterios de las empresas piloto y autorizaciones de publicación operativa. La auditoría documental mantiene abiertos los ensayos reales de Postgres, sandbox de proveedor y dogfooding.

## Riesgos pendientes

La correlación de un receipt tardío con un intento antiguo depende del contrato real del proveedor. Un fence local no anula una operación en tránsito. Las pruebas con datos sintéticos no estiman la pertinencia narrativa para una empresa real. Mantener como decisiones abiertas la evidencia mínima para confirmar cada familia de operaciones y el beneficio medido del evaluador multiescala.
