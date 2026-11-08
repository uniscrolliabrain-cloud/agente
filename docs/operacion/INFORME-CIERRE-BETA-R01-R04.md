# Cierre de integración · Beta R01–R04

8 de noviembre de 2026 · Base de campaña: `0c8fe81`.

En `main` quedaron incorporados los nueve historiales de trabajo mediante `4f80f0f` y el commit remoto de briefings `c08a927` mediante `0daa961`. Este cierre incorpora además cinco documentos locales de A02, A05, A07 y A08 que estaban fuera de los commits. Los briefings de `sprints/r01/` pertenecen al inventario previo y sus identificadores no acreditan ejecución en esta beta.

| Agente y evidencia | Rama integrada · SHA | Trabajo entregado | Pendiente principal |
| --- | --- | --- | --- |
| [A01](agents/A01.md) | `sprint/r01-a01-medir-base` · `a4a7f83` | Medición del gate, bootstrap idempotente de Laia y esquema estricto de tarjetas. | Acreditar entityId del lado servidor y probar su propagación junto con el filtro de A02. |
| [A02](agents/A02.md) | `sprint/r01-a02-descubrimiento-tests` · `9ab5151` | Descubrimiento recursivo, filtro de eventos por entidad, entrada HTTP de Laia por automatización y tipo PublishedCard con huella. | Probar el recorrido de entidad completo y conectar PublishedCard al endpoint autorizado de publicación. |
| [A03](agents/A03.md) | `sprint/r01-a03-entorno-tests` · `f6ec37e` | Entorno de tests aislado, restauración de identidad del worker, resolución de entidad y selección de tarjetas con rechazo de empate. | Probar reapertura y leases con el contrato durable y conectar la selección a la ruta real. |
| [A04](agents/A04.md) | `sprint/r01-a04-ci-bloqueante` · `26885da` | CI bloqueante, claves por tenant, hechos operativos y renderer fixed. | Confirmar CI remoto, aislamiento HTTP con A06 y renderizado a través del canal real. |
| [A05](../../AUDIT-AGENTE-05.md) | Sin rama de beta localizada | Inventario y checklist inicial. | Verificar typecheck del worker dentro del gate y asignar actor/contexto de AgentTask, validación de evidenceRefs y modo guided. |
| [A06](agents/A06.md) | `sprint/r01-a06-audit-contracts` · `a15a0cf` | Auditoría de contratos, cableado del Store, regla de ausencia de evidencia y ocho semillas en borrador. | Resolver falsos positivos del inventario, acreditar aislamiento, garantizar ausencia sin cifras y validar semillas contra el esquema integrado. |
| [A07](agents/A07.md) | `sprint/r01-a07-audit-idempotency` · `a95a50d` | Índice de marcas, pruebas de concurrencia y de trazas HTTP entre tenants. | Reejecutar sobre main y asignar endpoint y almacenamiento para publicación inmutable. |
| [A08](agents/A08.md) | `sprint/r01-a08-fuente-despliegue` · `ad89a36` | Guía de despliegue consolidada y prueba HTTP de autorización por intención y canal. | Acreditar credenciales por tenant y conectar el panel al contrato de causa, siguiente paso y responsable. |
| [A09](agents/A09.md) | `sprint/r01-a09-secrets-check` · `2c32d19` | Cobertura de variables, prueba con token ficticio y especificación de pruebas del vertical y de la traza. | Completar los cinco casos de Laia y emitir la traza de decisión de tarjetas desde los productores reales. |
| [A10](agents/A10.md) | `sprint/r01-a10-clasificador-rojos` · `d4a9a42` | Clasificador de fallos y documentación de contexto, evidencia de Laia y ciclo de tarjetas. | Comparar la suite integrada con el gate base y actualizar el informe con los fallos reproducidos. |

## Qué falta antes de acreditar la beta

1. Ejecutar el gate sobre el SHA publicado y comparar contra la base de A01, que dejó rojos los tests y la auditoría de contratos. La revisión de whitespace del merge pasó. Los resultados locales de cada rama están en las fichas. El gate integrado arrancó tras instalar las dependencias. Al preparar la publicación seguía en ejecución y su resultado quedaba pendiente.
2. Cerrar tenancy con pruebas de dos entidades del mismo owner, dos empresas sobre el mismo Store, reinicio del worker y ausencia de tokens en el contexto.
3. Completar Laia con referencias validadas, respuesta determinista ante falta de evidencia, trazas aisladas y las cinco preguntas del vertical.
4. Completar tarjetas con validación de las ocho semillas, modo guided, publicación autorizada y atómica, versionado inmutable y traza visible en el panel. Las semillas se entregan en borrador.
5. Realizar el catch-up sobre el mismo SHA y asignar propietarios a los puntos de integración que cruzan carriles.
