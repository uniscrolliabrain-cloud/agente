# Bloque 22 · Browser worker

> Campaña UX · 2026-11-10 · **12 hallazgos** (S0 0 · S1 3 · S2 6 · S3 3)
> Estado: informe recibido. Validación pendiente.

## Hallazgos

| # | Sev | Hallazgo | Estado |
|---|---|---|---|
| 1 | S1 | Las URLs firmadas de preview duran 15 min y la consola refresca cada 2 s: muere sola. | Sin verificar |
| 2 | S1 | Toda descarga se importa con tenant `"default"` hardcodeado. | Sin verificar |
| 3 | S1 | `observeForThread` persiste la asociación antes de llamar al worker: con `PROFILE_LIMIT` el hilo queda atado a una sesión irrecuperable. | Sin verificar |
| 4 | S2 | El worker autentica con un token compartido, sin identidad de owner: la separación vive sólo en el API. | Sin verificar |
| 5 | S2 | `read`, `preview`, `downloads` y `close` no consumen cuota. | Sin verificar |
| 6 | S2 | Un screenshot cada 2 s por pestaña abierta, sin pausa si está oculta. | Sin verificar |
| 7 | S2 | `validatePublicUrl` y el proxy resuelven el DNS en momentos distintos: ventana de rebinding. | Sin verificar |
| 8 | S2 | Los perfiles de Chromium (cookies incluidas) se guardan sin cifrar en el volumen. | Sin verificar |
| 9 | S2 | El cierre por inactividad no libera el perfil ni el registro: el tope de 20 es terminal. | Sin verificar |
| 10 | S3 | `serial("create")` global serializa las creaciones de todos los tenants. | Sin verificar |
| 11 | S3 | Cualquier error del worker llega como 502: `SESSION_LIMIT`, `PROFILE_LIMIT` y `BLOCKED_URL` se confunden. | Sin verificar |
| 12 | S3 | Las carpetas de perfil corruptas se ignoran sin borrarse y no cuentan para el límite. | Sin verificar |

## Arreglos propuestos

1. **Tenant real en descargas**: `"default"` hardcodeado es una fuga de datos entre empresas; debe salir del contexto.
2. **Firma de preview acorde a la vida de la sesión** (o renovación automática): 15 min con refresco de 2 s es una sesión que caduca antes del primer minuto de uso.
3. **Asociar hilo ↔ sesión después de crear la sesión**, no antes: si `PROFILE_LIMIT` la rechaza, el hilo queda roto sin vuelta.
4. **Cerrar libera el perfil**: hoy el tope de 20 es terminal porque el contador no baja.
5. **Identidad en el worker**, no sólo en el API: token compartido = cualquier llamada es de todos.

## Plan

- **P1 (aislamiento)**: tenant de descargas, identidad del worker, firma renovable.
- **P2 (ciclo de vida)**: liberar perfiles al cerrar, borrar corruptos, errores tipados (409/429/403 en vez de 502).
- **P3 (coste)**: cadencia de screenshots con pausa, `serial("create")` por tenant.

---

## Revisión de destino

El navegador es un diferenciador del vertical (leads, clínicas, perfiles), pero hoy tiene dos defectos que tocan el producto directamente:

- Descargas con tenant `"default"` hardcodeado: fuga entre empresas.
- Perfiles de Chromium sin cifrar en el volumen (cookies de clientes).
- Firmas de preview de 15 min con refresco de 2 s: sesión que muere sola.

## Conclusión

**P2** mientras no se venda; **P0** el tenant y el cifrado de perfiles en cuanto haya un cliente usando el navegador.
