# Patchsets de reconciliación de acciones

Revisión funcional de referencia: `8967243326ccf5e22224e0693ac9155ea70d9765`. Primera familia de patchsets. Los contratos descritos son candidatos de implementación pendientes de compilación. Las barreras del experimento sí se ejecutaron. [Evidencia de la carrera](EXPERIMENTO-RECONCILIACION.md)

## R1. Distinguir la decisión humana, el intento y la observación

**Situación actual.** En actions.ts, decide guarda approval-requests y action-dispatch en la misma transacción que el claim. run persiste la acción terminada con put y después llama a settleDispatch. Para un resultado ambiguo o un fallo, run actualiza de forma asíncrona approval-requests.status a rejected. Una decisión explícita de aprobar puede acabar presentada como rechazo si el proveedor deja un resultado desconocido. La tabla de auditoría conserva el acto original. Precisar primero qué lectores interpretan status como estado del ciclo de vida y cuáles lo interpretan como voluntad del decisor.

**Cambio.** Trans01 posee la semántica de la decisión. Introducir una revisión de representación que conserve la decisión original y relacione por separado el estado del intento con su evidencia. Usar el scope de almacenamiento existente, el id de acción, su hash y una identidad estable del intento de despacho. Adjudicar la identidad en la misma transacción que la decisión. La repetición de una decisión ya confirmada recupera esa identidad. Documentar la relación con taskId, connectionId y connectionGeneration. Los productores no deben sintetizar una aprobación a partir de succeeded.

**Compatibilidad.** Desplegar lector dual antes de emitir campos nuevos. Para registros anteriores, construir el historial a partir de approval-requests.payload, auditoría y acción, conservando como indeterminado cualquier conflicto sin prueba. Una migración que solo examine la columna status perdería el sentido de la decisión. Preservar el registro original. Añadir fixture de aprobación con envío fallido y fixture de denegación sin envío. Exigir que la vista distinga ambos casos, incluso con futuro reintento.

## R2. Una transacción para incorporar el resultado local

**Dependencias.** R1 aporta identidad del intento. Reutilizar ActionsStore.transaction, get y compareAndSwap del store y del wrapper de tenant. Verificar que el tipo de tx usado por ActionsStore expone estos métodos antes de ampliar el contrato. Mantener la llamada al proveedor fuera de una transacción SQL. El tiempo de espera de red convertiría el bloqueo de filas en un bloqueo de disponibilidad.

**Algoritmo candidato.** El escritor ordinario y el reconciliador deben adquirir las mismas filas en el mismo orden (acción antes de intención). Bajo PostgreSQL, usar update con predicado de revisión y estado o lectura bloqueante explícita. Un SELECT seguido de put incondicional permite volver a introducir la carrera. Toda escritura condicional sin ganador debe releer o abortar la unidad completa.

```text
aplicarObservacion(scope, accion, intento, evidencia):
  abrir transacción en el store que posee las dos filas
  comprobar correspondencia de intento, hash y binding
  si el intento ya incorporó exactamente esta observación:
      devolver estado durable
  si existe evidencia incompatible:
      conservar el conflicto para conciliación y mantener bloqueo de reenvío
  calcular transición según estado actual y clase de evidencia
  actualizar acción por CAS y comprobar el ganador
  actualizar la intención del mismo intento por CAS y comprobar el ganador
  dejar un cambio durable que pueda consumir el proyector tras el commit
  confirmar y devolver estado persistido
```

**Transiciones.** Un resultado confirmado permite terminar el intento en succeeded. Un acuse externo permite conservar accepted si la familia distingue entrega posterior. Un timeout después de enviar mantiene outcome_unknown. Una confirmación tardía puede resolver ese unknown si existe prueba vinculada al mismo intento. Un recibo de otra generación requiere revisión. Un fallo probado antes del despacho permite una nueva decisión conforme al contrato de la familia. Una evidencia de rechazo tardío que contradiga una confirmación requiere intervención.

**Alternativas.** Un segundo CAS aislado corrige un orden de carrera y deja posible caída entre writes. Un mutex de proceso no abarca otro worker. Usar la transacción local y un predicado de identidad reduce el número de mecanismos que deben coordinarse. Para eventos que ya comparten la transacción con efectos locales, reutilizar las reglas postcommit de EventBus. Verificar su compatibilidad con el sink activo antes de activar.

**Aceptación.** Ejecutar el control y ambos órdenes de la barrera de [experimento](EXPERIMENTO-RECONCILIACION.md), primero en PGlite y luego en PostgreSQL. En los tres, la acción y la intención deben converger al resultado confirmado de la misma operación, con una llamada. Si el proveedor no confirma, ambas deben describir el estado pendiente de reconciliación. Inyectar fallo de la segunda actualización, verificar rollback íntegro y repetir la observación. Contar separadamente conflictos de intento, evidencias tardías y resultados recuperados usando etiquetas acotadas.

## R3. Unificar recuperación en arranque y mantenimiento

**Montaje.** index.ts llama a recoverInterruptedActions al iniciar. AgentService.maintain llama al mismo método, luego a reconcileDispatchIntents y después recorre acciones executing. En db.ts, recoverInterruptedActions actualiza todas las filas executing sin condición de antigüedad. El arranque de una réplica no demuestra que las demás perdieran su lease. El wrapper TenantScopedStore delega la recuperación en el store subyacente.

**Cambio.** Sustituir la actualización colectiva y los barridos que compiten por un solo camino de recuperación, acotado y paginado. Los candidatos deben incluir scope, identidad de intento, revisión, edad fiable y prueba de pérdida de lease donde exista. Una solicitud lenta en proceso que mantiene vigencia sigue ejecutando. El timeout expone incertidumbre y autoriza la revisión del resultado. No autoriza reenviar. Usar reloj inyectable tanto para decidir antigüedad como para dejar timestamps.

**Estados pendientes.** La implementación actual trata cualquier acción distinta de executing como settled en el reconciliador. Definir explícitamente cómo tratar scheduled y awaiting_review en la ruta de firma diferida. Un registro anterior sin intento o sin timestamp entra en cola de revisión con una razón persistida. Evitar que registros malformados ocupen indefinidamente la primera página. Ensayar un lote con más filas inválidas que el límite y un intento vencido detrás.

**Despliegue y reversión.** Primero habilitar lecturas duales y observar candidatos en modo diagnóstico. Antes de activar el escritor común, drenar los escritores antiguos que todavía hacen put sin predicado. Conservar el historial si se desactiva el camino nuevo. Un rollback operativo suspende nuevos despachos cuando haya writers incompatibles, permite seguir leyendo y preserva las solicitudes de reconciliación. Devolver a ejecución automática solo familias que superen las pruebas de aceptación bajo un único escritor compatible.

**Bloqueos.** Antes del montaje conjunto, Trans03 debe declarar la evidencia que convierte accepted en confirmed por familia. Trans02 debe validar la representación de un outcome desconocido y de su corrección en la proyección. Trans04 debe comprobar recuperación después de caída y la salida de los runners. El trabajo puro de R1 y las barreras de R2 pueden comenzar en paralelo.
