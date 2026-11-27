# Corpus del ejecutor Freebuff — Trans00 a Trans07

Documentación operativa para que un agente ejecutor continúe la convergencia de
`uniscrolliabrain-cloud/agente` sin volver a auditarla desde cero.

**Base de referencia:** `origin/integration/trans00-core` @ `892061c9` (2026-11-27).
**Auditoría forense que origina este corpus:** [`../98-auditorias/INFORME-AUDITORIA-CONVERGENCIA-2026-11-27.md`](../98-auditorias/INFORME-AUDITORIA-CONVERGENCIA-2026-11-27.md).

---

## Leer en este orden

| # | Documento | Para qué |
|---|---|---|
| 1 | [`00-PROTOCOLO-GENERAL.md`](00-PROTOCOLO-GENERAL.md) | reglas comunes: autoridad, estados, evidencia, git, DONE |
| 2 | [`Trans00-COORDINACION.md`](Trans00-COORDINACION.md) | gates, ledger, trasplante de `infra`, aprobación |
| 3 | [`Trans01-KERNEL.md`](Trans01-KERNEL.md) | kernel, autorización, leases, receipts, replay |
| 4 | [`Trans02-COGNITION-V2.md`](Trans02-COGNITION-V2.md) | atención, contexto, roles, ontología, lanes |
| 5 | [`Trans03-INTEGRACIONES.md`](Trans03-INTEGRACIONES.md) | Meta WhatsApp, Google, voz, caché |
| 6 | [`Trans04-OBSERVABILIDAD-Y-SECRETOS.md`](Trans04-OBSERVABILIDAD-Y-SECRETOS.md) | métricas, alertas, preflight de secretos |
| 7 | [`Trans05-COGNICION-LONGITUDINAL.md`](Trans05-COGNICION-LONGITUDINAL.md) | montar la memoria longitudinal (hoy `UNMOUNTED`) |
| 8 | [`Trans06-VERDAD-DE-NEGOCIO.md`](Trans06-VERDAD-DE-NEGOCIO.md) | hecho vs inferencia, diagnóstico, regresiones |
| 9 | [`Trans07-CONVERGENCIA-Y-CERTIFICACION.md`](Trans07-CONVERGENCIA-Y-CERTIFICACION.md) | merge de `main`, gate final, PR, rollback |

---

## Reglas que resumen todo

1. **Slow propone; el kernel valida y autoriza; el runtime ejecuta; Fast comunica.**
2. Documentado ≠ implementado ≠ probado ≠ montado ≠ verificado en vivo.
3. Un `SKIP` no es un `PASS`. Un test focal no es el gate. El gate no es certificación de producto.
4. El ledger está en **0/288 DONE** y solo cambia con evidencia de la pasada correspondiente.
5. Nada de `main`, despliegues, secretos ni coste externo sin autorización explícita del operador.
6. Si no se verificó, se escribe "no verificado". Nunca se inventan SHAs, rutas ni cifras.
