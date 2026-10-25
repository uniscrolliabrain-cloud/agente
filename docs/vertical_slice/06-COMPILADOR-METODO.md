# 06 — Método del compilador de empresas

> Este documento no describe un vertical slice. Describe **el método** con el que compilas una empresa. Se prueba primero contigo (cliente beta). Mañana se aplica al cliente (alpha) en videollamada. Cada fichero del folder `clientes/mi-agencia/` es un ladrillo del compilador.

## Qué es el compilador

El compilador no es un script. Es un **método de 7 pasos** que convierte la definición de una empresa en un tenant operativo. Cada paso produce artefactos concretos en `clientes/<tenant>/`.

| Paso | Qué produces | Ficheros |
|---|---|---|
| 1 | Ontología de la empresa (dominios, entidades, relaciones, data sources, necesidades) | `ontology/*.json` |
| 2 | Agentes y memorias | `agents/*.json`, `memories/<agent>/*.md` |
| 3 | SOPs, skills, boilerplates, frameworks | `sops/*.json`, `skills/*.md`, `boilerplates/*.md`, `frameworks/*.md` |
| 4 | Configuración (canales, modelos, cuotas) | `config.json` |
| 5 | Bundle que referencia todo | `bundle.json` |
| 6 | Validación + compilación + bootstrap | `validateBundle`, `compileBundle`, `bootstrapTenant` |
| 7 | Prueba en chat, WhatsApp, email y workers | tests E2E |

## El cuestionario de compilación

Lo que preguntas al jefe o a alguien de su equipo en videollamada. **Tú ya lo has respondido para tu empresa (cliente beta). Mañana lo respondes con el cliente (alpha).**

### Bloque 1 — Empresa

1. ¿Cómo se llama tu empresa y a qué se dedica?
2. ¿Qué servicios vende?
3. ¿A quién se los vende (pyme, autónomo, gran empresa, sector)?
4. ¿Qué problema resuelve?
5. ¿Cuál es su ventaja frente a la competencia?

### Bloque 2 — Dominios

6. ¿Qué áreas tiene tu empresa? (captación, venta, operación, soporte, finanzas, legal, RRHH…)
7. ¿Qué hace cada área?
8. ¿Qué información necesita cada área para funcionar?
9. ¿Qué data produce cada área?

### Bloque 3 — Entidades y relaciones

10. ¿Qué "cosas" maneja tu empresa? (lead, cliente, propuesta, contrato, tenant, SOP, agente, factura…)
11. ¿Cómo se relacionan? (lead → propuesta → contrato → tenant)
12. ¿Qué estados tiene cada una? (lead: new, qualified, proposal, won, lost)

### Bloque 4 — Data sources

13. ¿Dónde vive la data? (Gmail, WhatsApp, Calendar, Sheets, Drive, CRM, Supabase…)
14. ¿Qué data es privada y qué data es compartida?
15. ¿Qué data necesita el agente para responder?

### Bloque 5 — Agentes

16. ¿Qué agentes necesita tu empresa? (atención, ventas, operaciones, soporte…)
17. ¿Cómo habla cada agente? (tono: warm, concise, thoughtful)
18. ¿Qué sabe cada agente de tu negocio? (identidad, dominio, preferencias, historial)
19. ¿Qué puede hacer cada agente? (tools permitidas)
20. ¿Qué NO puede hacer? (límites, aprobaciones)

### Bloque 6 — Procesos

21. ¿Qué procesos tienes? (captar lead, atender lead, cerrar cliente, operar tenant…)
22. ¿Qué pasos tiene cada proceso?
23. ¿Qué herramientas usa cada paso?
24. ¿Qué resultado produce cada proceso?
25. ¿Qué se hace si falla un paso?

### Bloque 7 — Plantillas

26. ¿Qué emails envías? (bienvenida, seguimiento, propuesta, cierre)
27. ¿Qué mensajes de WhatsApp envías? (saludo, seguimiento, confirmación)
28. ¿Qué propuestas envías?
29. ¿Qué scripts usas en llamadas?
30. ¿Qué frameworks usas para vender y operar?

## El método de 7 pasos

### Paso 1 — Ontología

Produces 5 ficheros en `clientes/<tenant>/ontology/`:

- `domains.json`: qué áreas tiene la empresa.
- `entities.json`: qué cosas maneja.
- `relations.json`: cómo se relacionan.
- `data-sources.json`: dónde vive la data.
- `needs.json`: qué información necesita cada dominio.

**Validación**: `validateOntology(tenantDir)` comprueba que las entidades referenciadas existen, que las relaciones apuntan a entidades válidas, que los data sources están declarados.

### Paso 2 — Agentes y memorias

Produces en `clientes/<tenant>/agents/` y `clientes/<tenant>/memories/`:

- `agents/<id>.json`: nombre, tono, objetivo, tools permitidas, memorias referenciadas.
- `memories/<agent>/identidad.md`: quién es.
- `memories/<agent>/dominio.md`: qué sabe del negocio.
- `memories/<agent>/preferencias.md`: cómo le gusta trabajar.
- `memories/<agent>/historial.md`: qué ha aprendido.

**Validación**: `validateAgents(tenantDir)` comprueba que cada agente referencia tools existentes, que las memorias existen, que el tono es válido.

### Paso 3 — SOPs, skills, boilerplates, frameworks

Produces en `clientes/<tenant>/`:

- `sops/<process>.json`: pasos del proceso, tools, dependencias, compensación.
- `skills/<skill>.md`: habilidades del agente (cold email, follow-up, propuesta).
- `boilerplates/<template>.md`: plantillas de email, WhatsApp, propuesta.
- `frameworks/<framework>.md`: pipeline de venta, onboarding de cliente.

**Validación**: `validateSOPs(tenantDir)` comprueba que cada paso referencia una tool existente, que las dependencias son acíclicas, que los SOPs referenciados por agentes existen.

### Paso 4 — Configuración

Produces `clientes/<tenant>/config.json`:

- Modelos fast/slow (provider, model).
- Cuotas (tokens, coste, calls/hora).
- Canales (email, WhatsApp, teléfono, chat).
- Credenciales (referencias a secrets, no los secrets).

**Validación**: `validateConfig(tenantDir)` comprueba que los modelos existen, que las cuotas son válidas, que los canales están configurados.

### Paso 5 — Bundle

Produces `clientes/<tenant>/bundle.json`:

- Referencia a `ontology/`, `agents/`, `sops/`, `config.json`.
- Metadatos: `tenantId`, `version`, `compiledAt`.

**Validación**: `validateBundle(tenantDir)` ejecuta los 4 validadores anteriores en orden.

### Paso 6 — Compilación y bootstrap

Ejecutas:

```
pnpm provision-client --from-bundle clientes/<tenant>
```

**Qué hace**:

1. `validateBundle` (falla si algo no cuadra).
2. `compileBundle` (parsea y produce `TenantBundle` tipado).
3. `bootstrapTenant(db, config, bundle)` (registra capabilities, agentes, SOPs, canales en los registries reales).
4. Inserta en `user_tenants` (`user_id` del Google email, `tenant_id`).

**Resultado**: tenant operativo. El cliente entra con su Google. El backend aísla por tenant.

### Paso 7 — Prueba

Pruebas en 4 sitios:

- **Chat**: `ConversationAgent` con el agente del tenant. Responde con su identidad, su dominio, sus preferencias.
- **WhatsApp**: webhook → `createTask` → SOP `responder_lead`. Responde con el mismo agente.
- **Email**: `prepare_email` desde el SOP. Envía con la plantilla del tenant.
- **Workers**: `worker.tick()` ejecuta el SOP, escribe `outcome`, persiste.

**Criterio**: los 4 verdes. El agente responde con su data. El SOP produce outcome. El worker ejecuta y persiste.

## El cajón versátil

Cada cliente tiene su ontología, sus agentes, sus SOPs. **No se generaliza.** Se define desde cero con el cuestionario.

**Lo que NO se define desde cero**:

- Kernel (turnos, thoughts, attention).
- Authz (PDP, PEP, policy engine).
- Idempotencia (claim atómico, recuperación).
- Worker (leases, checkpoints, dead-letter).
- Canales (email, WhatsApp, teléfono).
- Event bus.
- Memoria + RAG + embeddings.

**Eso es el motor. Es tuyo. No se toca por cliente.**

**Lo que SÍ se define desde cero**:

- Ontología (dominios, entidades, relaciones, data sources, necesidades).
- Agentes y memorias.
- SOPs, skills, boilerplates, frameworks.
- Config (modelos, cuotas, canales).

**Eso es la compilación. Es del cliente. Se define con el cuestionario.**

## La prueba de que el método funciona

Tú. Tu empresa compilada, operando. **Eres el primer caso del compilador.**

Mañana, con el cliente (alpha), aplicas el mismo método. **El método ya está probado.** No improvisas. Sigues los 7 pasos. El cuestionario ya lo has respondido para ti. El cliente responde lo suyo. Tú compilas.

## Lo que NO es este método

- **No es un template rígido**. No hay "bundle de gestoría" y "bundle de agencia". Hay un método que produce el bundle de cada empresa.
- **No es self-service**. El cliente no se compila solo. Tú lo compilas. Eso es el servicio pro.
- **No es multi-sector de golpe**. Empiezas contigo. Después el alpha. Después el siguiente. Cada uno con su ontología.