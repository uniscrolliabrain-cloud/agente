# T02 · Reconciliación de B1 y contrato de integración

Base de trabajo `46dca6ba`, sincronizada con `origin/trans02` después de `git fetch origin`. Resolución del supervisor en `origin/campaign/convergencia-operativa-12x4@d341f14f`. Las referencias de los otros agentes se consultaron mediante Git en lectura.

| Fuente | Contraste con trans02 y el código | Resolución o dependencia |
|---|---|---|
| Trans01 `335e0d4a`, auditoría, contratos y evidencia | El bus 1.0 usa `owner` y tiene causalidad opcional. El sink y el proyector ya existen. Un evento terminal de tarea no prueba por sí solo el efecto empresarial. En `app.ts` se compone el runtime y `conversation.ts::run` mantiene la delegación V2 existente. | T01-R01 / T02-01/02. Trans01 publicará extensión compatible y verificador de receipts. El bridge local deniega por defecto y requiere un verificador. No incorporar el worker C05 tal cual: su allowlist de nombres y el cotejo con `owner` pueden admitir eventos que no acreditan un resultado. Reusar el cursor y el inbox una vez acordado el contrato. |
| Trans03 `1143d702`, T01-B1 y bitácora | El receipt de negocio debe identificar generación del binding y conciliación de un resultado ambiguo. `jev-classifier.ts` y `jev-egress.ts` ya manejan concesión minimizada, cuota, revisión y contabilización. | SOL-03-02 / T02-03. El catálogo de capacidades se acuerda con Trans01. Reusar el puerto existente de clasificación y dejar el adaptador externo apagado hasta aprobar transporte y consentimiento. La clasificación no convierte resultados ambiguos en hechos. |
| trans04 `a48b79e9`; entrega B1 efectiva en `Trans04@124773c0`, confirmada por resolución | Baseline distingue 9/10 por IPC de 9/10 por timeouts en tasks-reassign. H02 pide instrumentar runtime, workers y contexto. El registro Prometheus ya existe. | T04-H02 / T02-04. Acordar la interfaz no bloqueante. Un ACK del servidor no es recepción del navegador; medir etapas por separado. Sin collector, segunda instancia de métricas ni etiquetas de tenant, actor, receipt o contenido. |
| trans02 `46dca6ba`, T01 | Fast ya consume `context.prepared`, Slow tiene su cola y JEV tiene un contrato propio. El ranking de atención usaba las mismas señales pero omitía el término léxico del snapshot. | Usar la misma función de puntuación y conservar los presupuestos y ACL de cada llamada. Versionar las nuevas selecciones de atención. El camino Fast conserva lectura local y prompt LAIA. |

## Orden de los patchsets y rollback

1. **Selector y binding C06.** Extraído de `54f7fbfe` el adaptador y sus regresiones de callback extraído, clon por petición y dos owners. Sin cambio de factory ni registro de ruta. Antes de montar, Trans01 debe acordar que el único selector tome actor y tenant autenticados. Matriz HTTP: local opt-in usa V2 y un solo stream, local opt-out usa V1, remoto conserva su puerto autorizado y no cae a un backend alternativo por error, revocación o ausencia de scope falla cerrado. Probar persistencia única y fin de stream contra el SHA combinado. Evidencia actual de HTTP C05 local está en B1; el candidato y la base conservan opt-out V1 y AG-UI explícito en fixtures HTTP; queda pendiente repetir la matriz completa sobre el montaje combinado.
2. **Observación.** Extraído solo el bridge a `SlowCognitionQueue.enqueue`. Rechaza evidencia ajena, derivada identificable o caducada por contexto, exige verificación previa y define una clave estable por tenant, actor, propósito, revisión de política, operación y revisión de fuente. Los prefijos son defensa adicional; el filtro causal definitivo corresponde al verificador del envelope. Sin consumidor activo, migración ni cuota nueva. P03b pendiente del tipo de receipt, identidad y exclusiones acordadas. Para la prueba integrada, ejecutar dos workers y revocar entre admisión y enqueue; verificar que la cuota, el job y el cursor confirman o vuelven atrás juntos.
3. **Slow/JEV y evidencia.** Contrastados los clasificadores, egress, runtime outcome y pruebas existentes. JEV puede emitir una propuesta con receipt de su propio gasto. Se mantiene la comprobación actual del receipt terminal Slow, que acredita ese trabajo. Pendiente el verificador específico de cada ejecutor para proyectar hechos empresariales. Probar entradas falsas, revocación, llamada ambigua y aislamiento con Postgres restringido en el SHA integrado.
4. **Fast y atención.** Puntuación compartida con el snapshot preparado. El runtime descarta emisiones posteriores al aborto y vuelve a validar el snapshot antes del recibo de finalización. LAIA sigue como presentación por defecto. `resolveSkin` solo consulta el registro por tenant; no decide autorización del actor. Antes de permitir otra persona, Trans01 debe especificar el origen de confianza del selector, el permiso y la revocación. Probar una persona autorizada y otra denegada con el mismo actor, tenant, propósito, política y permisos; mantener `forwardedProps` fuera de la decisión.
5. **Rollback.** Los componentes sin montaje se pueden retirar sin cambios de estado. Revertir la versión de atención y su función de puntuación conserva snapshots y selecciones persistidos. En integración futura, desactivar montaje y consumo por tenant conservando evidencia, cursor y dedupe.

## Diagnóstico de voz C04

`c8293e8` ejecuta `monitor.unref()` en el coordinador. La prueba de interrupción desde el otro coordinador espera el callback de abort del proveedor. Cuando ese intervalo es el único trabajo programado, Node 22 puede finalizar el proceso con la promesa pendiente. El archivo nuevo de C04 no está en la base de trabajo. Se probó en una exportación temporal una espera referenciada con plazo de 5 s, limpieza del temporizador y liberación del proveedor en `finally`, conservando las aserciones de época, ausencia de salida y ausencia de persistencia tardía. El montaje de voz y el delta de C04 requieren reconciliación separada.

Propuesta para el test de C04 una vez incorporado su caso en la rama de integración. Mantener el intervalo de producción sin referencia y la aserción de salida tardía:

```ts
let abortDeadline: ReturnType<typeof setTimeout> | undefined;
try {
  await Promise.race([
    providerAborted,
    new Promise<never>((_, reject) => {
      abortDeadline = setTimeout(() => reject(Error("Provider abort was not observed")), 5000);
    }),
  ]);
} finally {
  clearTimeout(abortDeadline);
  release();
  await assert.rejects(render, /VOICE_STALE_EPOCH/);
}
```

La variación pasó 5/5 en Node 22.23.5 con el archivo completo de C04. El plazo es local a la espera de la señal y no cambia el timeout global.
