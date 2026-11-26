# Patchsets de selección y reutilización del contexto

Base de esta familia de cambios: `89c5925d7a30e70ff41cd81539408d8b0282b92c`. Propietario Trans02. Superficies principales: apps/server/src/engine/cognition/v2/context.ts, storage.ts y attention.ts. Consumidores afectados: runtime.ts, presenter.ts, Slow y la API de contexto. Revisar el cambio de ABI con Trans05 antes de añadir anclas al conjunto de candidatos. Los algoritmos son propuestas pendientes de implementación.

## C1. Hacer explícita la vista que cubre una selección

**Problema reproducido.** getSnapshot lee latest, ordena y valida registros, después lee el cursor de cognitive-v2.1. Una publicación que añade una card entre las dos lecturas puede dejar una selección vieja con watermark nuevo. La autorización de todas las referencias existentes no detecta una card que todavía no pertenecía a la lista inicial. [Prueba por intercalación](EXPERIMENTO-CURSOR-Y-PRESUPUESTO.md)

**Contrato.** Entrada: identidad autenticada, revisión de política, consulta, límites, versión del scorer y del serializador. Salida: refs ordenadas, segmentos derivados, cursor y estado de truncamiento sobre una vista lógica coherente. Todos los cambios de proyección capaces de modificar la selección deben participar de la versión que declara la vista. Inventariar acceso directo a CognitiveProjectionStore.apply, revoke y actualizaciones de fuente RAG antes de emplear el cursor del consumidor como única versión.

**Diseño candidato.** Cuando se haya demostrado que los escritores implicados actualizan registros y cursor en un commit, usar la siguiente lectura optimista:

```text
leer cursor inicial
obtener y autorizar candidatos
seleccionar y renderizar las revisiones
revalidar política y fuentes
leer cursor final
si los cursores difieren, descartar el material y reintentar una vez
si son iguales, guardar el cursor inicial en el snapshot
```

Un commit posterior puede hacer caducar inmediatamente la entrada de caché. La entrada conserva su posición original. Un fallo de la segunda lectura impide anunciar coherencia. Si la hipótesis de escritor único no se cumple, aplicar lectura transaccional de snapshot consistente o generación explícita compartida por todos los productores. En PostgreSQL el aislamiento predeterminado READ COMMITTED puede observar estados distintos entre dos SELECT de la misma transacción. Verificar el aislamiento efectivo y evitar extender una transacción sobre llamadas de red o verificaciones externas. La política y los consentimientos vigentes siguen revalidándose antes de entregar.

**Aceptación y despliegue.** Bajo una barrera entre lectura de candidatos y avance de proyección, una selección marcada con la nueva posición incluye el nuevo ganador o indica reconstrucción. El control con una revisión corregida sigue invalidando las referencias antiguas. Medir número de reintentos, tiempo de preparación p95 y espera bajo carga por tenant. Desactivar reutilización de vistas incompatibles si falla la migración. No es necesario borrar las fuentes ni reiniciar cursores.

## C2. Igualar los parámetros de caché y de selección

**Comportamiento observado.** prepared admite un snapshot cuyo maxTokens sea menor que el solicitado y cuyo número de refs quepa en maxRefs. El número de refs seleccionadas no identifica el límite usado para seleccionar. Una consulta inicialmente restringida a 64 bytes y una referencia puede vaciar la respuesta posterior con más presupuesto hasta que caduque la entrada.

**Propuesta.** Incluir máximos solicitados, versión de algoritmo, versión de serialización, digest de consulta y revisión de política en una clave de contrato persistida. Exigir igualdad exacta en la primera implementación. Un índice soporta búsquedas por tenant, actor y clave, con expiración y cursor. El mismo contrato debe identificar qué política de candidatos aplicó el límite SQL. Si un futuro optimizador admite reutilizar conjuntos más pequeños, exigir evidencia de cobertura completa y prueba de equivalencia del ranking. Mantener el límite de presupuesto global del prompt y mensajes en el runtime.

**Compatibilidad.** Los snapshots históricos carecen de maxRefs solicitado. Regenerarlos por la ruta fría y dejar que expiren por TTL. Conservar la lectura autorizada de receipts históricos. Activar lectura y escritura nuevas por tenant y observar caídas de hit rate, tiempo de recomputación y tamaño de claves. Un rollback puede deshabilitar el uso de caché mientras preserva la tabla.

**Pruebas.** Cruzar solicitudes 64→4000 y 4000→64 con maxRefs 1→3 y 3→1. Comparar cada warm hit con el oráculo de getSnapshot sobre el mismo corpus. Usar controles en que solo cambie política o consulta y un caso de corpus vacío. La salida más restrictiva debe respetar su límite en todos los caminos.

## C3. Fidelidad entre fuente, segmento y atención

**Comparación con P02 original.** Preservar su exigencia de refs exactas y TTL. Recalcular el digest de un snapshot no garantiza que el texto pertenezca a la revisión actual si se confía en todas las partes leídas de la misma fila. La comprobación propuesta para attention recorre la lista y compara las señales con el registro. Esa comprobación requiere además una especificación de la consulta y del scorer si la puntuación se usa para tomar decisiones de presentación.

**Código candidato del contrato interno.** Extraer la representación que ya construye getSnapshot, con este límite sugerido:

```ts
type SnapshotSegment = ContextSnapshotV2["segments"][number];
type RenderSegment = (
  record: CognitiveRecord,
  countTokens: (text: string) => number
) => SnapshotSegment;
```

El renderer toma los valores de title, body, epistemic, evidence y las representaciones aprobadas de ontology y runtimeOutcome exactamente como las espera Fast. La migración conserva la forma pública mientras se versiona el renderer interno. Al leer, resolver la revisión vigente, volver a renderizar y comparar con la representación almacenada cuando proceda. Revalidar que hay una sola posición por ref admitida, que el total coincide y que el presupuesto se respeta. Evitar consulta repetida por un mismo padre compartido con una caché de request identificada por tenant, actor, política, id y revisión. La siguiente petición arranca con comprobación vigente.

**Verificación y rollback.** Añadir pruebas del contenido serializado para familia cromática, outcome, hipótesis y fuente controvertida. Probar revocación entre lectura y emisión y medir el intervalo del monitor con un reloj de prueba. Ante forma histórica desconocida, regenerar desde fuentes autorizadas. Para confirmar la entrega continuar usando el ACK con fence del ledger existente. No reinterpretar un receipt del servidor como prueba de recepción física del cliente.
