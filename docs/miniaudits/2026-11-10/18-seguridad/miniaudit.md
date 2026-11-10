# Bloque 18 · Seguridad básica

> Campaña UX · 2026-11-10 · **14 hallazgos** (S0 0 · S1 5 · S2 5 · S3 4)
> Estado: informe recibido. Validación pendiente.

## Hallazgos

| # | Sev | Hallazgo | Estado |
|---|---|---|---|
| 1 | S1 | `/api/health-deep` es público y describe backend, kernel, capabilities y guardrails. | Sin verificar |
| 2 | S1 | `x-user-id` se acepta sin validar en presencia y lock (cruce con 12-05). | Sin verificar |
| 3 | S1 | CORS permite `Content-Type` y `Authorization`, pero el servidor lee `x-tenant-id` y `x-user-id`. | Sin verificar |
| 4 | S1 | RLS sólo se activa con `backend === "postgres"` y `MULTI_TENANT_SHARED === "true"`; si no, `withTenantRls` ejecuta sin contexto. | Sin verificar |
| 5 | S1 | El MIME se decide por extensión, sin sniffing ni antivirus. | Sin verificar |
| 6 | S2 | Límite de cuerpo de 12 MB global, sin límites por ruta. | Sin verificar |
| 7 | S2 | Subidas e ingesta RAG sin límite de frecuencia. | Sin verificar |
| 8 | S2 | Las URLs firmadas duran 15 min y no son de un solo uso ni revocables. | Sin verificar |
| 9 | S2 | `onError` registra sólo `error.name`; sin stack, causa ni requestId. | Sin verificar (cruce con 03-16) |
| 10 | S2 | El webhook de WhatsApp se monta antes de authz; la autenticidad depende del HMAC del proveedor. | Sin verificar |
| 11 | S3 | `no-store` global rompe la caché de estáticos. | Sin verificar |
| 12 | S3 | Sin HSTS, `X-Frame-Options` ni `Permissions-Policy`. | Sin verificar |
| 13 | S3 | La CSP sólo existe en `app.ts:1055`. | Sin verificar |
| 14 | S3 | `onError` discrimina por `name`, no por tipo. | Sin verificar |

## Arreglos propuestos

1. **`health-deep` autenticado** o reducido a `{ ok }`: hoy publica la topología interna.
2. **`x-user-id` fuera**: es un vector de suplantación en presencia y lock. Si hace falta identidad, sale del principal.
3. **CORS coherente**: permitir exactamente las cabeceras que el servidor lee (`x-tenant-id`, `x-user-id` si se queda) o dejar de leerlas.
4. **RLS por defecto**, no condicionada: si el backend no la soporta, que el modo lo declare y falle, en vez de ejecutar sin contexto en silencio.
5. **Límites por ruta** (subida, ingesta, JSON) y cabeceras de seguridad (HSTS, `X-Frame-Options`, `Permissions-Policy`) junto a la CSP.

## Plan

- **P1 (exposición)**: `health-deep`, `x-user-id`, CORS.
- **P2 (RLS)**: política explícita por backend y test que demuestre el contexto aplicado.
- **P3 (cabeceras y límites)**: HSTS/frame/permissions, límites por ruta, `onError` con stack y requestId.

---

## Revisión de destino

El handoff pide "no reutilizar el token owner de gestoría" y "declarar la limitación en cualquier demo con datos reales". Faltan:

- `health-deep` autenticado o reducido: hoy publica la topología interna.
- `x-user-id` fuera: es suplantación en presencia y lock.
- RLS explícita por backend (si no aplica, que falle, no que ejecute sin contexto).
- Cabeceras (HSTS, `X-Frame-Options`, `Permissions-Policy`) junto a la CSP.

## Conclusión

Nada de esto rompe una demo con datos sintéticos; todo ello importa el día que haya un cliente real. **P0** antes de datos de producción, **P1** el resto.
