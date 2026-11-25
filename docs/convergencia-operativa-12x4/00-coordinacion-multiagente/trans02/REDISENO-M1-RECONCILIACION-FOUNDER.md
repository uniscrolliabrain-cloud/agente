# Macroturno de rediseño 1 — reconciliación de autoridad y código vivo

Estado: revisión estática parcial, no implementación, no GO ni nueva nota. Rama exclusiva Trans02 (mayúscula inicial); carpeta trans02. Canónica y main solo lectura. Este documento complementa T3/T4; no sustituye decisiones canónicas sin aprobación.

## Evidencia y discrepancias

| ID | Ancla inspeccionada (blob) | Hallazgo | Resolución candidata |
|---|---|---|---|
| R01 | Canónica WIRING faa6834b; CONTRATO c791643d; runtime.ts Trans02 776d1567 | WIRING permite propuesta Fast; runtime ya vacía tools/state/context/forwardedProps y prohíbe ejecución. | Registrar interacción autenticada, no propuesta Fast. Slow único proponente LLM operativo. Aprobación founder para reconciliar WIRING. |
| R02 | agent.ts 503e0c7e | Factory nunca instancia V2, aunque ownerFor usa scope V2. | P01 T4 conserva AGUI explícito y legacy fuera de opt-in; verificar middleware, thread ACL y ABI antes de aplicar. No fallback silencioso V2→legacy. |
| R03 | attention.ts 45312a2f; context.ts 84d17ebc | Trans02 ya comparte contextScorer; main observado anteriormente aún tenía ranking separado. | No duplicar scorer; reconciliar delta por blob al integrar. Prueba igualdad de orden y refs con mismo universo, presupuesto y revisión. |
| R04 | context.ts 84d17ebc | readSnapshot valida identidad/expiry y refs, no reconstruye segmentos ni digest; reserve permite invalidated por status<>acknowledged. | P02/P05: reconstrucción canónica autorizada y digest, estado allowlist explícito, fence; invalidated terminal. |
| R05 | slow-observation.ts 09c39a22 | Bridge exige card/memory autorizada y verifier default false; excluye runtimeOutcome y derivados. | Conservar default deny. No relajar filtro global; puerto separado de evidencia operativa verificada y de intención humana, con política de causalidad. |
| R06 | runtime-outcome.ts 6bedfe59 | Verifica solo terminal Slow mediante evento persistido, job y scope. | Mantener verifier existente; nuevos verificadores por familia de receipt Trans01, sin convertir texto en hecho. |
| R07 | runtime.ts 776d1567 | Chat persiste run y receipt servidor, pero no se observa emisión de intención al bus en este método. | Identificar productor existente antes de añadir; si no existe, proponer outbox durable de intención autenticada, no parsear respuesta Fast como comando. |
| R08 | runtime.ts 776d1567 | Política private self-read y shared RLS fail-closed. | Mantener; distribución no implica ACL global. Persona nunca altera actor. |
| R09 | HANDOFF 565653f8; TURNOS a0ea580a | Referencia rama minúscula y fases de dominios/gestoría/recompilación. | Corregir referencia de rama en futura consolidación; no ejecutar ampliaciones de dominio sin decisión canónica. |

## Contrato candidato de frontera (no schema aprobado)

Intención humana: envelope de evento autenticado con tenant, actor, thread/run, referencia a mensaje persistido, revisión, correlation/causation y propósito. No aceptar actor ni permisos de forwardedProps. El texto es dato no confiable. El evento no autoriza una acción ni contiene una propuesta de Fast.

Slow observa mediante consumidor durable independiente. Entrada autorizada y minimizada, plantilla versionada, referencias verificadas. Salidas separadas: interpretación/card propuesta y propuesta operativa tipada. La segunda se entrega a un puerto del kernel, nunca directamente a CapabilityRunner. El kernel revalida identidad, permisos, capacidad, revisión y aprobación. No usar clasificación JEV como permiso.

Receipts: Trans01 conserva autoridad sobre persistencia y verificación de resultado. Trans02 consume evidencia por referencia exacta y proyecta; no genera un receipt empresarial. Una card de hipótesis no puede convertirse en verified_fact por confianza o clasificación.

Fast: solo contexto preparado autorizado; ninguna espera a Slow/JEV ni herramientas de acción. La narración de un rol no demuestra ejecución. El ACK servidor no prueba recepción de navegador ni reproducción audiovisual.

## Dependencias y decisiones

- D01 founder: reconciliar frase Fast proponente en WIRING; no editar canónica.
- D02 Trans01: evento de intención, outbox/receipt, esquema de propuesta operativa y único punto de admisión; identificar productores/consumidores y dedupe antes de diseñar SQL.
- D03 Trans03: puertos Slow/JEV/media y egress; ningún canal audiovisual alternativo de ejecución.
- D04 Trans04: métricas sin contenido sensible, correlación y pruebas PG/aislamiento.
- D05 founder: limitar fases empresariales a fixtures de certificación del core; decidir alcance de Google/WhatsApp/gestoría/owner real y recompilación. No asumir cancelación de fases.

## Secuencia de continuación del rediseño

1. Completar inventario de los 48 bloques, P01–P14 y contratos Trans01 por SHA. Registrar consumidores y productores reales; no usar nombres hipotéticos como paths.
2. Reconciliar R01–R09 con T3/T4 y delta main; distinguir implementado, parcial, ausente y bloqueado.
3. Diseñar wiring de intención y receipts con Trans01; conservar bridge y verifier existentes, sin bypass. Pruebas rojas: Fast no puede proponer, replay de intención no duplica job, receipt falso no proyecta hecho, caída Slow no bloquea Fast, revocación invalida contexto, evento derivado no genera bucle.
4. Completar diffs, migraciones aditivas, tests y rollback por patchset; no modificar código durante rediseño.
5. Reauditar documentación contra blobs actuales; no asignar 9.2 hasta cerrar inconsistencias y distinguir pruebas propuestas de ejecutadas.

## Estado de verificación

Inspección estática de archivos enumerados; no lectura exhaustiva de los 48 bloques en este macroturno parcial, no ejecución de tests, no cambio funcional. Los hallazgos de main anteriores requieren revalidación antes de integrar. No se certifica la arquitectura ni se cambia la nota histórica 8.7. Continuar por el inventario pendiente, sin iniciar implementación.
