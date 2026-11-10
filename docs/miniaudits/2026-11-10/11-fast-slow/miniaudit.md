# Bloque 11 · Fast/slow

> Campaña UX · 2026-11-10 · **13 hallazgos** (S0 0 · S1 5 · S2 6 · S3 2)
> Estado: informe recibido. Validación pendiente.

## Hallazgos

| # | Sev | Hallazgo | Estado |
|---|---|---|---|
| 1 | S1 | Circuito abierto sin fallback: se ejecuta igual, el `return` sólo existe si hay alternativa. | Sin verificar |
| 2 | S1 | El bulkhead tampoco frena al último spec; el techo es blando. | Sin verificar |
| 3 | S1 | Fast sólo en chat y slow sólo en tarea: si falta uno, cae al modelo global. | Sin verificar |
| 4 | S1 | `SlowAuthor` sólo se invoca desde `sop-executor`: las tareas no-SOP no escriben razonamiento. | Sin verificar |
| 5 | S1 | La atención del slow se fabrica con un nodo inexistente y peso 0,6/0,8. | Sin verificar |
| 6 | S2 | La atención del fast se deriva por subcadena del propio texto; el peso es una función de longitudes. | Sin verificar |
| 7 | S2 | Confianza constante: 0,9 fast y 0,8 slow. | Sin verificar |
| 8 | S2 | Sin telemetría de spec, intento ni motivo de fallback. | Sin verificar |
| 9 | S2 | El fallback no reintenta el mismo spec ante un error transitorio. | Sin verificar |
| 10 | S2 | Tras el primer byte, el timeout total corta el stream sin alternativa. | Sin verificar |
| 11 | S2 | El bulkhead vive en `globalThis` y no se limpia. | Sin verificar |
| 12 | S3 | `envApiKeyFor` sólo reconoce cinco proveedores. | Sin verificar |
| 13 | S3 | `chainApiKeys` exige igualdad exacta del alias: un alias distinto pierde la key del tenant. | Sin verificar |

## Arreglos propuestos

1. **Circuito abierto = no llamar.** El `return` no puede depender de que exista alternativa: si no hay fallback, se devuelve error tipado y no se ejecuta la llamada que el circuito acaba de vetar.
2. **Bulkhead con techo duro** (semáforo que bloquea al último, no que se salta) y sin estado en `globalThis`.
3. **Atención y confianza desde el dato**: hoy son constantes (0,9 / 0,8) y longitudes de texto. Si no hay señal, se declara ausente en vez de fabricar un número.
4. **Telemetría mínima**: spec elegido, intento, motivo de fallback. Sin eso no se puede decir si el fast/slow está sirviendo de algo.
5. **Fallback que reintenta el mismo spec** ante error transitorio y `chainApiKeys` por alias normalizado, no por igualdad exacta.

## Plan

- **P1 (circuito y bulkhead)**: respetar el veto y acotar la concurrencia de verdad.
- **P2 (señal)**: quitar constantes de confianza/atención; telemetría de spec e intento.
- **P3 (keys)**: alias normalizado y cobertura de proveedores en `envApiKeyFor`.

---

## Revisión de destino

El diferencial del kernel es "cada turno se registra como Thought con AttentionVector". Si la atención se deriva por subcadena y la confianza es 0,9/0,8 constantes, el dato que se registra es inventado:

- Quitar constantes: si no hay señal, declararla ausente.
- Telemetría de spec, intento y motivo de fallback para poder explicar cada turno.
- Respetar el circuito abierto y acotar el bulkhead de verdad.

## Conclusión

Hoy el fast/slow no es medible ni explicable, así que no se puede defender ante un cliente. **P1**: no rompe el flujo, pero desactiva el diferencial del kernel.
