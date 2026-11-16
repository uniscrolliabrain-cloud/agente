# C05 — Ontología aprobada e integración inicial

Estado: **APPROVED_DESIGN / PARTIAL_IMPLEMENTED**. Ya no BLOCKED_DECISION. La instrucción del fundador y el digest del documento aprobado constan en [APPROVAL-20261116.md](APPROVAL-20261116.md).

## Código

Commit `fab6299`:

- `packages/domain/src/card-ontology.ts`: ocho familias, tres pares/seis intensidades independientes, diez dimensiones tipadas, unknown=null, contexto requerido para dimensiones contextuales y referencias tenant/revisión. Resumen determinista de evaluaciones, desacuerdo explícito y prohibición de que propuestas semánticas acrediten outcomes.
- `cognitive-reference.ts`: contrato canónico compartido, sin import circular.
- `cognition-v2.ts`: extensiones opcionales de Slow, clasificación y tarjetas; validación de anclas también dentro de metadata del clasificador.
- `engine/cognition/chromatic/card-ontology.ts`: catálogo 1.0.0, digest de definición, registro de la decisión real del fundador, verificación de aprobación y revocación. No endpoints para autoaprobación ni eliminación automática de revocaciones.
- `ontology-registry.ts`: comprobación de versión persistida ante inserción concurrente; normalización legacy conserva ausencia como null.
- `slow.ts`/`provider.ts`: extracción estructurada con ontología, contexto acotado para el puerto de evaluación, anclas verificadas y fallback con razón registrada ante errores/timeout/referencias ajenas. El digest contextual incluye identidad, prompt y fuentes preparadas.
- `projector.ts`: comprueba aprobación al aplicar tarjetas anotadas; replay conserva las evaluaciones persistidas, sin repetir inferencia.
- `runtime.ts`/`context.ts`: instala únicamente el catálogo aprobado y revalida su aprobación al servir. Fast recibe familia, perfil y estado propuesto/disputado, no el historial completo de evaluaciones ni razonamiento interno.

Los ocho nombres representan familias semánticas propuestas; no permisos. Una decision sigue siendo propuesta, y un resultado real requiere un adaptador de recibos de dominio. Los scores no promueven epistemicidad ni se convierten en autorización.

## Pruebas ejecutadas

- Primer foco C05+C09: 5/5 PASS.
- Foco C05 final: 3/3 PASS: cardinalidades, unknown, intensidades simultáneas, schemas inválidos, tenant/anclas, contexto, desacuerdo, resumen manipulado, prohibición de outcome semántico, revocación y flujo Slow→Thought/Card→proyector→contexto/replay.
- Foco HTTP+C05+Slow: 6/6 PASS, incluyendo fallback cuando un evaluador sintético devuelve referencias de otro tenant. No es prueba de un proveedor JEV real.
- Typecheck raíz ejecutado tras la integración: exit 0.
- Suite ampliada previa: 35 casos, 33 PASS/2 skip (Postgres sin variable en esa ejecución). Se está ejecutando una consolidada con Postgres y los patchsets posteriores; resultados finales en W3.

## Límites que permanecen

No hay proveedor JEV externo verificado, corpus gold revisado ni medición de mejora empresarial/ablaciones. El baseline se abstiene de inventar valores ausentes. Las dimensiones son valoraciones propuestas tipadas; todavía no sustituyen el ranking existente ni acreditan corroboración o deadlines. Procedimientos/outcomes de dominio, adaptaciones sectoriales, consolidación avanzada y migración masiva aún requieren trabajo. Una ontología aprobada no equivale a C05/C15 certificadas.
