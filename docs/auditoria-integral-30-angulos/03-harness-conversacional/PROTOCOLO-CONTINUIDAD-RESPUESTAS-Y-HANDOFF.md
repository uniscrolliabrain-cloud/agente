# Protocolo de continuidad: cada respuesta, decisión y ejecución queda documentada
**Fecha de establecimiento:** 2026-11-15
**Proyecto:** AgntiaPro / ChatLLM / Cognition / Ciberseguridad
**Rama de trabajo:** `audit/preflight-cognition-option3-20261115`
**Estado:** instrucción de documentación para el agente ejecutor; no modifica el runtime.

## Mandato del fundador
> Documenta cada respuesta que me des para que el agente que ejecute el código no se líe y tenga contexto.

A partir de esta decisión, toda respuesta técnica sustancial relacionada con el diseño, la auditoría, la planificación o la implementación de la opción 3 deberá producir una entrada persistente en el repositorio, **en la misma sesión de trabajo cuando exista acceso de escritura**. No basta con dejar la decisión en el chat. Si no hay acceso a GitHub, entregar un bloque de documentación listo para aplicar e identificar claramente que **no está guardado**.

## Documentos de autoridad y orden de lectura
1. `docs/auditoria-integral-30-angulos/03-harness-conversacional/ultragranular-opcion-3/00-INDICE-DECISIONES-ESTADO-Y-TRAZABILIDAD.md` (si está presente en la rama base).
2. `docs/auditoria-integral-30-angulos/03-harness-conversacional/ultragranular-opcion-3/01-INVENTARIO-REAL-ARCHIVOS-FLUX-Y-BRECHAS.md` y siguientes, **si existen en la rama**.
3. `docs/auditoria-integral-30-angulos/03-harness-conversacional/PREFLIGHT-C00-COMPATIBILIDAD-NO-DESTRUCCION.md` (hallazgos directos de código).
4. Este protocolo y el registro cronológico `BITACORA-DECISIONES-Y-RESPUESTAS.md`.
5. Código real y tests del SHA de la rama que se implemente. **El código y contratos ejecutados prevalecen sobre supuestos documentales**, salvo que una decisión explícita requiera migrarlos.
6. Reportes de ejecución por campaña con comandos y resultados.

**Advertencia de ramas:** la documentación extensa de opción 3 se creó previamente en `docs/audit-30-dominios-runtime-20261115`, mientras que esta rama nace de `main`. **No asumir que esos archivos están aquí.** Antes de implementar, comparar ramas y seleccionar cherry-pick o traslado documental, sin mezclar código de ramas no auditadas.

## Estructura de cada respuesta documentada
- **ID correlativo** `R-YYYYMMDD-NNN`, fecha UTC y petición exacta o paráfrasis fiel.
- **Resultado comunicado al fundador** y límites de lo que realmente se hizo.
- **Decisiones confirmadas** (autor, alcance, motivación y alternativas descartadas).
- **Hallazgos verificables**: repo, rama, SHA, paths, funciones y evidencias; distinguir código observado, docs, hipótesis y conversación.
- **Impacto transversal**: kernel, graph, cognition, cards, memory, cromos, attention, meta, Event Bus, Fast/Slow, Presenter, Anam, UX, Cyber, multi-tenant, seguridad.
- **Riesgos destructivos y regresiones** (P0/P1/P2), invariantes que no se deben alterar.
- **Patchsets propuestos**: archivos a crear/modificar, dependencias, flags, migraciones y rollback. No confundir propuesta con ejecución.
- **Pruebas**: existentes, ejecutadas con exit code, pendientes y criterios de aceptación.
- **Estado**: IDEA / DOCUMENTADO / AUDITADO PARCIAL / IMPLEMENTADO / TESTEADO / MERGED / DEPLOYED. No saltar etapas.
- **Siguiente paso y bloqueo**: trabajo exacto que puede continuar otro agente sin preguntar ni improvisar.

## Reglas de consistencia
- Nunca presentar inferencias como decisiones previas del fundador ni inventar citas o presupuestos de tokens.
- JEV AI clasifica y propone; no es autoridad final. Kernel/policy controlan efectos.
- Slow crea tarjetas enriquecidas; runtime las sirve; Fast consume proyecciones autorizadas; evitar una nueva cadena sincrónica Slow→Fast por turno.
- Mantener V1 durante la migración, respetar Zod estricto, CAS/release-on-error, dedupe, event persisted:false y scopes tenant/owner.
- Separar fase pedagógica SVG de estado operativo confirmado por receipts.
- No afirmar que tests pasaron sin haberlos ejecutado; no afirmar auditoría completa sin leer código y contratos relevantes.
- Ninguna respuesta autoriza merge, deploy, borrado de datos ni reemplazo de código sin evidencia y aprobación.
- Registrar cambios de criterio como ADR con supersedes; **no sobrescribir silenciosamente** decisiones antiguas.
- No duplicar el mismo texto en múltiples documentos: bitácora breve con enlaces a análisis exhaustivos, conservando contexto suficiente para reconstruir decisiones.

## Entrada inicial de esta instrucción
**ID:** R-20261115-001
**Petición:** documentar cada respuesta para preservar contexto de ejecución.
**Decisión:** bitácora persistente + protocolo de handoff y evidencia.
**Estado:** DOCUMENTADO, sin cambios en código.
**Hallazgo:** la rama de preflight nace de main; el conjunto ultradetallado anterior vive en otra rama y necesita reconciliación.
**Siguiente paso:** actualizar bitácora al terminar cada intervención técnica y completar C00 leyendo código real y contratos Cyber antes de implementar.
