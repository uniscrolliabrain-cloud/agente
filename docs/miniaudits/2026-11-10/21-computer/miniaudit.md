# Bloque 21 · Computer

> Campaña UX · 2026-11-10 · **13 hallazgos** (S0 0 · S1 3 · S2 7 · S3 3)
> Estado: informe recibido. Validación pendiente.

## Hallazgos

| # | Sev | Hallazgo | Estado |
|---|---|---|---|
| 1 | S1 | `runDocker` lanza el CLI desde el proceso del API: el daemon es el verdadero límite, no el contenedor. | Sin verificar |
| 2 | S1 | `stop` no borra contenedores ni volúmenes; no hay `rm`, `prune` ni limpieza al eliminar usuario. | Sin verificar |
| 3 | S1 | `COMPUTER_ENABLED=false` en producción, pero las 10 tools y las instrucciones del modelo la siguen anunciando. | Sin verificar |
| 4 | S2 | `computer-routes` no pasa por `canExecuteTool`, a diferencia de las tools. | Sin verificar |
| 5 | S2 | El límite de 30 s vive dentro del comando, no en el contrato ni en el schema. | Sin verificar |
| 6 | S2 | Un timeout para el contenedor entero, no sólo el comando, y bloquea el lease hasta confirmar. | Sin verificar |
| 7 | S2 | El rate limit se consume antes de comprobar `enabled()`: los intentos fallidos gastan cuota. | Sin verificar |
| 8 | S2 | `stop` sobre algo nunca arrancado crea lease y estado. | Sin verificar |
| 9 | S2 | El volumen se valida por etiquetas, no por contenido ni propietario real. | Sin verificar |
| 10 | S2 | `--pull never` con imagen ausente devuelve un error genérico que no distingue causa. | Sin verificar |
| 11 | S3 | `GET /health` ejecuta `docker version` en cada petición. | Sin verificar |
| 12 | S3 | La exportación de PDF cae a tenant `"default"` si no hay `tenantService`. | Sin verificar |
| 13 | S3 | No se emite evento de auditoría por comando ejecutado. | Sin verificar |

## Arreglos propuestos

1. **Anuncio coherente con el estado**: si `COMPUTER_ENABLED=false`, ni tools ni prompt la ofrecen. Hoy el modelo promete algo que el servidor rechaza.
2. **Mismo control de acceso que las tools**: `computer-routes` pasa por `canExecuteTool`; hoy es una puerta lateral.
3. **Ciclo de vida completo**: `rm`/`prune` en `stop` y al borrar usuario; el estado no se crea al parar algo que no existe.
4. **Auditoría por comando** (quién, tenant, argv, resultado) y límite de tiempo en el contrato, no dentro del comando.
5. **`/health` sin `docker version`** por petición: cachear o sondear por intervalo.

## Plan

- **P1 (acceso)**: `canExecuteTool`, anuncio condicionado a `enabled()`.
- **P2 (recursos)**: limpieza real, timeout por comando, cuota sólo si arranca.
- **P3 (traza)**: evento de auditoría por comando y health sin sondeo por request.

---

## Revisión de destino

Computer está desactivado en producción, así que su prioridad es de fase posterior; pero el anuncio incoherente sí afecta al producto:

- Si `COMPUTER_ENABLED=false`, ni tools ni prompt deben ofrecerla.
- `computer-routes` con el mismo `canExecuteTool` que las tools.
- Limpieza real de contenedores y volúmenes al cerrar o borrar usuario.

## Conclusión

**P2** mientras siga apagado; **P1** el día que se active, porque entonces el socket de Docker en el API pasa a ser superficie de ataque real.
