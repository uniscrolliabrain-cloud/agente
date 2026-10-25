# 05 — Métricas del piloto (para vender el segundo cliente)

> El piloto no se cierra porque funcione. Se cierra porque **mides lo que funciona y lo usas para vender el segundo cliente**. Sin métricas, el segundo cliente no existe.

## Qué mides (y por qué)

| Métrica | Cómo se mide | Por qué importa |
|---|---|---|
| **Leads capturados** | `AgentTask` con `kind: "sop"` y `state.sopId: "responder-lead"` ejecutadas con éxito | Es la prueba de que el sistema atiende |
| **Leads cualificados** | `lead.status !== "new"` después del SOP | Es la prueba de que el sistema cualifica, no solo responde |
| **Citas agendadas** | `appointment.create` con `status: "confirmed"` + `prepare_event` aprobado | Es la prueba de que el sistema convierte |
| **Tiempo de primera respuesta** | `task.createdAt` → `outcome.verifiedAt` (P50, P95) | Es la prueba de que el sistema responde rápido |
| **Tiempo ahorrado** | (tiempo manual estimado del cliente) - (tiempo real con el sistema) | Es la prueba de ROI |
| **Coste por lead** | `llm-usage.costEur` / leads capturados | Es la prueba de que el precio tiene margen |
| **Coste por tenant** | `llm-usage.costEur` agrupado por tenant | Es la prueba de que no pierdes dinero |
| **Errores** | `AgentTask.status === "failed"` + `dead-letter` | Es la prueba de que el sistema es fiable |
| **Satisfacción** | Encuesta al cliente (1-5) + renovación | Es la prueba de que el cliente lo quiere |

## Cómo lo mides (queries concretas)

### Leads capturados por el SOP

```sql
SELECT COUNT(*)
FROM agent_tasks
WHERE tenant_id = 'piloto-gestoria'
  AND kind = 'sop'
  AND status = 'succeeded'
  AND created_at > now() - interval '7 days';
```

### Leads cualificados

```sql
SELECT COUNT(*)
FROM business_entities
WHERE tenant_id = 'piloto-gestoria'
  AND type = 'lead'
  AND status != 'new'
  AND created_at > now() - interval '7 days';
```

### Citas agendadas

```sql
SELECT COUNT(*)
FROM business_entities
WHERE tenant_id = 'piloto-gestoria'
  AND type = 'appointment'
  AND status = 'confirmed'
  AND created_at > now() - interval '7 days';
```

### Tiempo de primera respuesta (P50, P95)

```sql
SELECT
  percentile_cont(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (outcome->>'verifiedAt'::timestamptz - created_at))) AS p50,
  percentile_cont(0.95) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (outcome->>'verifiedAt'::timestamptz - created_at))) AS p95
FROM agent_tasks
WHERE tenant_id = 'piloto-gestoria'
  AND kind = 'sop'
  AND status = 'succeeded'
  AND created_at > now() - interval '7 days';
```

### Coste por lead

```sql
SELECT
  SUM(cost_eur) AS total_cost,
  COUNT(DISTINCT lead_id) AS leads,
  SUM(cost_eur) / NULLIF(COUNT(DISTINCT lead_id), 0) AS cost_per_lead
FROM llm_usage
WHERE tenant_id = 'piloto-gestoria'
  AND created_at > now() - interval '7 days';
```

### Errores

```sql
SELECT COUNT(*), error
FROM agent_tasks
WHERE tenant_id = 'piloto-gestoria'
  AND status = 'failed'
  AND created_at > now() - interval '7 days'
GROUP BY error
ORDER BY COUNT(*) DESC;
```

## Documento de validación

`docs/operacion/PILOTO-<cliente>.md`:

```markdown
# Piloto: Gestoría Pérez

## Periodo
2026-XX-XX a 2026-XX-XX (2 semanas)

## Métricas

| Métrica | Valor | Notas |
|---|---|---|
| Leads capturados | 40 | Todos por WhatsApp y email |
| Leads cualificados | 28 | 12 no cualificados (fuera de servicio) |
| Citas agendadas | 12 | 100% en Google Calendar del cliente |
| Tiempo de primera respuesta | P50: 45s, P95: 2m 10s | Antes: 4h de media |
| Tiempo ahorrado | ~20h/semana | 40 leads × 30 min manual = 20h |
| Coste por lead | 0.12€ | Modelo Gemini Flash |
| Coste total | 4.80€ | 40 leads × 0.12€ |
| Errores | 2 | 1 por WhatsApp sin número, 1 por Sheet bloqueado |
| Satisfacción | 5/5 | "Ha cambiado cómo trabajamos" |

## Antes / después

| Antes | Después |
|---|---|
| 4h de media para responder | 45s de media |
| 30% de leads perdidos | 0% perdidos |
| 0 citas agendadas automáticamente | 12 citas en 2 semanas |
| 0€ de coste | 4.80€ de coste |
| 20h/semana de trabajo manual | ~0h de trabajo manual |

## Conclusión

El piloto ahorra 20h/semana. Cuesta 4.80€ en tokens. Se vende a 299€/mes. Margen: 294€/mes por tenant.

## Renovación

El cliente renueva. Quiere:
1. Teléfono (asistente telefónico).
2. Segundo agente para postventa.
3. Integración con Holded.

Esos son los siguientes bloques del roadmap.
```

## Cómo usas las métricas para vender el segundo cliente

1. **Caso de uso**: "Gestoría Pérez capturó 40 leads, agendó 12 citas, ahorró 20h/semana en 2 semanas. Coste: 4.80€. Precio: 299€/mes."
2. **Demo**: el segundo cliente ve el panel de Gestoría Pérez (leads, citas, conversaciones) sin ver los datos personales.
3. **Oferta**: "Mismo sistema para tu gestoría. Compilo en 24h. Primer mes gratis. Si no capturas 20 leads, no pagas."
4. **Cierre**: el segundo cliente firma. Tú ejecutas `provision-client --from-template _template --tenant cliente2`. 1 comando, 1 tenant, 1 cliente pagando.

## Criterio de cierre del piloto

El piloto se cierra (y se pasa al segundo cliente) cuando:

- **El cliente renueva** o **paga la siguiente fase**.
- **Tienes las métricas** de las 2 semanas en `docs/operacion/PILOTO-<cliente>.md`.
- **Tienes el caso de uso** listo para vender: 1 página, 3 métricas, 1 precio.
- **El segundo cliente está identificado** y ha visto la demo.

Si el cliente no renueva, **el producto no vale**. Se pivota o se para. Mejor saberlo en la semana 11 que en la 52.