# A03 · Laia con evidencia

**Carril:** C3 · **Rama:** `sprint/r01-a03-laia` · **Superficie:** `sprints/r01/a03-laia/`, `clientes/agntia/`

## Estado medido sobre `0c8fe81`

- `clientes/agntia/` contiene **solo** `agency.json` y `sops.ts`. **No hay carpeta `personas/`**: el tenant comercial no tiene organigrama propio.
- Las 13 personas (12 + `_index.json`) viven en `clientes/default/personas/` y las 12 con `reportsTo` apuntan a `laia`.
- `agency.json` está bien de ICP, pricing (490/890/1490 EUR) y boundaries, y **vacío de pipeline**: `"pipeline": []`.
- Las SOPs declaran sus reglas de diseño en la cabecera, y son buenas: nada que mande algo a un tercero se envía, todo pasa por `prepare_email` / `prepare_event`.

## El problema de fondo

El vertical se vende con tres frases concretas: *leads atendidos, citas agendadas, horas ahorradas*. Hoy el repo no puede demostrar ninguna de las tres con un dato de producción. Un agente que "responde sobre Laia" sin fuente es exactamente lo que el boundary `"No inventar datos del negocio del lead"` prohíbe.

## Preguntas (las cinco del ICP, con fuente o con "no hay dato")

1. ¿Cuántos leads entraron, de dónde y cuántos siguen en `new`?
2. ¿Cuántas conversaciones de WhatsApp se respondieron y en cuánto tiempo?
3. ¿Cuántas citas se agendaron y en qué calendario?
4. ¿Cuántas horas ahorradas se pueden atribuir, con qué fórmula?
5. ¿Qué pasa hoy si un lead pregunta el precio: qué texto exacto sale y de dónde viene?

Para cada una: **fuente** (tabla/endpoint/fichero), **fecha** del dato y si el sistema puede responderla hoy.

## Entregable del sprint

`sprints/r01/a03-laia/CINCO-PREGUNTAS.md` con las cinco respuestas en tres columnas: *lo que el sistema puede responder hoy*, *lo que hay que construir*, *lo que no se puede prometer*. Y `ORGANIGRAMA.md` decidiendo, con argumento, si `agntia` debe tener personas propias o heredar `default`.

## Gate

```bash
node --import tsx tests/laia-hierarchy.test.ts
node --import tsx tests/agent-persona.test.ts
```

Ambos tienen que seguir verdes: si tu cambio de organigrama los rompe, el cambio está mal, no el test.

## Trampa

Rellenar la tabla con lo que "debería" pasar. Una fila sin comando que la respalde se marca `NO VERIFICADO` y se deja así.
