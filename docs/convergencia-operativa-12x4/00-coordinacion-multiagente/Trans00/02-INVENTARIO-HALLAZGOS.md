# Inventario unificado D-M1 — 37 entradas trazables, 16 familias de integración candidatas

C01..C06 son identificadores de Trans00 asignados por orden de las cuatro secciones del DIAGNOSTICO.md de cada rama; G son los identificadores existentes de GPT. R = reproducción reportada por Codex/Astra en dobles/sintético o función, no repetida por Trans00. S = inspección estática, prueba roja pendiente. La fuente exacta y los SHA están en 01-FUENTES-Y-BASELINE.md. No es una lista de 37 fallos independientes ni de 37 parches nuevos. C02-02 es comportamiento conservador observado, no defecto acreditado. Todos los demás se contrastarán contra la base integrada: si ya corregidos, conservar prueba y no tocar código. Axx son etiquetas de agrupación para adenda, no sustituir IDs Pxx de campaña.

| ID | Origen | Patchset existente | Hallazgo | Evidencia | Escritor/contrato | Familia | Oráculo mínimo |
|---|---|---|---|---|---|---|---|
| C01-01 | T01 | A03/E03 | Acción succeeded y dispatch reconciled/unknown en una llamada; carrera reproducida PGlite/PG | R | T01 | A01 | Atomizar transición acción/intento con fence; ambas intercalaciones, fallo de commit, una llamada |
| C01-02 | T01 | A03/S01 | Mantenimiento marca acción activa como interrumpida | R | T01 | A01 | Lease/fence vigente impide recovery; no resend; dos workers |
| C01-03 | T01 | A03/H01 | Tres llamadas half-open simultáneas | R | T01 | A02 | Un probe admitido por ámbito del breaker; otros rechazados; reset no pierde fence |
| C01-04 | T01 | A03/H01 | call y recordFailure difieren ante HTTP 422 | R | T01 | A02 | Una taxonomía de errores; validación no abre circuito |
| C02-01 | T02 | P02 | Watermark más nuevo que contenido y caché no equivalente tras aumentar presupuesto | R | T02 | A03 | Snapshot coherente; misma consulta/política/budgets/watermark da misma selección frío/caliente; dos regresiones separadas |
| C02-02 | T02 | P02 | getDelta devuelve null al sustituir revisión | R | T02 | A03 | PRESERVAR full refresh fail-closed; verificar cliente trata null como reload, no degradar ACL para delta |
| C02-03 | T02 | P06 | Circuit open consume cuota sin llamada remota | R | T02 | A02 | Separar admission/dispatch; unidades no despachadas no consumen cuota de proveedor |
| C02-04 | T02 | P06 | Cancelación reinicia fallos del breaker | R | T01/T02 | A02 | Resultado neutral para cancelación; T01 ABI, T02 caller; no liberar incertidumbre remota |
| C03-01 | T03 | P07–P09 | Calendar confirmado y caché falla: pierde receipt, retry vuelve a revisión | R | T03/T01 | A01 | Receipt remoto no se vuelve fallo por caché; no segundo dispatch; no afirmar reenvío observado |
| C03-02 | T03 | P10 | Places JSON ilegible se presenta como cero resultados | R | T03 | A04 | Error tipado distinto de búsqueda vacía; no false negative |
| C03-03 | T03 | P10/guard leads | Opt-out falso positivo/negativo | R | T03 | A05 | Casos textuales de Codex; oposición ambigua se eleva sin envío |
| C03-04 | T03 | P10/guard leads | Mensaje posterior oculta baja previa | R | T03 | A05 | Historial autorizado desde último checkpoint; oposición persistente, no reseteada por gracias |
| C04-01 | T04 | P12/P14 | Gate acepta informe parcial como repositoryGateOk | R | T04 | A06 | Manifest completo, SHA limpio, pasos, logs, exit; NO_GO global se mantuvo en ensayo |
| C04-02 | T04 | P01/P06 | P99 fuera de buckets llega como null | R | T04 | A07 | Estado overflow explícito, no valor falso, compatibilidad de consumidor |
| C04-03 | T04 | P06/P07 | Cinco alertas leen ceros constantes | R | T04 | A07 | Señal real o unavailable, activar cinco reglas con fixtures |
| C04-04 | T04 | P06/P07 | Evaluaciones simultáneas notifican dos veces | R | T04 | A07 | Claim/intervalo durables o serialización adecuada al scope; dos evaluaciones y replay |
| C05-01 | T05 | P02/P05 | Anchor pertinente excluido por id antes del rank | R | T02 | A03 | Candidatos exactos antes del límite; control permutación ids; no calibrar pesos |
| C05-02 | T05 | P03/P08; T02 P13 | Autobiografía corregida colisiona con id anterior | R | T02 | A08 | Identidad versionada por refs/política; histórica preservada, supersession exacta |
| C05-03 | T05 | P03; T02 P03 | Neighbors repite arista a profundidad 2 | R | T02 | A08 | Dedupe por edge id exacto; profundidad acotada |
| C05-04 | T05 | P03; T02 P03 | Neighbors une evidencia de revisión sustituida | R | T02 | A08 | Extremos exactos y revisión vigente; histórico no contaminante |
| C06-01 | T06 | P01/P05 | Overlap 1 vs 0.05263 por permutación de aliases | R | T06 | A09 | Normalización de identidad y función independiente de orden; no elegir pesos por intuición |
| C06-02 | T06 | P01/P10 | Meta ignora fastIdleMs y ausencia de última actividad | R | T06/T01 | A09 | Respetar config; unknown no equivale a idle; T01 cambia llamada conversation |
| C06-03 | T06 | P01/P06 | Consolidate dedup por tipo pierde autores distintos | R | T06 | A09 | Identidad completa del autor, conservar procedencias distintas |
| C06-04 | T06 | P01/P06 | Promoter declara dedupe pero escribe destinos originales | R | T06 | A09 | Destinos y side effects derivados de mismos supervivientes; receptor una vez |
| G01-01 | T01 | A03/E03 | Anchor de audit y append no atómicos | S | T01 | A10 | Fallo put tras CAS revierte ambos; sin tx externa |
| G01-02 | T01 | E03/G01 | Verify fail-open, páginas invertidas, no verifica extremos | S | T01 | A10 | Error lectura no PASS; 1001+ entradas; truncamiento/anchor incorrecto |
| G01-03 | T01 | E02 | Filtros sourceId/projectId omitidos en replay SQL; recent sinceId | S | T01 | A11 | Paridad filtros antes LIMIT, conservar nuevo seq replay |
| G02-01 | T02 | P04/P03 | Dependencias de inferencia no citadas no revocan derivado | S | T02 | A12 | Registrar contexto real vs citas; revocar B antes/después de publicación |
| G02-02 | T02 | P04 | Raw inválido reutilizado sin nueva inferencia | S | T02 | A12 | Terminal explícito o retry seguro, raw histórico conservado |
| G03-01 | T03 | P11/C13 | Voice snapshot declarado no acredita snapshot usado | S | T03/T02 | A13 | Binding al servido por Fast; dos snapshots; epoch/interrupción |
| G03-02 | T03 | P01/P04 | Resend id numérico y error objeto rompen categoría | S | T03 | A04 | 200 malformado unknown, 4xx rechazo normalizado, 200 id string accepted |
| G04-01 | T04 | P14 | Restore mezcla archivos actuales y backup; no verifica manifiesto | S | T04 | A14 | Manifiesto/inventario/hash/tenant; staging y fallo seguro; Supabase separado |
| G04-02 | T04 | T04-S S2 | Preflight imprime incoherencia pero exit 0 | S | T04 | A15 | Perfil estricto falla incoherencia; preservar modo informativo |
| G05-01 | T05 | T02 P08 | Mismo id RAG con score/política distinto produce EVENT_ID_CONFLICT | S | T02 | A08 | ID versionado, quitar score dinámico de payload estable; ya diseñado P08 |
| G05-02 | T05 | T02 P02/P13 | recall filtra memoryKind tras límite 2000 | S | T02 | A03 | Filtro antes límite; degraded honesto; corpus 2000+1 |
| G06-01 | T06 | T01 E03 / T06 P01 | Append Thought duplica id y admite overwrite | S | T01 | A16 | Mismo id/contenido idempotente; conflicto distinto; concurrencia PG pendiente |
| G06-02 | T06 | T01 E03 / T06 P09 | Close quiescence no revalida última actividad | S | T01 | A16 | Actividad durante wait aplaza cierre; no cambiar cierre explícito |

## Evidencia adicional y pendientes de contraste

- T03 Astra 48/49: test espera texto Invalid OAuth, adaptador redacta cuerpo y devuelve 422 con HTTP 401. Adjuntar regresión de categoría segura a A04; no recuperar detalle remoto ni relajar test hasta comprobar consumidores. Esto no se cuenta dentro de las 37 entradas.
- T06 experimento fieldEnergy: vacío y cero dan 0; [1,0] y [0,1] dan .5. Escalar a evaluación experimental posterior, CROMOS_PENDING_V1 permanece desactivado. No constituye por sí solo un bug de un circuito activo ni exige algoritmo nuevo. La definición final 0–8 es posterior a dogfooding.
- Trans01 Astra reconciliación R1–R3 y Trans02 C1–C3: son ampliaciones concretas de A01/A03, no una nueva campaña. Leer experimentos y diseños completos en D-M2. El inventario actual toma los diagnósticos Codex que ya incorporan los principales experimentos. No afirmar que toda la auditoría Astra esté finalizada.
- La documentación canónica permite que Fast proponga solicitudes tipadas; el README actual y founder lo restringen a comunicar/registrar intención humana. No crear ruta que convierta un acto del modelo en autorización o propuesta operativa. Cerrar delta documental en Trans00 y conservar canónica original.
- La restauración de archivos no prueba fallo de Supabase. Supabase se conserva; certificación de backup/restore requiere entorno autorizado y combinación DB+archivos+ledger.
- Mantener opt-out en capacidad comercial existente: protección de oposición, no crear nuevo CRM ni nuevo clasificador autónomo.
- Los experimentos R son evidencia focalizada, no prueba de fuga/duplicación externa real. Las familias A01–A16 son agrupaciones de trabajo, no nuevos subsistemas; la propiedad de cada archivo es única en 03.

## Criterio de salida D-M2

Cada fila debe pasar a FIX_NEEDED / COVERED_BY_EXISTING_PATCH / REGRESSION_ONLY / ALREADY_FIXED / PRESERVE / BLOCKED_EVIDENCE con path, símbolo y blob actualizado, prueba negativa, propietario único y dependencia. No eliminar filas históricas. No convertir diagnóstico en GO. No añadir correcciones speculative para aumentar puntuación.
