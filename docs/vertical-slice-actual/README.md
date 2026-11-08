# Vertical slice actual · Dogfooding A/B

**Código auditado:** [`5292455`](https://github.com/uniscrolliabrain-cloud/agente/commit/52924553ea36a476c7b7724724b568b0d938cd72), checkout limpio de `main`. Los anclajes de cada campaña se tomaron del código. El plan describe cambios futuros y pruebas por ejecutar.

**Resultado:** dos empresas en el mismo despliegue. Tres humanos por empresa, incluido un owner con correo distinto, y una instancia de Laia y Marcos por empresa. Dos conexiones operativas de Google. A/B pueden recorrer el circuito de conocimiento, Gmail, Calendar, Places y seguimiento sin compartir datos entre empresas.

## Ramas y gates

1. El operador registra `base_sha`, `campaign_id` y el gate de la campaña anterior. Abre `freebuff/vsa-NN-slug` desde ese SHA. Freebuff Cloud implementa P1–P3 en orden y entrega `impl_sha`.
2. Codex Cloud abre `codex/vsa-NN-slug-test` desde `impl_sha`, valida base y diff, añade pruebas y registra `test_sha`, comandos, exits y resultados. Freebuff y Codex nunca escriben en la rama del otro.
3. Un fallo de producto se reproduce con fixture y salida redactada. Freebuff corrige en su rama. Codex actualiza su rama de pruebas con el nuevo SHA de implementación y vuelve a ejecutar el gate focal y regresiones pertinentes. La evidencia anterior queda como histórica.
4. El operador integra producto y pruebas tras verificar el SHA candidato. El SHA integrado se vuelve a comprobar si difiere del probado. La campaña siguiente parte de ese SHA y registra las dependencias cerradas. Las ramas se abren a medida que se llega a cada campaña.
5. El gate final usa dos empresas de staging con Postgres y Google real en operaciones aprobadas. Probar también credenciales revocadas, leases, conexiones reutilizadas y resultados ambiguos. En los informes se guardan IDs y resultados, nunca contenido privado o secretos.

**Evidencia por entrega:** base, impl, test e integrado; lista de archivos; fixtures; comando y exit; fallo heredado frente a regresión; migración y rollback; referencias del proveedor si hubo operación real. Tests focalizados en cada campaña, suite y build según riesgo y gate completo en 20.

## Secuencia

| Nº | Campaña | Gate |
|---|---|---|
| 01 | [Baseline ejecutable y superficie autorizada](01-baseline/CAMPAIGN.md) | Un checkout limpio arranca o deja un fallo reproducible con ruta exacta; CI devuelve el exit real. |
| 02 | [Principal canónico y selección de empresa](02-principal/CAMPAIGN.md) | Dos pestañas A/B funcionan; tenant ajeno, scope alterado y DB caída fallan sin caer a default. |
| 03 | [Permisos por actor, revocación y suspensión](03-permisos/CAMPAIGN.md) | Revocación en caliente corta acceso y una cuenta de empresa no administra otras empresas. |
| 04 | [Propiedad de registros y migración](04-datos/CAMPAIGN.md) | Dos miembros comparten hechos de A; privado queda privado y B con IDs iguales queda aislada. |
| 05 | [Postgres, SQL de negocio, SSE y enlaces](05-perimetro/CAMPAIGN.md) | A no lee filas, streams ni enlaces de B; SQL arbitrario bloqueado aunque lo pida una tool. |
| 06 | [Identidad durable y efectos diferidos](06-worker/CAMPAIGN.md) | Reinicio y dos workers preservan identidad; jamás hay recibo de éxito por callback vacío. |
| 07 | [Bundle versionado y plan de instalación](07-bundle/CAMPAIGN.md) | Plan estable y sin escrituras; nombre duplicado no reasigna empresa y referencias inválidas se rechazan. |
| 08 | [Instalador reanudable y alta A/B](08-provision/CAMPAIGN.md) | A/B compiladas con seis actores; fallo intermedio, doble apply y reanudación no duplican ni pisan datos. |
| 09 | [Laia y Marcos operativos por empresa](09-personas/CAMPAIGN.md) | Imagen final resuelve cuatro instancias; Marcos deshabilitado no puede iniciar trabajo. |
| 10 | [Hechos compartidos y recall acreditado](10-memoria/CAMPAIGN.md) | Dos humanos de A recuperan el hecho sembrado; ni B ni otra persona ven el recuerdo privado. |
| 11 | [Conexión operativa Google y ciclo de credenciales](11-oauth/CAMPAIGN.md) | Dos conexiones distintas; revocación durante callback y rotación invalidan operaciones antiguas. |
| 12 | [Fuentes de Drive y ciclo de indexación](12-drive/CAMPAIGN.md) | Documento corto en A se recupera tras reinicio; actualización y revocación cambian el resultado. |
| 13 | [Automatización, vínculo de hilo y hechos de ejecución](13-hilo/CAMPAIGN.md) | Un hilo ajeno se rechaza; una consulta cita la ejecución correcta y excluye otra del mismo tenant. |
| 14 | [Aprobación exacta y evidencia del proveedor](14-aprobacion/CAMPAIGN.md) | Una llamada en doble aprobación; timeout ambiguo no habilita reenvío automático. |
| 15 | [Gmail real desde el chat](15-gmail/CAMPAIGN.md) | Un correo por empresa conserva hilo y cuenta correctos; fixtures primero y luego smoke controlado. |
| 16 | [Disponibilidad, reserva y recibo Calendar](16-calendar/CAMPAIGN.md) | A/B confirman evento real en su calendario; prueba de DST, conflicto y timeout sin duplicado. |
| 17 | [Places, selección y ficha comercial compartida](17-places/CAMPAIGN.md) | Dos comerciales de A aceptan una ficha; B puede aceptar otra propia; buscar no modifica el pipeline. |
| 18 | [Delegación tipada y cualificación de Marcos](18-marcos/CAMPAIGN.md) | Rol deshabilitado se rechaza; resultado conserva solicitante y agente y no inventa un contacto ausente. |
| 19 | [Seguimiento elegible y cancelación durable](19-seguimiento/CAMPAIGN.md) | Respuesta durante aprobación y baja durante espera impiden envío; una respuesta de prueba termina en cita. |
| 20 | [Panel, tarjetas y gate completo A/B](20-operacion/CAMPAIGN.md) | Seis humanos y cuatro agentes completan el recorrido con dos cuentas; explicación del día siguiente cita registros reales. |

## Contratos que cruzan campañas

| Contrato | Nace | Se consume en |
|---|---|---|
| Principal tenant/actor y permisos | 02–03 | Store, SSE, worker, agentes, OAuth y aprobaciones |
| Propiedad y migración de datos | 04–05 | Provisión, memoria, fichas, Google y panel |
| Identidad durable y correlación | 06 | Provisión de roles, ejecución, Marcos y seguimiento |
| Bundle e instancias de agente | 07–09 | Hechos, hilo, capacidades y panel |
| Conocimiento y evidencia | 10, 12–13 | Contexto de Laia, tarjetas y consulta posterior |
| Conexión y aprobación | 11, 14 | Gmail, Calendar y seguimiento |
| Ficha y trabajo comercial | 17–19 | Panel, métricas y cierre A/B |

**Cortes demostrables.** 09 acredita instalación de ambas empresas. 13 acredita una consulta de Laia con hechos propios. 16 acredita correo y cita por empresa. 19 acredita un seguimiento supervisado de Marcos. 20 acredita el flujo completo y su recuperación.
