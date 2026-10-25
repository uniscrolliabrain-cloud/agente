# 07 — Cuestionario de compilación de empresa

> **Pendiente de responder.** Este documento es el cuestionario que se responde para compilar una empresa. Tú lo respondes para tu empresa (cliente beta). Mañana se responde con el cliente (alpha) en videollamada. Cada pregunta tiene una respuesta que se convierte en un fichero de `clientes/<tenant>/`.

## Cómo se usa

- Cada bloque de preguntas produce uno o varios ficheros de `clientes/<tenant>/`.
- Las respuestas se escriben debajo de cada pregunta, con el formato que sea.
- Cuando un bloque esté respondido, se compila: `validateBundle` + `bootstrapTenant`.
- Si una pregunta no aplica, se escribe `N/A` y se explica por qué.

## Estado

| Bloque | Preguntas | Respondido | Compilado |
|---|---|---|---|
| 1. Empresa | 8 | ❌ | ❌ |
| 2. Dominios | 10 | ❌ | ❌ |
| 3. Entidades y relaciones | 12 | ❌ | ❌ |
| 4. Data sources | 10 | ❌ | ❌ |
| 5. Agentes | 14 | ❌ | ❌ |
| 6. Procesos y SOPs | 14 | ❌ | ❌ |
| 7. Skills y boilerplates | 12 | ❌ | ❌ |
| 8. Frameworks | 8 | ❌ | ❌ |
| 9. Configuración | 10 | ❌ | ❌ |
| 10. Canales | 10 | ❌ | ❌ |
| 11. Operación | 8 | ❌ | ❌ |
| 12. Legal y privacidad | 8 | ❌ | ❌ |
| 13. Métricas | 8 | ❌ | ❌ |
| **Total** | **132** | **0/132** | **0/132** |

---

## Bloque 1 — Empresa

**Produce**: `clientes/<tenant>/bundle.json` (sección `company`).

### 1.1 ¿Cómo se llama tu empresa?

Respuesta:

### 1.2 ¿A qué se dedica? (una frase)

Respuesta:

### 1.3 ¿Qué servicios vende? (lista)

Respuesta:

### 1.4 ¿A quién se los vende? (pyme, autónomo, gran empresa, sector)

Respuesta:

### 1.5 ¿Qué problema resuelve?

Respuesta:

### 1.6 ¿Cuál es su ventaja frente a la competencia?

Respuesta:

### 1.7 ¿Cuál es su propuesta de valor en 1 frase?

Respuesta:

### 1.8 ¿Cuál es su modelo de negocio? (suscripción, setup + mensual, por uso, otro)

Respuesta:

---

## Bloque 2 — Dominios

**Produce**: `clientes/<tenant>/ontology/domains.json` y `needs.json`.

### 2.1 ¿Qué áreas tiene tu empresa? (captación, venta, operación, soporte, finanzas, legal, RRHH…)

Respuesta:

### 2.2 ¿Qué hace cada área?

Respuesta:

### 2.3 ¿Qué información necesita cada área para funcionar?

Respuesta:

### 2.4 ¿Qué data produce cada área?

Respuesta:

### 2.5 ¿Qué áreas son core y cuáles son soporte?

Respuesta:

### 2.6 ¿Qué áreas están automatizadas hoy y cuáles no?

Respuesta:

### 2.7 ¿Qué áreas quieres automatizar primero?

Respuesta:

### 2.8 ¿Qué áreas no quieres automatizar nunca?

Respuesta:

### 2.9 ¿Qué áreas dependen de personas y cuáles de sistemas?

Respuesta:

### 2.10 ¿Qué áreas generan ingresos y cuáles generan coste?

Respuesta:

---

## Bloque 3 — Entidades y relaciones

**Produce**: `clientes/<tenant>/ontology/entities.json` y `relations.json`.

### 3.1 ¿Qué "cosas" maneja tu empresa? (lead, cliente, propuesta, contrato, tenant, SOP, agente, factura…)

Respuesta:

### 3.2 Para cada entidad, ¿qué campos tiene? (nombre, email, teléfono, estado, fecha…)

Respuesta:

### 3.3 Para cada entidad, ¿qué estados tiene? (lead: new, qualified, proposal, won, lost)

Respuesta:

### 3.4 ¿Cómo se relacionan las entidades? (lead → propuesta → contrato → tenant)

Respuesta:

### 3.5 ¿Qué entidades son obligatorias y cuáles opcionales?

Respuesta:

### 3.6 ¿Qué entidades se crean solas y cuáles las crea una persona?

Respuesta:

### 3.7 ¿Qué entidades se borran y cuáles se archivan?

Respuesta:

### 3.8 ¿Qué entidades tienen historial y cuáles no?

Respuesta:

### 3.9 ¿Qué entidades son privadas y cuáles compartidas?

Respuesta:

### 3.10 ¿Qué entidades necesitan aprobación para cambiar de estado?

Respuesta:

### 3.11 ¿Qué entidades son durables y cuáles efímeras?

Respuesta:

### 3.12 ¿Qué entidades ya existen en tu CRM/Sheets/Drive y cuáles hay que crear?

Respuesta:

---

## Bloque 4 — Data sources

**Produce**: `clientes/<tenant>/ontology/data-sources.json`.

### 4.1 ¿Dónde vive la data? (Gmail, WhatsApp, Calendar, Sheets, Drive, CRM, Supabase…)

Respuesta:

### 4.2 ¿Qué data es privada y qué data es compartida?

Respuesta:

### 4.3 ¿Qué data necesita el agente para responder?

Respuesta:

### 4.4 ¿Qué data necesita el agente para actuar (crear, actualizar)?

Respuesta:

### 4.5 ¿Qué data no debe ver el agente nunca?

Respuesta:

### 4.6 ¿Qué data se puede cachear y cuál no?

Respuesta:

### 4.7 ¿Qué data caduca y cuál es permanente?

Respuesta:

### 4.8 ¿Qué data se sincroniza en tiempo real y cuál por lotes?

Respuesta:

### 4.9 ¿Qué data viene de APIs externas y cuál es interna?

Respuesta:

### 4.10 ¿Qué data tiene coste por consulta (APIs de pago) y cuál es gratis?

Respuesta:

---

## Bloque 5 — Agentes

**Produce**: `clientes/<tenant>/agents/*.json` y `memories/<agent>/*.md`.

### 5.1 ¿Qué agentes necesita tu empresa? (atención, ventas, operaciones, soporte…)

Respuesta:

### 5.2 Para cada agente, ¿cómo se llama?

Respuesta:

### 5.3 Para cada agente, ¿qué tono tiene? (warm, concise, thoughtful)

Respuesta:

### 5.4 Para cada agente, ¿cuál es su objetivo en 1 frase?

Respuesta:

### 5.5 Para cada agente, ¿qué sabe de tu negocio? (identidad)

Respuesta:

### 5.6 Para cada agente, ¿qué dominio técnico tiene? (qué sabe hacer)

Respuesta:

### 5.7 Para cada agente, ¿qué preferencias tiene? (cómo le gusta trabajar)

Respuesta:

### 5.8 Para cada agente, ¿qué historial tiene? (qué ha aprendido)

Respuesta:

### 5.9 Para cada agente, ¿qué tools puede usar? (lista)

Respuesta:

### 5.10 Para cada agente, ¿qué tools NO puede usar? (límites)

Respuesta:

### 5.11 Para cada agente, ¿qué acciones requieren aprobación humana?

Respuesta:

### 5.12 ¿Qué agentes colaboran entre sí y cómo?

Respuesta:

### 5.13 ¿Qué agente es el principal y cuáles son de soporte?

Respuesta:

### 5.14 ¿Qué agente habla con el cliente y cuál opera por dentro?

Respuesta:

---

## Bloque 6 — Procesos y SOPs

**Produce**: `clientes/<tenant>/sops/*.json`.

### 6.1 ¿Qué procesos tienes? (captar lead, atender lead, cerrar cliente, operar tenant…)

Respuesta:

### 6.2 Para cada proceso, ¿qué pasos tiene?

Respuesta:

### 6.3 Para cada paso, ¿qué herramienta usa?

Respuesta:

### 6.4 Para cada paso, ¿qué input necesita y qué output produce?

Respuesta:

### 6.5 Para cada paso, ¿qué pasa si falla? (reintento, compensación, escalado)

Respuesta:

### 6.6 Para cada proceso, ¿qué triggers lo arrancan? (cron, email, WhatsApp, manual)

Respuesta:

### 6.7 Para cada proceso, ¿qué resultado produce? (outcome, artifact, mensaje)

Respuesta:

### 6.8 ¿Qué procesos son core y cuáles soporte?

Respuesta:

### 6.9 ¿Qué procesos son manuales hoy y cuáles automáticos?

Respuesta:

### 6.10 ¿Qué procesos quieres automatizar primero?

Respuesta:

### 6.11 ¿Qué procesos nunca deben ser automáticos?

Respuesta:

### 6.12 ¿Qué procesos requieren aprobación humana en algún paso?

Respuesta:

### 6.13 ¿Qué procesos son idempotentes y cuáles no?

Respuesta:

### 6.14 ¿Qué procesos se pueden compensar y cuáles no?

Respuesta:

---

## Bloque 7 — Skills y boilerplates

**Produce**: `clientes/<tenant>/skills/*.md` y `boilerplates/*.md`.

### 7.1 ¿Qué emails envías? (bienvenida, seguimiento, propuesta, cierre)

Respuesta:

### 7.2 Para cada email, ¿qué asunto y qué cuerpo?

Respuesta:

### 7.3 ¿Qué mensajes de WhatsApp envías? (saludo, seguimiento, confirmación)

Respuesta:

### 7.4 Para cada mensaje, ¿qué texto?

Respuesta:

### 7.5 ¿Qué propuestas envías? (estructura, secciones)

Respuesta:

### 7.6 ¿Qué scripts usas en llamadas? (apertura, cualificación, cierre)

Respuesta:

### 7.7 ¿Qué boilerplates usas para cold email?

Respuesta:

### 7.8 ¿Qué boilerplates usas para follow-up?

Respuesta:

### 7.9 ¿Qué skills necesita cada agente?

Respuesta:

### 7.10 ¿Qué skills son core y cuáles son nice-to-have?

Respuesta:

### 7.11 ¿Qué boilerplates ya tienes escritos y cuáles hay que escribir?

Respuesta:

### 7.12 ¿Qué boilerplates son privados y cuáles compartidos?

Respuesta:

---

## Bloque 8 — Frameworks

**Produce**: `clientes/<tenant>/frameworks/*.md`.

### 8.1 ¿Qué pipeline de venta usas? (etapas)

Respuesta:

### 8.2 ¿Qué framework de cualificación usas? (BANT, MEDDIC, otro)

Respuesta:

### 8.3 ¿Qué framework de onboarding usas?

Respuesta:

### 8.4 ¿Qué framework de operación usas? (revisión diaria, semanal, mensual)

Respuesta:

### 8.5 ¿Qué framework de soporte usas? (SLA, escalado)

Respuesta:

### 8.6 ¿Qué framework de feedback usas? (NPS, CSAT, otro)

Respuesta:

### 8.7 ¿Qué framework de crecimiento usas? (AARRR, otro)

Respuesta:

### 8.8 ¿Qué frameworks son tuyos y cuáles son de terceros?

Respuesta:

---

## Bloque 9 — Configuración

**Produce**: `clientes/<tenant>/config.json`.

### 9.1 ¿Qué modelo fast usas? (provider, model)

Respuesta:

### 9.2 ¿Qué modelo slow usas? (provider, model)

Respuesta:

### 9.3 ¿Qué modelo de embeddings usas?

Respuesta:

### 9.4 ¿Qué cuota de tokens/día tiene tu tenant?

Respuesta:

### 9.5 ¿Qué cuota de coste/día tiene tu tenant?

Respuesta:

### 9.6 ¿Qué cuota de llamadas fast/hora tiene tu tenant?

Respuesta:

### 9.7 ¿Qué cuota de llamadas slow/hora tiene tu tenant?

Respuesta:

### 9.8 ¿Qué maxSteps por turno tiene tu tenant?

Respuesta:

### 9.9 ¿Qué maxThoughtsPerTurn tiene tu tenant?

Respuesta:

### 9.10 ¿Qué quiescenceMs tiene tu tenant?

Respuesta:

---

## Bloque 10 — Canales

**Produce**: `clientes/<tenant>/bundle.json` (sección `channels`).

### 10.1 ¿Qué canales usas? (chat, WhatsApp, teléfono, email, social)

Respuesta:

### 10.2 Para cada canal, ¿qué provider? (WhatsApp Cloud API, Twilio, Gmail, LinkedIn…)

Respuesta:

### 10.3 Para cada canal, ¿qué credenciales necesitas?

Respuesta:

### 10.4 Para cada canal, ¿qué número/cuenta?

Respuesta:

### 10.5 ¿Qué canal es el principal y cuáles son secundarios?

Respuesta:

### 10.6 ¿Qué canal usa el agente para captar?

Respuesta:

### 10.7 ¿Qué canal usa el agente para atender?

Respuesta:

### 10.8 ¿Qué canal usa el agente para operar?

Respuesta:

### 10.9 ¿Qué canales son inbound y cuáles outbound?

Respuesta:

### 10.10 ¿Qué canales requieren aprobación humana?

Respuesta:

---

## Bloque 11 — Operación

**Produce**: `clientes/<tenant>/sops/operar-tenant.json` y docs de operación.

### 11.1 ¿Cómo monitorizas los tenants?

Respuesta:

### 11.2 ¿Qué métricas miras cada día?

Respuesta:

### 11.3 ¿Qué alertas necesitas?

Respuesta:

### 11.4 ¿Cómo avisas a un cliente si algo falla?

Respuesta:

### 11.5 ¿Cómo actualizas un tenant sin romperlo?

Respuesta:

### 11.6 ¿Cómo haces backup y restore?

Respuesta:

### 11.7 ¿Cómo gestionas las credenciales de cada tenant?

Respuesta:

### 11.8 ¿Cómo gestionas las cuotas y el coste por tenant?

Respuesta:

---

## Bloque 12 — Legal y privacidad

**Produce**: `clientes/<tenant>/README.md` (sección legal) y docs de operación.

### 12.1 ¿Qué datos personales tratas? (nombre, email, teléfono, dirección…)

Respuesta:

### 12.2 ¿Qué base legal tienes para tratarlos? (consentimiento, contrato, interés legítimo)

Respuesta:

### 12.3 ¿Dónde se almacenan y por cuánto tiempo?

Respuesta:

### 12.4 ¿Quién tiene acceso y cómo se audita?

Respuesta:

### 12.5 ¿Cómo se ejerce el derecho al olvido?

Respuesta:

### 12.6 ¿Qué pasa si hay una brecha de seguridad?

Respuesta:

### 12.7 ¿Qué contratos necesitas con el cliente?

Respuesta:

### 12.8 ¿Qué términos de servicio y privacidad necesitas publicar?

Respuesta:

---

## Bloque 13 — Métricas

**Produce**: `clientes/<tenant>/metrics.json` y docs de validación.

### 13.1 ¿Qué mides en captación? (leads, coste por lead, conversión)

Respuesta:

### 13.2 ¿Qué mides en venta? (propuestas, cierre, tiempo de cierre)

Respuesta:

### 13.3 ¿Qué mides en operación? (tenants activos, uptime, incidencias)

Respuesta:

### 13.4 ¿Qué mides en soporte? (tickets, tiempo de respuesta, satisfacción)

Respuesta:

### 13.5 ¿Qué mides en producto? (uso, features, retención)

Respuesta:

### 13.6 ¿Qué mides en finanzas? (MRR, churn, LTV, CAC)

Respuesta:

### 13.7 ¿Qué métricas son para ti y cuáles para el cliente?

Respuesta:

### 13.8 ¿Qué métricas se guardan y cuáles solo se muestran?

Respuesta:

---

## Cómo se compila

1. Respondes un bloque.
2. Escribes los ficheros de `clientes/mi-agencia/` correspondientes.
3. `validateBundle('clientes/mi-agencia')` pasa.
4. `bootstrapTenant(db, config, bundle)` registra todo.
5. Pruebas en chat, WhatsApp, email, worker.
6. Cuando los 4 verdes, el bloque está compilado.

## Lo que NO es este cuestionario

- **No es un formulario**. Las respuestas no se meten en un JSON a mano. Se escriben en los ficheros de `clientes/mi-agencia/`.
- **No es para el cliente**. El cliente no responde 132 preguntas. Tú preguntas lo que necesites en la videollamada. **Este cuestionario es para ti, para tu empresa.**
- **No es inmutable**. Si cambias de canal o de proceso, actualizas la respuesta y recompilas.