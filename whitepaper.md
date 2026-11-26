# Laia — Whitepaper

> v1 · 2026-10-27 · Estado: current

## Resumen ejecutivo

Laia es un **OS agentico para PYMEs y agencias pequeñas**: un sistema operativo de negocio que recibe encargos, lee contexto y datos de empresa, ejecuta procedimientos deterministas, prepara acciones para revisión humana y conserva tareas, artefactos, eventos y memoria. Todo con aislamiento multi-tenant y aprobaciones explícitas para cualquier efecto externo.

## El problema

Las PYMEs y agencias pequeñas necesitan automatización de negocio pero las herramientas existentes (Zapier, n8n, Make) requieren configuración técnica y no ofrecen:
- Aislamiento real entre clientes (multi-tenant)
- Aprobaciones humanas antes de efectos externos (email, WhatsApp, calendario, pagos)
- Memoria de empresa curada y deduplicada
- Tareas durables que sobreviven reinicios
- Un chat conversacional por empresa que prepare emails y gestione la operación

## La solución: Laia

Laia es un **runtime de agentes durables** construido alrededor de cuatro pilares:

| Pilar | Qué hace |
|-------|----------|
| **SOPs deterministas** | Procedimientos JSON con pasos cerrados, `allowedTools` por SOP, aprobaciones en pasos externos |
| **Memoria de empresa** | Hechos curados con categoría y tags, deduplicados, accesibles por RAG |
| **Tareas durables** | Sobreviven reinicios, leases con CAS, checkpoint por paso, DeadLetterQueue |
| **Kernel cognitivo** | Cada turno se registra como Thought con AttentionVector. Audit trail con cadena de hashes SHA-256 |

## Modelo de negocio

| Concepto | Valor |
|----------|-------|
| Instalación por cliente | ~1.200 € |
| Mantenimiento mensual | ~850 €/mes |
| Dogfooding | Primera empresa compilada es la propia agencia |

Casos de uso prioritarios del vertical slice:

1. **Resucitar leads muertos** de campañas de Ads antiguas → automatización con buen ROI.
2. **Encontrar leads nuevos fríos** y entregarlos calientes y listos para cerrar.
3. **Agente de comunicación para clínicas**: contesta WhatsApp y teléfono, agenda citas en Calendar o CRM.
4. **Dashboard simple por empresa**: gestionan su automatización y hablan con su empresa conectada a Gmail, Drive, WhatsApp, Calendar, Google Profile de Negocio.
5. **Chat tipo GPT por empresa**: prepara emails y gestiona la operación.

## Arquitectura de alto nivel

```
Panel React (chat, tareas, revisión)
    ↓ HTTP
Hono API (auth, actor, tenant, rutas)
    ↓
AgentService (dispatch: SOP, task, goal, monitor)
    ↓
SOPExecutor → LLM (proveedor delegado)
    ↓
TaskWorker (lease, CAS, checkpoint, recuperación)
    ↓
Store (PGlite dev / Postgres prod, RLS opcional)
    ↓
EventBus (eventos durables, suscriptores locales)
    ↓
Kernel (turnos, thoughts, auditoría, presentación)
    ↓
34 workspaces (Gmail, WhatsApp, HubSpot, Stripe, Zendesk, etc.)
```

## Modelo de despliegue
¡
- **Multi-tenant compartido opcional** (Campaña 1, Fases 0–7 implementadas; Fase 8 pendiente: `MULTI_TENANT_SHARED=true` con RLS Postgres).
- **Backend**: PGlite en desarrollo, Postgres real en producción.
- **Auth**: Access key + sesiones HMAC SHA-256. Google OAuth con tokens cifrados AES-256-GCM.
- **Authz**: `authzEnabled` y `fieldClassificationEnabled` (solo `false` en modo `sample`).

## Roadmap a 12 meses

| Fase | Objetivo | Criterio de terminado |
|------|----------|----------------------|
| Beta ejecutable (2026-10) | Kernel V2, audit hash chain, computer Docker, browser Playwright, RAG, SOPs con `allowedTools`, ActionService | `pnpm beta:smoke` y `pnpm beta:vertical` pasan |
| Fase 1 - UI servida (2026-10 a 2026-11) | Panel contextual con 7 templates, ViewResolver + ViewRenderer | El usuario escribe y el panel sirve la vista correcta |
| Fase 2 - Producción single-tenant (2026-11 a 2026-12) | Observabilidad, CI/CD, backups automáticos, multi-proceso | El cliente opera 30 días sin intervención |
| Fase 3 - Multi-tenant real (2027-Q1) | RLS Postgres por defecto, tenant resolver por subdominio | Dos tenants coexisten sin verse |
| Fase 4 - Escala (2027-Q2+) | pgvector, Kafka/OTel, kernel en repo separado | Cien tenants sin degradación |

## Fuera del scope permanente

- Chat libre sin aprobaciones.
- Multitenancy compartido sin RLS ni isolación explícita.
- Promesas en docs que el código no cumple.
- Ficheros en `docs/` que no son documentación.

## Kernel

# **Trans06 — Núcleo axiomático, organización semántica y propagación empresarial**

## **1. Fundamento conceptual**

AgntiaPro es una infraestructura generalista de inteligencia distribuida destinada a compilar, operar y evolucionar empresas diferentes sobre un mismo sustrato tecnológico.

Su núcleo no debe intentar reproducir un cerebro humano, simular una experiencia subjetiva ni construir artificialmente el pensamiento. En el ámbito profesional nos ocupamos de aquello que puede representarse lingüísticamente, estructurarse computacionalmente, relacionarse con otras representaciones y, cuando corresponda, desencadenar acciones sobre sistemas reales.

El lenguaje constituye la materia prima semántica. Los LLM aportan capacidad de interpretación, contextualización, abstracción, generación y comunicación. Las cards cognitivas, los grafos, las memorias, los vectores de atención y los contratos tipados permiten organizar esa materia prima.

El kernel debe aportar algo diferente: un conjunto reducido de principios organizativos que permanezcan estables independientemente de la empresa, del modelo de lenguaje, del agente conversacional, del dominio profesional y de la escala en la que se esté operando.

**No programamos el pensamiento. Programamos la organización de las representaciones lingüísticas, sus relaciones y su capacidad de producir transformaciones verificables.**

## **2. El núcleo original es el fundador**

Tal como está registrado en el README de AgntiaPro y en la nota de investigación de Trans05, el núcleo inicial es el propio fundador, su observación, su capacidad de discriminación y su criterio organizativo.

El propósito de compilar y operar tres empresas propias diferentes no consiste solamente en probar el software. También constituye un método experimental para descubrir qué principios organizativos se repiten independientemente de la actividad empresarial.

Al observar cómo se generan las necesidades, cómo se organizan los recursos, cómo se transforman los procesos, cómo aparecen las contradicciones y cómo se reorganizan las estructuras, podremos distinguir entre:

- Lo universal, que podría pertenecer al kernel.
- Lo configurable, que pertenece a la compilación empresarial.
- Lo contingente, que pertenece al contexto de una situación.
- Lo semántico, que puede permanecer en el lenguaje y ser interpretado por los LLM.

Trans06 debe preparar y extender el sustrato para esa investigación, aprovechando lo que ya existe. No debe cristalizar prematuramente una teoría compleja que posteriormente resulte innecesaria.

## **3. El todo, la polaridad y la escala**

El principio conceptual del que partimos contiene tres aspectos: el todo, el positivo y el negativo.

No entendemos lo positivo y lo negativo en un sentido moral. Son direcciones, estados, relaciones o tendencias que adquieren significado respecto a una totalidad determinada.

Una empresa constituye un todo respecto a sus departamentos, pero también forma parte de un ecosistema económico superior. Un departamento es un todo respecto a sus procesos. Un proceso es un todo respecto a sus operaciones. Una card constituye una totalidad respecto a sus componentes y, simultáneamente, una parte de una estructura de conocimiento superior.

Esta organización puede extenderse recursivamente en múltiples direcciones.

Representación conceptual, no una topología de grafo que debamos imponer al software.

Una misma transformación puede adquirir polaridades diferentes dependiendo de la escala desde la que se observa.

Eliminar un procedimiento puede representar una contracción local y, simultáneamente, una expansión de las posibilidades operativas de la empresa. Conservar una estructura puede proteger a un departamento y perjudicar al conjunto. Rechazar una oportunidad puede preservar recursos necesarios para otra oportunidad de mayor valor.

Por tanto, las polaridades no deberían considerarse propiedades absolutas e inmutables de las entidades. Deben interpretarse respecto a un contexto, una relación, una intención y una escala.

## **4. La espiral como principio de transformación**

La geometría conceptual de la espiral de caracola representa la posibilidad de recorrer operaciones organizativas equivalentes sobre estados sucesivamente transformados.

Un estado manifiesto convive con posibilidades latentes. Una estructura existente condiciona qué otras estructuras pueden aparecer. Cuando desaparece, cambia el espacio de posibilidades del sistema.

La atracción y la repulsión pueden interpretarse computacionalmente como relaciones de afinidad, compatibilidad, oposición, preferencia, relevancia o incompatibilidad.

No necesitamos simular fuerzas físicas ni construir una dinámica artificialmente complicada. Para una infraestructura empresarial pueden bastar operadores mucho más sencillos:

| Polaridad candidata | Interpretación empresarial             |
| ------------------- | -------------------------------------- |
| Deseo / rechazo     | Intenciones, objetivos y preferencias. |
| Crear / destruir    | Aparición y retirada de estructuras.   |
| Producir / desechar | Generación y liberación de recursos.   |
| Adquirir / vender   | Intercambio y transferencia.           |
| Integrar / separar  | Organización de componentes.           |
| Conservar / renovar | Estabilidad y evolución.               |
| Atraer / repeler    | Afinidades e incompatibilidades.       |

Estas polaridades son ejemplos para la investigación, no axiomas definitivos. Tampoco tienen por qué constituir pares matemáticamente complementarios.

La jerarquía del 0 al 8 permanecerá como una hipótesis de organización recursiva hasta que podamos identificar qué aspectos merece realmente la pena formalizar.

El principio de ingeniería será siempre conseguir la máxima capacidad organizativa con el mínimo número de primitivas.

## **5. Partir del núcleo que ya existe**

Trans06 no debe comenzar diseñando una arquitectura nueva. AgntiaPro ya contiene los antecedentes directos de esta investigación.

Dentro del kernel existe una estructura denominada `cromos`, que contempla unidades organizativas compuestas por identidad, axiomas, campo y procedencia.

Estas unidades admiten actualmente cinco naturalezas:

| Cromo     | Naturaleza                    |
| --------- | ----------------------------- |
| `logic`   | Organización lógica.          |
| `physics` | Organización mediante campos. |
| `intent`  | Intenciones.                  |
| `memory`  | Memoria.                      |
| `policy`  | Políticas.                    |

Dentro de esta estructura existen dos módulos especialmente relevantes.

### **Lógica axiomática**

El archivo [`kernel/cromos/logic/axioms.ts`](https://github.com/uniscrolliabrain-cloud/agente/blob/main/apps/server/src/kernel/cromos/logic/axioms.ts?utm_source=chatgpt.com) contiene los principios iniciales de transitividad, doble negación, no contradicción, anclaje de la atención y descarte de contenido vacío.

Actualmente son declaraciones elementales acompañadas de una función de detección de negaciones textuales. Trans06 debería estudiar cómo convertir los principios que resulten útiles en invariantes ejecutables, comprobables y reutilizables por el sistema.

No necesitamos implementar un sistema completo de lógica simbólica. Necesitamos que determinadas relaciones y transformaciones puedan someterse a comprobaciones deterministas cuando estén suficientemente estructuradas.

### **Física organizativa**

El archivo [`kernel/cromos/physics/field.ts`](https://github.com/uniscrolliabrain-cloud/agente/blob/main/apps/server/src/kernel/cromos/physics/field.ts?utm_source=chatgpt.com) introduce un campo escalar que calcula una energía a partir de los pesos de atención.

La fórmula existente es elemental:

\\[ E=\frac{1}{n}\sum\_{i=1}^{n}w_i^2 \\]

Representa la magnitud de la atención, pero todavía no distingue direcciones ni relaciones de polaridad.

Trans06 debería estudiar su evolución hacia mecanismos sencillos de afinidad, oposición, intensidad, relevancia y contextualización, aprovechando las estructuras actuales y evitando duplicar el Global Workspace.

Ambos módulos están expresamente marcados como pendientes de cableado. Esto significa que disponemos de un punto de partida conceptual y de código preliminar, no de un núcleo axiomático integrado y certificado.

## **6. La card como unidad fundamental de representación**

Una de las principales fortalezas de la arquitectura actual es que ya dispone de una ontología cognitiva estructurada.

La card no debe entenderse únicamente como una tarjeta visual ni como un fragmento de memoria. Es una unidad de representación semántica que puede contener conocimiento, evidencia, intención, relaciones, incertidumbre y potencial operativo.

Actualmente existen ocho familias y tres ejes cromáticos.

Observación

Hipótesis

Riesgo

Oportunidad

Procedimiento

Decisión

Resultado

Vacío de conocimiento

Ejes y familias existentes en la ontología actual. La geometría es una representación conceptual.

También existen dimensiones que permiten expresar relevancia, urgencia, evidencia, impacto, novedad, incertidumbre, preparación para actuar, conflicto, vigencia y coste de resolución.

Este conjunto constituye un lenguaje organizativo considerablemente más rico que un sistema convencional de documentos, embeddings y búsquedas vectoriales.

Trans06 debería ampliar su utilidad transversal sin sustituir la ontología actual ni obligar a convertir todas las entidades empresariales en cards.

Una factura sigue siendo una factura. Un cliente sigue siendo un cliente. Una card puede representar conocimiento acerca de ellos y relacionarlos con necesidades, objetivos, riesgos y oportunidades, pero no sustituye al registro empresarial autorizado.

**El núcleo organiza las representaciones de la realidad empresarial sin confundirse con la realidad empresarial que representan.**

## **7. Trasvasar los principios cognitivos a la organización empresarial**

Hasta ahora, una parte considerable de estos mecanismos ha sido concebida para organizar conocimiento y actividad conversacional.

Trans06 debe investigar cómo los mismos principios pueden aplicarse a los procesos, recursos, relaciones y estructuras de una organización.

| Principio         | Aplicación cognitiva                 | Aplicación empresarial                         |
| ----------------- | ------------------------------------ | ---------------------------------------------- |
| Identidad         | Identificación de una representación | Identificación de una entidad o recurso        |
| Afinidad          | Asociación de conocimiento relevante | Compatibilidad entre necesidades y capacidades |
| Polaridad         | Orientación de una card              | Tendencias y objetivos operativos              |
| Contradicción     | Incompatibilidad entre afirmaciones  | Conflicto entre requisitos o estados           |
| Consolidación     | Organización de conocimiento         | Simplificación de procesos                     |
| Transformación    | Revisión de representaciones         | Modificación de estados empresariales          |
| Descarte          | Retirada de información irrelevante  | Retirada de estructuras obsoletas              |
| Retroalimentación | Revisión de conocimiento             | Evaluación de resultados operativos            |

Por ejemplo, si una empresa posee tres procedimientos diferentes que cubren esencialmente la misma necesidad, Slow podría identificar una afinidad funcional entre ellos. JEV podría clasificar sus semejanzas y diferencias. El sistema podría conservar las relaciones y evidencias correspondientes. Posteriormente, el compilador empresarial podría proponer un procedimiento consolidado.

El kernel comprobaría las condiciones necesarias para admitir la propuesta. Si se autoriza, el runtime materializaría la transformación mediante las capacidades existentes.

De esta manera, no estamos desarrollando un algoritmo específico para cada problema empresarial. Estamos creando un sustrato común que permite representar problemas diferentes y organizar sus posibles soluciones.

## **8. La gramática universal de validación**

El núcleo necesita distinguir entre aquello que puede admitir, aquello que debe rechazar y aquello sobre lo que todavía no dispone de conocimiento suficiente.

Aquí resulta útil separar tres cosas:

- La polaridad de una representación.
- El grado de conocimiento disponible acerca de ella.
- La decisión de autoridad sobre una operación.

Una oportunidad puede tener una afinidad muy elevada con los objetivos de una empresa y, sin embargo, no estar autorizada. Una hipótesis puede ser relevante sin ser verdadera. Una operación puede estar permitida y resultar temporalmente inviable.

Estas dimensiones no deben confundirse.

Como hipótesis de trabajo, Trans06 debería investigar nueve aspectos generales de validación:

| Aspecto           | Pregunta fundamental                                   |
| ----------------- | ------------------------------------------------------ |
| Identidad         | ¿Qué es y a qué totalidad pertenece?                   |
| Existencia        | ¿Existe el referente o el recurso?                     |
| Evidencia         | ¿Qué sostiene la representación?                       |
| Intención         | ¿A qué necesidad u objetivo responde?                  |
| Autoridad         | ¿Quién puede admitir la transformación?                |
| Coherencia        | ¿Es compatible con las invariantes existentes?         |
| Viabilidad        | ¿Puede materializarse con las capacidades disponibles? |
| Transformación    | ¿Qué cambia y qué permanece?                           |
| Retroalimentación | ¿Qué ha sucedido realmente?                            |

No propongo establecer todavía estos nueve aspectos como la jerarquía definitiva del 0 al 8. Son un conjunto de preguntas útiles para contrastar con la arquitectura existente.

Una de las labores de Trans06 sería descubrir cuáles son verdaderamente primitivas, cuáles pueden derivarse de otras y cuáles ya están implementadas bajo nombres diferentes.

El resultado ideal no es necesariamente un kernel más grande, sino un kernel conceptualmente más pequeño y consistente.

## **9. El ciclo de transformación**

AgntiaPro ya contiene un ciclo cognitivo de seis fases: percibir, atender, decidir, actuar, reflexionar y consolidar.

También dispone de reglas deterministas de promoción y descarte, mecanismos de consolidación y diferentes destinos para las representaciones.

Trans06 debería relacionar estas estructuras con el ciclo operativo empresarial, preservando las fronteras de autoridad.

**1. Manifestación**

Lenguaje humano, eventos, documentos, observaciones y estados empresariales.

**2. Interpretación**

Slow comprende el contexto y propone representaciones o transformaciones.

**3. Organización**

Cards, JEV, cromos, grafos, afinidades y atención global.

**4. Validación**

El kernel comprueba invariantes, identidad, evidencia y autoridad.

**5. Materialización**

El runtime ejecuta capacidades y SOPs autorizados.

**6. Retroalimentación**

Los receipts, eventos y evidencias representan el nuevo estado.

**7. Consolidación**

El sistema reorganiza conocimiento, relaciones y posibilidades.

Nuevo ciclo sobre una realidad transformada.

Fast puede comunicar cualquiera de estos estados al humano mediante lenguaje natural, con información contextualizada y autorizada.

No necesita conocer todos los mecanismos internos ni reproducir el razonamiento de Slow. Recibe las representaciones seleccionadas por el sistema y las expresa de una manera adecuada a la situación profesional.

## **10. Una inteligencia empresarial sin conocimiento profesional dentro del kernel**

El conocimiento de un abogado, un gestor, un comercial, un arquitecto o un responsable de recursos humanos seguirá siendo predominantemente lingüístico.

No queremos codificar miles de conceptos profesionales en el kernel.

La especialización se conseguirá mediante los mecanismos que ya hemos diseñado: conocimiento empresarial, RAG, fine-tuning, perfiles conversacionales, skills narrativas, contexto, SOPs tipados y capacidades instalables.

Los dieciséis repositorios de capacidades empresariales que has desarrollado permiten ampliar considerablemente lo que el sistema puede realizar sin convertir cada especialización en una modificación de su núcleo.

Cuando compilemos una empresa, estaremos configurando la personalidad operativa de sus procesos, sus criterios, sus relaciones, sus preferencias y sus formas de comunicación.

La misma infraestructura podrá operar una gestoría, una agencia comercial o una empresa de producción audiovisual sin que las tres se conviertan en organizaciones artificialmente idénticas.

El núcleo aporta principios comunes. La compilación aporta diferenciación. Los LLM aportan riqueza expresiva y capacidad de adaptación.

**Universalidad estructural y diversidad semántica.**

# **Alineación de Trans06 con las cinco campañas anteriores**

Trans06 debe constituir una extensión coherente de la arquitectura, no una sexta implementación independiente de los mecanismos que ya están siendo consolidados.

## **Trans01 — Autoridad, kernel y runtime**

Trans06 debe apoyarse en los contratos de autoridad, causalidad, aprobación, ejecución y receipts consolidados por Trans01.

Los axiomas organizativos pueden ayudar a determinar la admisibilidad de una transformación, pero no pueden crear permisos, eludir aprobaciones ni ejecutar acciones directamente.

Las transformaciones deben preservar las garantías de idempotencia, revisión, trazabilidad, aislamiento y reconciliación.

La destrucción de una estructura, por ejemplo, nunca debería implicar automáticamente la eliminación irreversible de su historial. Puede representar una retirada, una invalidación, una sustitución o una transición autorizada.

Trans01 determina las garantías con las que se materializan esas transformaciones.

## **Trans02 — Cognition e inteligencia distribuida**

Trans06 debe aprovechar Cognition V2, la ontología, las memorias, el grafo, los snapshots, JEV, Slow y los mecanismos de atención global.

Los principios organizativos podrían intervenir en la interpretación, selección y relación de representaciones. Slow podría utilizar estos marcos para observar una situación desde diferentes perspectivas.

JEV podría proporcionar clasificaciones semánticas acerca de los aspectos propuestos, conservando siempre su naturaleza no autoritativa.

No debemos crear otro sistema de atención, otro grafo cognitivo ni otro mecanismo de generación de cards.

Trans06 enriquecería los mecanismos consolidados por Trans02 mediante contratos explícitos y reutilizables.

## **Trans03 — Proveedores y mundo exterior**

La organización semántica adquiere valor empresarial cuando puede relacionarse con operaciones reales.

Trans03 proporciona los puertos y adaptadores que permiten esa interacción.

Trans06 debe utilizar sus representaciones de efectos, estados, recursos y evidencias sin interpretar una respuesta lingüística como prueba de que una operación ha sucedido.

Enviar, crear, vender, adquirir, retirar o modificar deben adquirir significado operativo mediante los contratos de las capacidades y los receipts correspondientes.

La afinidad de una propuesta no confirma su resultado. Un envío aceptado por un proveedor tampoco demuestra necesariamente su entrega.

## **Trans04 — Observabilidad y certificación**

Toda propuesta de principio organizativo debe poder observarse, medirse y someterse a pruebas.

Trans04 deberá permitir analizar si las nuevas estructuras mejoran realmente la selección, la coherencia, la recuperación de conocimiento y la coordinación empresarial.

Las métricas deberán detectar errores, contradicciones, propagaciones incorrectas, ciclos improductivos, sobrecarga y pérdida de contexto.

No basta con demostrar que una representación geométrica o un modelo conceptual es elegante. Debemos demostrar que su aplicación proporciona utilidad medible sin degradar el rendimiento, la seguridad ni la estabilidad del software.

## **Trans05 — Continuidad cognitiva, metacognición y skills**

Trans05 constituye el complemento semántico más directo de Trans06.

Ya contempla anclajes longitudinales, axiomas de conversación, modelos de conocimiento, skills cognitivas, principios fundamentales, briefs dinámicos y compilación de skills narrativas.

La distinción será que Trans05 mantiene y organiza el conocimiento contextual a lo largo del tiempo, mientras que Trans06 investiga los principios estructurales comunes que podrían gobernar esas organizaciones.

Un axioma expresado por el fundador en una conversación debe conservar su procedencia, contexto y vigencia. No se convierte automáticamente en una invariante ejecutable del kernel.

Trans06 podría ofrecer mecanismos para formalizar aquellos principios cuya aplicación haya sido estudiada, aprobada y verificada.

Ambas campañas deben colaborar sin duplicar almacenamiento, selectores, skills, proyecciones ni mecanismos de actualización.

# **Propuesta de macrocampaña Trans06**

Mantendría nuestra metodología de doce fases, con cuatro bloques de trabajo por fase: diseño, implementación auditada, refactorización y hardening.

| Fase | Objeto de investigación y desarrollo                                 |
| ---- | -------------------------------------------------------------------- |
| 01   | Auditoría y recuperación integral del sustrato axiomático existente. |
| 02   | Identidad, totalidad, relaciones y primitivas universales.           |
| 03   | Polaridades relativas, contexto y cambio de escala.                  |
| 04   | Evolución y cableado controlado de los cromos existentes.            |
| 05   | Campos organizativos, afinidad, intensidad y relevancia.             |
| 06   | Integración con cards, ontología y grafo cognitivo.                  |
| 07   | Propagación hacia entidades y relaciones empresariales.              |
| 08   | Representación de transformaciones, recursos y procesos.             |
| 09   | Composición recursiva y organización multiescala.                    |
| 10   | Wiring con Slow, JEV, Global Workspace, Trans05 y Fast.              |
| 11   | Aplicación a la compilación y personalidad operativa empresarial.    |
| 12   | Simulación, dogfooding, simplificación y certificación.              |

La investigación del núcleo definitivo se desarrollará paralelamente a la observación de las tres empresas propias. Aquellas hipótesis que todavía no dispongan de respaldo suficiente permanecerán en estado experimental.

No convertiría esta investigación abierta en una dependencia bloqueante para terminar las otras cinco campañas. Los componentes independientes y verificables podrán avanzar; su activación integral dependerá de los contratos compartidos y de la certificación correspondiente.

# **El criterio fundamental de diseño**

Creo que toda esta propuesta puede condensarse en una pequeña declaración arquitectónica:

> AgntiaPro organiza representaciones lingüísticas mediante estructuras semánticas, relacionales y operativas. Su núcleo contiene un conjunto mínimo de principios organizativos independientes del dominio, aplicables recursivamente a diferentes escalas. Estos principios permiten diferenciar, relacionar, validar, conservar y transformar estructuras sin sustituir la inteligencia semántica de los LLM ni la autoridad determinista del software.
>
> La organización empresarial emerge de la composición contextual de conocimiento, relaciones, recursos, capacidades y procedimientos. El kernel permanece estable; las empresas adquieren su personalidad mediante la compilación.
>
> Cada transformación modifica las condiciones desde las que se interpreta la siguiente situación, produciendo un ciclo continuo de observación, organización, acción y retroalimentación.

En definitiva, Trans06 buscaría que el principio organizativo del software fuese coherente desde la unidad más pequeña de conocimiento hasta la empresa completa.

**La máxima complejidad semántica posible sobre la mínima complejidad axiomática necesaria.**
