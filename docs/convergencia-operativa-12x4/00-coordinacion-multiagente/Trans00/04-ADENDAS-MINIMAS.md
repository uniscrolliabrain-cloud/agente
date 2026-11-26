# Adendas candidatas sobre las campañas originales — D-M1

Aplicar solo tras autorización y D-M2/D-M3. No reescribir 288 bloques. IDs A01..A16 agrupan los 37 diagnósticos del inventario; los P/A/E/S originales prevalecen salvo delta explícito. Todos requieren reabrir código vivo y prueba roja antes de parchear. No se generan hunks contra blobs históricos ni se declara que la implementación esté hecha.

## Trans01 — autoridad, runtime y bus

- A01 (C01-01/02 + C03-01, Astra R1–R3): ampliar A03/E03 y S01, conservar código ya presente. Separar decisión humana, intento de despacho y observación; misma transacción/fence para action+intent, no llamar proveedor dentro de transacción, reconciliar tardíos con evidencia, unknown no retry. Mantener accepted vs confirmed; no recuperar trabajo activo. Revisar db.ts/tenant store y actions.ts actual antes de copiar V3. Pruebas dos ordenaciones del experimento, commit unknown, restart, worker viejo, revocación.
- A02 (C01-03/04,C02-03/04): único breaker propietario T01, probe acotado y neutral cancel/validation; T02 controla cuota y egress en InferenceLane. Diferenciar intento admitido, proveedor alcanzado, resultado desconocido, rechazo previo. No resolver incertidumbre remota con timeout local. Prueba de concurrencia por scope real, dos procesos si se afirma garantía distribuida, caso 422, cancel, cuota. No cambiar a breaker distribuido sin evidencia de necesidad del alcance; declarar scope.
- A10 (G01-01/02): anchor+entry atómicos, verificación por cadena orden causal y extremos, fail-closed para verificación inaccesible; no borrar ni regenerar auditoría corrupta sin decisión. 1001+ entradas, truncamiento, crash CAS→put.
- A11 (G01-03): E02 ya contempla filtros; preservar secuencia durable existente de Trans01, corregir solo filtros y semántica de recent. Probar filtro antes de LIMIT y cursor vigente/purgado; no volver al orden timestamp.
- A16 (G06-01/02): preservar StoreTurnStore y InMemoryTurnStore, identidad idempotente y conflicto explícito, cerrar quiescencia bajo revalidación. Revisar locks/CAS y callers; T06 aporta fixtures. No cambiar grafo semántico por defecto.
- C01 selector/mount: adaptar app.ts de main, usar chat-agent de T02 cuando autorizado. No fallback tras stream ni activar dispatch deferred por defecto. H01 hooks existentes transferidos a 04, llamadas locales de 01.

## Trans02 — cognición

- A03 (C02-01/02,C05-01,G05-02): P02 + Astra C1–C3. Snapshot coherente cursor/candidatos/autorización, cache key exacta con budgets solicitados, scorer/serializer versionado y query digest. El parámetro maxTokens actual mide bytes: documentar unidad, no cambiar silenciosamente. Candidatos exactos/anclas y kind antes de LIMIT dentro de store existente; no ranking nuevo por T05/T06. getDelta null conserva full refresh, comprobar consumidor. Ref/segment/digest revalidado antes de servir, no confiar en snapshot histórico ni reconstruir desde payload cliente.
- A12 (G02-01/02): P04: recibo raw separado de resultado válido, contextDigest y manifiesto de todas refs realmente servidas, citas del modelo subconjunto; revocar dependencias transitivas, verificar en commit. Salida inválida terminal o retry explícito seguro, no bucle del mismo raw. Intent humano durable desde borde autenticado, nunca propuesta Fast. Egress JEV minimizado y revisiones.
- A08 (C05-02/03/04,G05-01): P03/P08/P13 existentes. Versionar autobiografía por conjunto de revisiones y política; no mutar histórico. RAG ID estable por revisión/contenido/política, score de búsqueda no altera evento persistente. Grafo aristas únicas y extremos exactos, autorización en cada extremo; no usar un grafo paralelo. T05 define anchors, continuidad y tests, T02 escribe store/graph/rag/memory.
- A02 caller P06, A13 binding snapshot de voz: respetar contrato T01/03; runtime Fast sigue único, no sincronía con Slow/JEV/RAG externo. T02 escribe runtime, T03 adapter.
- Mantener C05 opt-in + legacy explícito; no activar antes de integración y gates. P10 RLS con T04; no relajar private self-read.

## Trans03 — proveedores

- A01 C03-01: P07–09 ya preservan aceptación/receipt aunque falle caché. Demostrar fallo post provider con fixture y no pérdida de evidencia, no segundo efecto, contrato E03 de T01. Mantener wrapper legacy pero perfil gobernado nunca usa resultado string como prueba.
- A04 C03-02/G03-02 + Meta 422: validación shape, distinguir vacío de ilegible; 2xx malformado mutación unknown, 4xx rechazo tipado según contrato, no publicar cuerpo remoto. Extender patrón P01/P04/P10 sin inventar nueva taxonomía.
- A05 C03-03/04: corregir detector de oposición y persistir baja existente. Procesar mensajes autorizados sin perder oposición anterior, distinguir negación y término precio baja; no nuevo CRM, no nuevo outbound. T01 hace guard de actions si necesario.
- A13 G03-01: P11/C13 binding del snapshot efectivamente servido, receipt de texto no acredita reproducción. Revisar orden/epoch y revocación; la sospecha de concurrencia adicional necesita prueba antes de parchear. Fast único. Anam/ElevenLabs tokens efímeros servidor cuando ABI proveedor verificado, credencial no navegador. Composio puerto gobernado, no activation por tener key.
- Mantener refresh OAuth CAS independiente de binding, no lock de DB durante HTTP; verify scopes/actor. T04-S S3 fail-closed en perfiles correspondientes.

## Trans04 — infraestructura

- A06 C04-01: P12/P14 ya diseñan manifest full gate. Exigir SHA, clean incl untracked, paso exacto, comando, exit, logs/digests y tipo. Diferenciar ejecución parcial válida de certificación completa. No falsear global NO_GO.
- A07 C04-02/03/04: P01/P06/P07: overflow p99 explícito; métricas reales o unavailable, no cero constante; dedupe alerta conforme al scope (una evaluación solapada y reinicio). T01 cambia index.ts para conectar snapshot real a partir del ABI 04. Hooks no bloqueantes, nunca cambiar resultado de negocio por error de telemetry.
- A14 G04-01: P14, restore tenant verificable con manifest/identidad/hashes/inventario, ausencia declarada, staging rollback, no efectos externos. Supabase DB permanece operativa; backup local no acredita restore DB; prueba aislada antes de promoción. No cambiar proveedor.
- A15 G04-02: T04-S S0–S4 como propuesta original, [documento fuente](https://github.com/uniscrolliabrain-cloud/agente/blob/61b76ac514039fd9d3188dffc33abf2a2c28016a/docs/convergencia-operativa-12x4/00-coordinacion-multiagente/Trans01/T04-S-SECRETOS-GITHUB-FIRST.md). GitHub Secrets/Variables por entorno, manifest positivo, Doppler opcional explícito. Nombres reales vs candidatos; verificar consumidor api/worker/cognition-worker, no asumir targets. Estricto en gate, informativo local; sin imprimir valores (incl URL con credenciales). Preservar config cifrado y DSN existentes, no sobrescribir por vacío; sin deploy. Las aprobaciones de entorno dependen del plan, fallback manual protegido por founder; no enviar secretos prod a PR. Main deploy aún contiene Doppler-first, no trasladar workflow viejo. S3 owners 02/03. No abrir proveedores nuevos no autorizados.

## Trans05 — continuidad

- C05-01/G05-02 pasan a A03 T02; definir casos de anchors/recall y criterios de cobertura, no editar context/storage. C05-02/03/04/G05-01 pasan a A08 T02, aportar corpus, pruebas de revisión y procedencia. P02–P10 original conserva skills, brief, longitud y compilación declarativa según alcance aprobado; no añadir otro motor ni segundo grafo. Antes de crear sidecar confirmar necesidad y exacta integración con journal, store, política, revisión y RLS. No diseñar nuevos dominios/skills profesionales de producción; fixtures y catálogo estructural.
- Objetivos calidad en 100k/500k y latencia son hipótesis medibles, no PASS sin corpus. Dogfooding, no fine-tuning requerido para core.

## Trans06 — organización

- A09 C06-01/02/03/04: P01/P05/P06/P10, corregir identidad canónica/overlap invariante al orden, threshold de Meta y ausencia de dato, autores distintos y escritura sobre supervivientes reales. T01 modifica conversation caller si hace falta. Conservar las primitivas aprobadas, no definir pesos nuevos para optimización. Diferenciar equivalencia de alias de coincidencia textual; no colapsar entidades distintas.
- A16 G06-01/02 a T01, T06 aporta pruebas. No abrir nuevo storage ni activar CROMOS_PENDING_V1/fieldEnergy. PURE FIRST, NO NEW STORAGE como final de T06. Registros empresariales siguen entidades, no cards; polaridad no es permiso ni factualidad. Experimentalmente medir utilidad sobre baseline después de observabilidad, definición definitiva 0–8 fuera del alcance.

## Política de cambios

Una fila ya corregida produce REGRESSION_ONLY o ALREADY_FIXED, no otro parche. Una sospecha sin prueba queda BLOCKED_EVIDENCE, no añade alcance. Todo hunk mínimo debe respetar consumidor legacy y rollback. No reemplazar un módulo por diseño de Astra si la corrección cabe en el actual. Correcciones compartidas se asignan al único dueño del path en 03. No iniciar ejecución con estas adendas candidatas sin D-M2/D-M3 y autorización.
