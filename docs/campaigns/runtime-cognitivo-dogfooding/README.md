# Runtime cognitivo y dogfooding multiempresa

> v1 · 2026-11-16 · Estado: **draft / ejecución local parcial; ningún gate externo completado**

Campaña de código incremental para alinear las capacidades nativas de `/agente` y los repositorios child con un runtime gobernado por identidad, policy, kernel, grafo y bus; y después probarlo con tres empresas propias, cada una con owner e identidad distintos.

**No es autorización de instalación, integración de todos los children, piloto externo, producción, merge ni despliegue.** La primera instalación prevista es `agntia-ciberseguridad`; la segunda, `agntia-gestoria`. La instalación será artesanal. Esta campaña registra puntos de control y evidencia; no crea un instalador universal de plugins.

## Documentos

- [Baseline y decisiones](BASELINE.md): hechos, código existente, incertidumbres y decisiones de autoridad.
- [Plan de campañas, olas y patchsets](PLAN.md): fases, dependencias, allowlists indicativas, hunks funcionales, fixes y gates.
- [Ledger de evidencia](EVIDENCE.md): plantilla para registrar ejecución real sin convertir diseño o fixtures en PASS.
- [Bitácora de ejecuciones](BITACORA.md): diario cronológico con fecha UTC, commit/SHA, campaña, comandos, resultados y notas sintetizadas.
- [Matriz de trazabilidad de 200 conceptos](MATRIZ-200.md): para cada concepto, estado según baseline, patchset, evidencia pendiente y límites.

## Método de ejecución

- Una fase se abre solo desde el SHA integrado y aceptado de su predecesora; una ola puede tener más de un patchset, pero cada patchset tiene una allowlist pequeña y un gate propio.
- Cada hunk se describe como comportamiento observable y cambio mínimo; el implementador comprueba el código vigente antes de tocarlo. Las rutas del plan son anclajes de inspección, no permiso para editar todos esos archivos en un patchset.
- Tests existentes son evidencia histórica hasta que se corren sobre el SHA candidato. No se altera una aserción para cerrar un gate.
- El LLM puede percibir, resumir y redactar. No resuelve identidad/tenant, autoriza capacidades, concede grants, aprueba efectos externos ni confirma recibos.
- Eventos, Thoughts, proyecciones del grafo y datos de dominio son capas distintas: emitir uno no concede autoridad al otro.
- “Agnóstico” significa gobernado por invariantes explícitas y capacidades nombradas; no exige que el kernel absorba la semántica fiscal, legal o de ciberseguridad de cada child.

## Vista de olas

| Ola | Campañas | Resultado de salida | Estado inicial |
|---|---|---|---|
| 0 | C00 baseline/reconciliación | SHA, callgraph y backlog deduplicado contra implementación existente | IN_PROGRESS |
| 1 | C01 instalar artesanalmente `agntia-ciberseguridad` | Un flujo child de solo lectura, gobernado por padre, evidencia minimizada y proyección cognitiva | Bridge/relay/contexto locales 6/6; servicio child sin endpoint/credencial, no conectado |
| 2 | C02 operación interna: Drive, inbox/email, resumen, borrador, aprobación y recibo | Un recorrido nativo trazable desde identidad a bus/Thought y recuperación | Ejecución local parcial (Drive route / Gmail fixtures) |
| 3 | C03 coherencia runtime: capabilities, policies y eventos→Thought/grafo | Mismos invariantes aplicados a tools nativas y child; sin motor paralelo | Ejecución local parcial (email→Thought; EventBus tenant scope/dedupe; thought-index query; tipos/cardinalidad de relación y validación de schema en create/update) |
| 4 | C04 tres empresas con owners/identidades distintos | Dogfood A/B/C; pruebas de aislamiento cruzado sobre Stores y operaciones | Provision y aislamiento HTTP local parcial (tareas/archivos/eventos/índices Thought/turn y RAG local; suspensión corta HTTP, el arranque del worker y ahora también la tarea en vuelo); IdP y matriz PS13 pendientes |
| 5 | C05 dos empleados-actores y tres agentes por empresa | Autorización por actor/capability y delegación con revocación | IN_PROGRESS local: 9 identidades, roles de empresa, memoria privada, 3 agentes/empresa con disable/no-SOP, matriz aplicada a la aprobación HTTP, revalidación del agente en el worker, rechazo al encolar para un rol inactivo, propuestas compartidas por empresa (bandeja + aprobación cross-actor), corte mid-flight al suspender o deshabilitar y revocación que cierra aprobación y bandeja; sin IdP, records de negocio compartidos ni agentes compartidos por empresa |
| 6 | C06 segundo child `agntia-gestoria` | Contraste de dominio y confirmación de primitivas comunes vs específicas | Draft |
| 7 | C07 cierre por evidencia / siguientes children | Revisión de backlog y decisión humana para repetir patrón | Draft |

La secuencia es por evidencia, no por calendario. C01 integra primero el child de ciberseguridad de forma artesanal y read-only; C02 recorre las capacidades nativas. Si cualquiera descubre un fallo de autorización, persistencia o recuperación, se cierra antes de ampliar capacidades o instalar el siguiente child. Los cambios generales del kernel deben limitarse a fallos reproducidos; la generalización se decide después del dogfooding C04–C06.

## Alcance explícito y límites

Incluye: Google Drive (buscar, leer, indexación explícita, revocación/citas), Gmail (buscar, leer hilo, resumir con fuentes, preparar borrador, aprobación humana, envío y recibo), capacidades y policy, event bus, Thoughts/ciclo, referencias de grafo, runtime del child de ciberseguridad, provisión de tres owners distintos, empleados y agentes, y segundo child de gestoría.

No incluye por inferencia: integrar los 14 repositorios en esta campaña, generar ontologías completas de todos los sectores, habilitar JEV, permitir remediación de ciberseguridad autónoma, enviar correo sin aprobación, ejecutar efectos contables/fiscales, certificar seguridad empresarial, desplegar a producción o cerrar aceptaciones externas.

## Identificación de los 14 repositorios child

Encontrados en la cuenta GitHub conectada; la lista no constituye revisión de su código ni orden de instalación:

1. `agntia-branding`
2. `agntia-ciberseguridad` (primer child previsto)
3. `agntia-clientes`
4. `agntia-comunicacion`
5. `agntia-dise-o`
6. `agntia-finanzas`
7. `agntia-formacion`
8. `agntia-gestoria` (segundo child previsto)
9. `agntia-legal`
10. `agntia-marketing`
11. `agntia-redes`
12. `agntia-seguros`
13. `agntia-ventas`
14. `agntia-video`

La ficha por child queda vacía hasta auditarlo específicamente; no inferir stack, contratos o readiness del nombre.
