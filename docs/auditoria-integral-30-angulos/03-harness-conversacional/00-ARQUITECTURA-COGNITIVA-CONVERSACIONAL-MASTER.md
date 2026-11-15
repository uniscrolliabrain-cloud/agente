# MASTER — Arquitectura cognitiva conversacional de AgntiaPro
**Fecha:** 2026-11-15 · **Alcance:** exclusivamente repositorio padre `agente` · **Estado:** especificación arquitectónica; no implementación ni benchmark.

> **REGLA DE LECTURA:** este MASTER y sus anexos son la referencia de diseño para la reauditoría del chat, Fast/Slow LLM, tarjetas y UX. No interpretar el documento previo `REDISENO-V2-FAST-CHAT-VOICE.md` como diseño completo: era un boceto parcial de migración que omitía el núcleo de actualización cognitiva continua. Las decisiones de este MASTER tienen prioridad en caso de conflicto conceptual. No reescribir la historia: la reconstrucción parte de la conversación del fundador, y donde faltan detalles exactos se identifica explícitamente como propuesta o pendiente.

## 1. Por qué el diseño habitual es insuficiente
El objetivo NO es simplemente `User → Fast LLM → IntentBridge → Slow LLM → Kernel`. Ese diagrama hace del turno del usuario el disparador y centro de toda la cognición, repite lecturas y razonamiento, aumenta latencia, empobrece la continuidad de LAIA y confunde interfaz con autoridad. Tampoco basta con poner una tarjeta estática de personalidad y un resumen de chat en caché. AgntiaPro es un sistema empresarial con actividad propia, tareas y señales continuas; LAIA debe estar informada de ello sin reconstruir el mundo en cada mensaje.

**Decisión recuperada:** kernel, bus y grafo producen y actualizan continuamente información cognitiva; los mecanismos de memoria, atención, Slow LLM y Presenter la interpretan y convierten en tarjetas de contexto; se seleccionan e inyectan progresivamente en la conversación Fast. La conversación consume una **vista cognitiva preparada**. La actualización puede producirse sin que el usuario esté escribiendo. La ejecución sigue bajo control determinista y políticas.

## 2. Dos circuitos complementarios, no una sola cadena
### Circuito A: cognición de fondo (asíncrona)
```text
Kernel / tareas / SOPs / workers / dominio Ciberseguridad
  → eventos persistidos y hechos verificados
  → grafo de entidades, relaciones, estados y prioridades
  → memoria y recuperación contextual
  → atención / selección / ranking / vigencia
  → Slow LLM cuando se requiere interpretación o síntesis
  → Presenter / compilador de tarjetas RAC-RAG
  → ContextCardStore versionado y segregado por tenant/actor/agente
  → inyección push/refresh al contexto conversacional
```
No todo evento exige Slow LLM. Determinismo para cambios triviales, enriquecimiento cognitivo para ambigüedad, conflicto, relevancia, síntesis y planes. Un evento puede invalidar una tarjeta sin generar inmediatamente otra. La tarjeta no es fuente de autoridad; conserva referencias a evidencia.

### Circuito B: interacción de baja latencia
```text
Usuario (web o voz Anam) → sesión autenticada → Fast LLM API
   ↑                                 ↑
   └── tarjetas RAC/RAG ya preparadas + memoria de diálogo + persona/rol
Fast streaming → texto/voz/avatar + UI
Si hay petición operativa → mandato/intent tipado → kernel/policy → runtime
                                     ↓
                         eventos → circuito A → tarjetas → LAIA
```
El Fast no necesita saber cómo funcionan los workers ni las herramientas. Puede expresar intención, hacer preguntas y comunicar resultados confirmados. Una conversación puede comenzar antes de que termine una tarea; una tarea puede terminar cuando el usuario ya no está conectado. El Fast no debe depender sincrónicamente de Slow para saludar, escuchar o responder a preguntas simples.

## 3. Taxonomía de componentes y responsabilidad
| Componente | Es dueño de | No debe ser dueño de |
|---|---|---|
| Kernel | identidad, autoridad, estado de negocio, invariantes, delegación | estilo de respuesta o animación |
| Runtime/SOP | ejecución autorizada, reintentos, idempotencia, verificación | narrativa conversacional |
| Event Bus | hechos/eventos con tenant, correlación, causalidad y versionado | inferencias no verificadas |
| Grafo | entidades, relaciones, cambios, contexto relacional | permiso implícito de ejecutar |
| Memorias (cinco clases previstas) | continuidad y recuperación bajo scopes | autoridad para cruzar tenants |
| Atención | priorización de información por agente, tarea, usuario y vigencia | decisiones irrevocables |
| Slow LLM API | razonamiento complejo, interpretación, síntesis, propuestas estructuradas | ejecución directa, conversación de latencia crítica |
| Presenter | traducir estado y razonamiento a contexto comunicable, tarjetas y recibos legibles | inventar resultados o permisos |
| RAC/RAG Card Engine | materializar tarjetas pequeñas, versionadas, atribuibles y pertinentes | sustituir base de datos de hechos |
| Fast LLM API | conversación natural, personalidad, turnos, streaming y explicación | autorización y efectos externos |
| Anam / voz | interfaz audiovisual, interrupción, reproducción | memoria canónica, política o kernel |
| JEV AI futuro | metacognición y mecanismos cognitivos adicionales por integrar | requisito presente para arrancar el primer vertical slice |

**Nota terminológica:** el fundador ha llamado a estas piezas “tarjetas RAC” y también RAG. Mantener ambos términos en documentación hasta recuperar la expansión original de RAC y decidir si son subtipos distintos; no inventar un acrónimo ni sustituirlo silenciosamente.

## 4. Taxonomía de tarjetas
Se propone distinguir: `identity/persona` (identidad y relación), `situation` (estado empresarial), `task/progress` (actividad actual), `evidence` (hechos con procedencia), `memory` (continuidad), `attention` (prioridad), `policy` (restricciones de comunicación), `reasoning/presenter` (síntesis interpretativa), `alert` (cambios urgentes), `domain` (Ciberseguridad). Esta taxonomía es **propuesta técnica**, no enum verificado en código.

Cada tarjeta debería identificar `cardId`, `schemaVersion`, `tenantId`, `agentId`, `scope`, `kind`, `priority`, `createdAt`, `updatedAt`, `expiresAt`, `sourceEventIds`, `evidenceRefs`, `contentHash`, `tokenEstimate`, `classification`, `supersedes`, `confidence/epistemicStatus` y contenido. No confiar en metadatos aportados por texto de usuario. El modelo de datos definitivo se reconcilia con contratos Zod actuales.

## 5. Ciclo de vida cognitivo
1. **Observe:** ingresa un hecho autorizado; no se asume que toda señal es fiable.
2. **Normalize:** resolver tenant, entidad, fuente, versión y causalidad.
3. **Relate:** actualizar grafo y vínculos, manteniendo provenance.
4. **Attend:** decidir destinatarios y relevancia; aplicar ACL antes del ranking.
5. **Interpret:** si es necesario, Slow LLM interpreta o sintetiza bajo schema.
6. **Present:** generar tarjetas legibles para Fast y/o usuario; incluir incertidumbre.
7. **Publish:** guardar versión, invalidar/sustituir tarjetas obsoletas.
8. **Inject:** actualizar snapshot de contexto en sesiones interesadas sin interrumpir audio.
9. **Expire/revoke:** TTL, revocación, cambio de permisos o tenant invalidan acceso.
10. **Audit:** rastrear de tarjeta → hechos → evento → tarea/receipt.

El flujo debe tolerar eventos fuera de orden, duplicados, replay, errores de proveedores y retrasos. Una tarjeta antigua no debe sobrescribir una nueva. No debe existir un broadcast indiscriminado de datos sensibles a todos los agentes.

## 6. Presupuesto de tokens: lo recuperado y lo que NO se sabe
**Dato recuperado de la conversación:** se habló de tarjetas de aproximadamente **1.000 tokens** y de presupuestos para su inyección. No está recuperada una tabla literal y definitiva de distribución de tokens entre todas las categorías. No inventarla.

**Propuesta de trabajo, NO acuerdo histórico:** usar `maxCardTokens≈1000` como techo de diseño por tarjeta, no como tamaño obligatorio. Distinguir: presupuesto por tarjeta, presupuesto agregado de tarjetas por turno, presupuesto de persona, historial, memoria y reserva para respuesta. El valor agregado depende del modelo, coste y latencia; debe configurarse por canal y medir tokens reales. La atención elige un subconjunto y comprime/descarta tarjetas menos relevantes, nunca recorta silenciosamente la única advertencia de seguridad. Si una tarjeta excede el techo, generar versión resumida con referencias verificables al detalle original. Guardar tokenizador/modelo usados para la estimación.

## 7. Identidad y alcance
LAIA es una interfaz personal y laboral persistente; los agentes visibles no son cada uno un motor autónomo de autoridad. `tenantId`, `actorId`, `agentId/personaId`, `runtimeId`, `sessionId` y `threadId` cumplen papeles distintos. La selección de tarjetas debe considerar tenant, persona, usuario, tarea, clasificación y autorización. El cambio de permisos obliga a invalidar snapshots. Un usuario no recibe tarjetas de otra empresa aunque comparta agente/persona. En voz, Anam no se convierte en emisor de confianza de la identidad.

## 8. Slow y Fast: APIs separadas de verdad
- **Fast API:** provider/router, timeouts, streaming, costes, cuota y métricas propios. Consume `ContextSnapshot` preparado; no ejecuta herramientas empresariales directamente. Puede iniciar una petición estructurada para kernel.
- **Slow API:** provider/router, budgets, timeouts y políticas independientes; recibe solicitudes desde runtime, grafo, atención o Presenter para interpretar y producir resultados tipados. Puede ejecutarse en background.
- **Puente:** no es solo `Fast → Slow`. Es bidireccional a nivel de estado: `Fast → solicitud → Kernel` y `Kernel/Bus/Grafo → tarjetas → Fast`. No significa que los dos LLM se llamen mutuamente sin supervisión.
- **Fallos:** caída de Slow no bloquea saludo o conversación general; caída del Card Engine deja al Fast en modo degradado honesto, no con datos inventados; caída de Fast no detiene workers.

## 9. Ejemplo continuo: Ciberseguridad
Un escaneo autorizado finaliza mientras el usuario está en otra pantalla. Ciberseguridad entrega recibo y evidencia; el bus registra evento; grafo actualiza postura; atención decide relevancia para LAIA y propietario; Slow sintetiza cuando proceda; Presenter produce tarjeta “Hay un hallazgo que requiere revisión” con fuentes y estado; la siguiente intervención de LAIA conoce la novedad sin lanzar de nuevo el escaneo. Si requiere acción sensible, el kernel exige aprobación y no permite que la tarjeta la sustituya.

## 10. Experiencia visual: dos capas, no dos verdades
**Capa narrativa/pedagógica:** espiral SVG compacta y clara, cinco frases de orientación, opacidad/fundidos; no es traza exacta. **Capa operativa:** tareas, pasos, aprobación, verificaciones y resultados enlazados a eventos y receipts. El usuario puede ver una representación comprensible del camino sin exponer la complejidad del DAG. El detalle está en `02-UX-SVG-Y-CAMINOS-DE-ACCION.md`.

## 11. JEV AI futuro
JEV AI se contempla como futura pieza cognitiva/metacognitiva; no está integrada. Definir puertos y eventos antes de adoptar dependencia. No bloquear MVP de kernel + Fast/Slow + tarjetas + Ciberseguridad esperando JEV AI. El contrato futuro debe preservar soberanía del kernel, aislamiento de datos y auditabilidad.

## 12. Qué es hecho, qué es decisión y qué es propuesta
- **Decisión conversacional recuperada:** dos APIs; sistema cognitivo de fondo; tarjetas aproximadamente 1.000 tokens; Fast como interfaz; kernel y runtime ejecutan; Anam como canal; UX SVG pedagógica; JEV AI futuro.
- **Propuesta técnica documentada:** nombres de servicios, campos exactos de tarjetas, taxonomía de subtipos, TTL, presupuestos agregados, ranking y thresholds.
- **No verificado:** wiring actual, latencia medida en HEAD, coste real, compatibilidad SDK Anam, contenido exacto del léxico RAC, distribución literal de tokens, funcionamiento completo de cinco memorias.
- **Prohibición:** citar este MASTER como prueba de que ya existe implementación.

## 13. Índice de anexos
- `01-TARJETAS-RAC-RAG-ATENCION-MEMORIA.md`: taxonomía, políticas, budgets y ejemplos.
- `02-UX-SVG-Y-CAMINOS-DE-ACCION.md`: animación y pasos pedagógicos/operativos.
- `03-DOS-APIS-FAST-SLOW-HARNESS-Y-MIGRACION.md`: contratos, secuencias, riesgos y gates.
- Documentos anteriores `REDISENO-V2-FAST-CHAT-VOICE.md` y `UX-ANIMACIONES-Y-FASES-V2.md`: referencias históricas complementarias; leer con este MASTER.
