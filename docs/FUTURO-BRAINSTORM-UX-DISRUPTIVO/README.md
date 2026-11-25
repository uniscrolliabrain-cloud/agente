# FUTURO — Brainstorm UX disruptivo

> **Estado: IDEAS NO APROBADAS.** Esta carpeta no autoriza desarrollo, despliegues, compras ni decisiones de roadmap. Las inspiraciones son referencias de diseño a investigar, no certificaciones de éxito comercial ni de compatibilidad técnica.

Se reúnen **44 capacidades** (incluyendo las ideas complementarias surgidas de la conversación), cada una en su propio archivo. Las fichas son hipótesis técnicas y deben contrastarse con ramas y código vigentes antes de elegir.

## Invariantes de AgntiaPro
- Fast/LAIA: conversación mínima, tarjetas de pocos tokens. Runtime, kernel, grafo, cinco memorias, Slow y JEV conservan estado, conocimiento y autoridad.
- Templates React programados, ViewSpec/ViewEnvelope y UI Commands tipados. Nada de React arbitrario generado por LLM.
- Branding AgntiaPro por defecto, override del tenant por tokens; personalización programada, no aleatoria.
- Deny-by-default, actor/tenant, approvals, idempotencia, audit receipts, revision y fail-closed.
- Respetar UX móvil, bottom sheet, teclado, voz, vídeo y accesibilidad.

## Índice
- [01 · Menú vivo por intención](capacidades/01-menu-vivo-por-intencion.md)
- [02 · Continuidad de trabajo entre sesiones](capacidades/02-continuidad-de-trabajo-entre-sesiones.md)
- [03 · Superficies conversacionales persistentes](capacidades/03-superficies-conversacionales-persistentes.md)
- [04 · Formularios con procedencia por campo](capacidades/04-formularios-con-procedencia-por-campo.md)
- [05 · Bandeja universal de decisiones](capacidades/05-bandeja-universal-de-decisiones.md)
- [06 · Paleta universal de acciones contextuales](capacidades/06-paleta-universal-de-acciones-contextuales.md)
- [07 · Workspaces efímeros por misión](capacidades/07-workspaces-efimeros-por-mision.md)
- [08 · Memoria semántica de interacción](capacidades/08-memoria-semantica-de-interaccion.md)
- [09 · Explicabilidad de adaptación UX](capacidades/09-explicabilidad-de-adaptacion-ux.md)
- [10 · Handoff humano-agente visual](capacidades/10-handoff-humano-agente-visual.md)
- [11 · Continuidad multimodal y multidispositivo](capacidades/11-continuidad-multimodal-y-multidispositivo.md)
- [12 · Complejidad progresiva](capacidades/12-complejidad-progresiva.md)
- [13 · UI contrafactual](capacidades/13-ui-contrafactual.md)
- [14 · Compilador de hábitos en SOPs](capacidades/14-compilador-de-habitos-en-sops.md)
- [15 · Precarga predictiva sin bloqueo](capacidades/15-precarga-predictiva-sin-bloqueo.md)
- [16 · Aprendizaje colectivo preservando privacidad](capacidades/16-aprendizaje-colectivo-preservando-privacidad.md)
- [17 · UX autoevaluada y reversible](capacidades/17-ux-autoevaluada-y-reversible.md)
- [18 · Lienzo empresarial colaborativo](capacidades/18-lienzo-empresarial-colaborativo.md)
- [19 · Interfaz espacial 2D y zoom semántico](capacidades/19-interfaz-espacial-2d-y-zoom-semantico.md)
- [20 · Espacios persistentes y disposiciones múltiples](capacidades/20-espacios-persistentes-y-disposiciones-multiples.md)
- [21 · Computación ambiental discreta](capacidades/21-computacion-ambiental-discreta.md)
- [22 · Composiciones certificadas por tenant](capacidades/22-composiciones-certificadas-por-tenant.md)
- [23 · Manipulación directa con conversación simultánea](capacidades/23-manipulacion-directa-con-conversacion-simultanea.md)
- [24 · Interfaces fluidas con motion semántico](capacidades/24-interfaces-fluidas-con-motion-semantico.md)
- [25 · Computer use híbrido semántico-visual](capacidades/25-computer-use-hibrido-semantico-visual.md)
- [26 · Multijugador humano-agente con presencia](capacidades/26-multijugador-humano-agente-con-presencia.md)
- [27 · Grafo empresarial navegable](capacidades/27-grafo-empresarial-navegable.md)
- [28 · UI multicapa por profundidad cognitiva](capacidades/28-ui-multicapa-por-profundidad-cognitiva.md)
- [29 · Time travel operativo](capacidades/29-time-travel-operativo.md)
- [30 · Aprendizaje por correcciones explícitas](capacidades/30-aprendizaje-por-correcciones-explicitas.md)
- [31 · Periferia de atención](capacidades/31-periferia-de-atencion.md)
- [32 · Componentes polimórficos](capacidades/32-componentes-polimorficos.md)
- [33 · Bifurcaciones visuales de decisiones](capacidades/33-bifurcaciones-visuales-de-decisiones.md)
- [34 · Adaptación por fricción observable](capacidades/34-adaptacion-por-friccion-observable.md)
- [35 · Gestos semánticos universales](capacidades/35-gestos-semanticos-universales.md)
- [36 · Perspectivas simultáneas por rol](capacidades/36-perspectivas-simultaneas-por-rol.md)
- [37 · Interfaz de confianza graduada](capacidades/37-interfaz-de-confianza-graduada.md)
- [38 · Experiencias portables entre tenants](capacidades/38-experiencias-portables-entre-tenants.md)
- [39 · Optimización de UX mediante experimentos](capacidades/39-optimizacion-de-ux-mediante-experimentos.md)
- [40 · Branding contextual multitenant](capacidades/40-branding-contextual-multitenant.md)
- [41 · Narrativa operacional con recibos](capacidades/41-narrativa-operacional-con-recibos.md)
- [42 · Microtarjetas UI orientadas a misión](capacidades/42-microtarjetas-ui-orientadas-a-mision.md)
- [43 · Interoperabilidad A2UI con vistas existentes](capacidades/43-interoperabilidad-a2ui-con-vistas-existentes.md)

- [44 · AgntiaPro Launcher — Android](capacidades/44-agntiapro-launcher-android.md)

## Cómo elegir
Para cada idea evaluar: novedad real respecto al código actual, valor para microempresa, complejidad, latencia, privacidad, dependencias, riesgos, reutilización de componentes y evidencia empírica. No priorizar sin auditar implementación existente.

## Baseline a reauditar
`apps/web/src/workspaces/registry.ts`, `apps/web/src/App.tsx`, `apps/web/src/view/ViewRenderer.tsx`, `packages/domain/src/views.ts`, `packages/domain/src/view-envelope.ts`, `apps/server/src/engine/conversation.ts`, `apps/server/src/engine/cognition/v2/*`, `apps/server/src/kernel/*`. Las ramas recientes pueden superar a main. Documentación relacionada: `docs/arquitectura/ui-runtime-adaptativa/`.
