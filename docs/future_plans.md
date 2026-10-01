# future_plans — Conceptos para las siguientes iteraciones

> Documento de constancia. **No es un roadmap.** Es un mapa de conceptos que se
> han pensado y que se construirán cuando toque. Nada de aquí está implementado
> todavía. Sirve para no perder la visión y para que cualquier colaborador
> (humano o IA) entienda la dirección sin reinterpretarla.

---

## 1. Sistema de templates dinámicos

**Idea.** La UI deja de ser pantallas hardcodeadas. Se convierte en un
renderizador de plantillas parametrizables (`Template`), que reciben un
`ViewSpec` y datos ya resueltos.

**Piezas.**

- `Template` — componente React autocontenido, con contrato (`id`, `accepts`,
  `props`, `render`).
- `ViewSpec` — objeto tipado con `templateId`, `dataSource`, `columns`,
  `actions`, `grouping`, `metadata`.
- `View Resolver` — decide qué template usar según la intención y el contexto.
- `View Renderer` — monta el template con sus datos.

**Templates base previstos.** `dashboard`, `kanban`, `table`, `list`, `detail`,
`timeline`, `board`, `graph`.

**Fallback.** Si ningún template acepta el spec → `dashboard` genérico.

**Seguridad.** El LLM no genera HTML ni JSX libre. Solo genera `ViewSpec`
validado con Zod contra un catálogo cerrado. Nunca se ejecuta código generado.

**Ventaja.** Añadir tipos de vista no requiere pantallas nuevas. Añadir
comportamiento = cambiar el spec.

---

## 2. Sistema de formularios asistidos por contexto

**Idea.** El usuario no rellena formularios vacíos. El sistema los pre-rellena
desde el business graph y la memoria, y solo pregunta lo que no puede saber.

**Piezas.**

- `FormSpec` — objeto tipado con `entityType`, `fields`, `prefilled`,
  `missing`, `policies`, `requiresApproval`, `onConfirm`.
- `Form Resolver` — construye el spec desde una intención + contexto.
- `Form Renderer` — pinta el formulario con chips de procedencia por campo.

**Chips de procedencia.**

- `auto · confianza alta` (verde): viene de datos canónicos.
- `auto · confianza media` (amarillo): inferido.
- `sugerido` (violeta): propuesto por el agente, editable.
- `tú` (neutro): lo ha puesto el usuario.

**Regla.** Lo que la IA propone, el humano confirma. Lo que no se sabe, se
pregunta. Nunca se inventa.

---

## 3. Dos velocidades LLM (fast / slow)

**Idea.** Dos LLMs con distinta velocidad, distinta API key y distinto
propósito. El usuario nunca espera. El trabajo pesado sucede en background.

**Asignación.**

- **Fast LLM** — habla con el usuario. Rápido. Personalidad. Respuesta en
  <2 s. Solo invoca tools triviales (<500 ms). Deriva el resto al slow.
- **Slow LLM** — procesa en background. Razonamiento profundo. Consulta el
  business graph entero, SOPs, policies. Puede tardar segundos o minutos.

**Configuración.** Dos conjuntos independientes de variables:

    FAST_LLM_PROVIDER / FAST_LLM_MODEL / FAST_LLM_API_KEY
    SLOW_LLM_PROVIDER / SLOW_LLM_MODEL / SLOW_LLM_API_KEY

**Ventajas.** Sin espera para el usuario. Cuotas independientes. Posibilidad de
medir coste por velocidad. Fallback cruzado.

**Futuro.** Un tercer LLM especializado (legal, médico, financiero) se añade
como autor adicional del grafo, sin tocar fast ni slow.

---

## 4. Grafo cognitivo (workspace compartido)

**Idea.** No es un pipeline donde fast llama a slow. Es un **grafo compartido**
donde todos los actores leen y escriben. El contexto no se transmite. El
contexto **es** el grafo.

**Piezas.**

- `Thought` — unidad de pensamiento registrada. Tiene `author`, `role`,
  `content`, `metadata`, `edges`.
- `Turn` — agrupa los pensamientos de un intercambio. Efímero.
- `Promotion` — al cerrar el turno, solo lo relevante se promueve a memoria
  permanente (hechos, aprendizajes, decisiones, acciones).
- `Authors` — quién escribe al grafo: usuario, fast, slow, agentes, workers.
- `Observers` — quién lee del grafo: presenter, meta, policy, state machine.

**Reglas.**

- Nadie "manda" a nadie. Todos leen y escriben al grafo.
- Cada pensamiento es inmutable y tiene procedencia.
- El turno cierra cuando el usuario recibe respuesta o expira el timeout.
- Nada se borra. Lo efímero se descarta al promover, no al escribir.

**Ventaja sobre pipeline.** Escalable a N velocidades. Depurable. Aprendizaje
natural. Multi-tenant sin esfuerzo.

---

## 5. Vector de atención por pensamiento

**Idea.** Cada pensamiento tiene metadata que envuelve **sobre qué se estaba
centrando** el autor en ese instante.

**Estructura.**

    attention: {
      primary: string           // foco principal
      secondary: string[]       // focos secundarios
      query: string             // qué buscaba
      matched: [{node, weight, reason}]
      ignored: [{node, reason}]
    }

**Ventaja.**

- Trazabilidad total de por qué el sistema dijo lo que dijo.
- Depuración: si el sistema se equivoca, se ve en qué se centró.
- Aprendizaje: patrones de atención que funcionan se refuerzan.
- Consistencia: si fast y slow tienen vectores distintos sobre el mismo input,
  el sistema pide aclaración.

**Ninguno de los sistemas estudiados (SAP, Dynamics, HubSpot, Xero, monday,
Bitbucket...) expone esto explícitamente.**

---

## 6. Cromos y polaridad (física del grafo)

**Idea.** Cada card del grafo es un **cromo** (unidad semántica) con **dos
polos opuestos**. Los cromos se atraen y repelen según polaridad. El
comportamiento del sistema emerge del magnetismo entre cromos, no de reglas
explícitas.

**Estructura de un cromo.**

    Cromo {
      id, name, category,
      poles: {
        positive: { label, axioms, weight },
        negative: { label, axioms, weight }
      },
      state: { position, energy, phase },
      edges: { attracts, repels, resonates, damps }
    }

**Campo magnético.** Cada turno, se calcula la fuerza total sobre cada cromo
según las relaciones con los demás. De ahí salen:

- **Estabilidad**: cromo en equilibrio → no importa.
- **Tensión**: cromo con campo fuerte → requiere atención.
- **Fase**: cada cromo oscila con su propia frecuencia.
- **Resonancia**: cromos en fase se amplifican mutuamente.

**Metáforas de inspiración.** Termodinámica (energía, entropía, equilibrio,
transición de fase), biología (cromosomas, genes, expresión, regulación),
tradiciones espirituales (yin-yang, polaridad, danza, wu wei).

**Ventaja.** Decisiones más matizadas. Ningún sistema empresarial aplica física
a la semántica.

---

## 7. Jev.ai + Pydantic como capa de axiomas

**Idea.** Los cromos y las relaciones se definen con **axiomas formales** en
Jev.ai y se validan con **Pydantic**. Es la capa de lógica de primer orden
sobre la que el magnetismo emerge.

**Función.**

- Definir qué es un axioma.
- Validar que un cromo está bien formado.
- Derivar consecuencias lógicas.
- Garantizar coherencia entre cromos.

**Ejemplo.**

    Axioma: ∀ factura (vencida ∧ cliente_moroso) → riesgo_alto
    Cromo derivado: factura_47 → riesgo = 0.7
    Polos: positivo "gestión_normal" / negativo "escalar_a_humano"
    Posición: -0.6 (tira hacia escalar)
    Acción emergente: proponer escalado

---

## 8. Metaconsciencia (cuándo interrumpir)

**Idea.** El kernel no interrumpe al usuario todo el rato. Solo cuando importa.

**Reglas.**

- Si el usuario está escribiendo → no interrumpir.
- Si lleva 5 min sin hablar → puede que sí.
- Si algo es crítico (seguridad, dinero, plazo) → interrumpir siempre.
- Si algo es medio → acumular y presentar en el próximo turno.
- Si algo es bajo → solo en el digest diario.

**Fuente de la decisión.** No es una regla. Es el campo magnético del grafo.
Los cromos con alta energía disparan interrupción. Los que están en equilibrio,
no.

---

## 9. Presenter (qué contar al fast LLM)

**Idea.** El slow sabe 47 cosas. El fast solo debe contar 3. El presenter
filtra.

**Criterio.**

- ¿Qué es urgente? → se cuenta.
- ¿Qué pidió el usuario? → se cuenta.
- ¿Qué es relevante para el turno? → se cuenta.
- ¿Qué es ruido? → se descarta.

**Fuente.** El campo magnético. Los cromos con más energía son los que el
presenter amplifica.

**Efecto.** El chat no agobia. El chat no se equivoca por exceso de contexto.
El chat parece que "sabe qué decir en cada momento".

---

## 10. Procesamiento en background ("soñar")

**Idea.** Cuando no hay usuario, el kernel recalcula el campo, mueve cromos,
explora combinaciones. Como hace el cerebro durante el sueño.

**Límites.**

- Duración máxima por sesión.
- Coste máximo.
- Los resultados solo se promueven si superan un umbral.

**Equivalencia neurocientífica.** Default Mode Network. El sistema trabajando
en su propio estado.

---

## 11. Repo separado para el kernel cognitivo

**Idea.** El kernel cognitivo vive **fuera** de este repo. Este repo (la app de
empresa) se comunica con él mediante el bus de eventos.

**Razones.**

- Diferentes lenguajes: TS/Node para la app, Python puro para el kernel
  (numpy, scipy, networkx, torch, pydantic, Jev.ai).
- Diferentes ciclos de cambio: la app todos los días, el kernel cada semanas.
- Diferentes escalas: la app escala horizontal, el kernel escala en profundidad.
- Reutilizable: otros productos pueden usar el kernel.

**Conexión.** El kernel lee el bus (pull periódico) + se suscribe a eventos
críticos (push). Escribe sus resultados al bus. No hay "sincronización" entre
repos. Hay **lectura/escritura común del mismo flujo**.

---

## 12. Ontología de procesos (no de sustancias)

**Idea.** Los objetos no son la verdad fundamental. **El cambio sí.** Los
"objetos" son patrones estables del flujo. Los "estados" son tasas de cambio.
La "memoria" es huella del flujo. La "atención" es modulación del flujo.

**Consecuencias.**

- Nada se sincroniza entre dos partes. **Hay un flujo, y cada parte lo lee.**
- Los eventos son ciudadanos de primera. Todo va al bus.
- Los estados se derivan, no se almacenan.
- Los objetos son proyecciones, no entidades.
- La UI es proyección del flujo, no fotos de estados.
- Time travel y replay son posibles desde el bus.

**Base filosófica.** Heráclito, Whitehead, termodinámica, biología de procesos.

**Consecuencia práctica.** Migración incremental. Los objetos actuales se
reinterpretan como proyecciones. No se borran.

---

## 13. Cognición aumentada digital (cómo se trabaja)

**Reparto de roles.**

- **Humano** — dirección, forma final, criterio, validación. Sostiene el
  "magnetismo" (estado de flow / samadhi). No carga con el proceso.
- **IA** — traducción a código, verificación, memoria del estado del repo,
  aviso de choques, escritura del ledger.

**Reglas.**

- El humano no justifica lo que ya ve.
- La IA no pregunta lo que puede resolver sola.
- El humano no recuerda el estado. La IA lo lleva.
- La IA no inventa dirección. Solo ejecuta.
- La validación es humana. La verificación es de la IA.

**Ventaja.** El humano queda libre para sostener la forma. La IA absorbe el
proceso. El sistema recuerda lo que pasa. **Ni uno ni otro sobra.**

---

## Cómo se relacionan las piezas

    HUMANO
      │  dirección, validación
      ▼
    APP (este repo)
      │  eventos
      ▼
    BUS DE EVENTOS ◄──────► KERNEL COGNITIVO (repo aparte)
      │                            │
      │                            ├── grafo de cromos
      │                            ├── campo magnético
      │                            ├── axiomas Jev/Pydantic
      │                            └── atención emergente
      ▼
    GRAFO COGNITIVO
      │
      ├── autores (user, fast LLM, slow LLM, agentes, workers)
      ├── observers (presenter, meta, policy, state)
      └── promoción selectiva
      │
      ▼
    VIEWSPEC / FORMSPEC
      │
      ▼
    UI SERVIDA
      │
      ▼
    USUARIO

Ninguna capa "llama" a la de al lado. Todas leen y escriben al flujo común.
El flujo es la única verdad.

---

## Estado actual

**Nada de este documento está implementado.** Es la visión completa. Se
construirá por piezas, respetando el orden que decida el humano que dirige.
Cada pieza es una escultura independiente que se suma a la anterior.

Cuando una pieza se implemente, se moverá de este documento a un documento
técnico aparte (por ejemplo `docs/COGNITIVE_KERNEL.md`) que describa el
contrato concreto, los tipos exactos y las decisiones de implementación.