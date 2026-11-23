# Formación · Trabaja con LAIA

## Campaña de componentes · Template audiovisual de 120 cursos

- [Campaña completa y handoff de implementación](./campana-template-interfaz-120/README.md) — benchmark obligatorio Landing + Estudio Demo reales, 18 componentes propuestos, 10 fases C00–C09, prompt para agente, QA visual y bitácora. Solo documentación en main; sin implementación ni deploy.

## Catálogo y algoritmo de descubrimiento · 120 microcursos

- [Metadata estructurada de 120 cursos (JSON)](./METADATA-120-CURSOS.json) — 60 IA profesional, 50 prácticas LAIA, 10 introducción; IDs y títulos canónicos, taxonomía editorial, objetivos, prerequisitos, candidatos de conectores y estados draft.
- [Concept design Discovery & Learning Engine V2](./DESIGN-ALGORITMO-DISCOVERY-LEARNING-V2.md) — inspiración pública Google/YouTube/Spotify/Meta, candidate generation, elegibilidad, ranking explicable, colecciones, SOP cíclico Cognition V2 TRUE, JEV, gate kernel, proyecciones y roadmap.

**Advertencia de calidad:** los títulos de producción R13–R20 no coinciden completamente con el catálogo R canónico; reconciliar antes de publicar. No se ha implementado el algoritmo ni activado ninguna función.


> **Deja de aprender la IA y empieza a trabajar con LAIA.**

Estado: **diseño documental, no implementado**. Documentación integrada en `main`, en el apartado Formación de UI Lab. No activar integraciones ni modificar runtime sin una campaña posterior.

## Visión
La sección **Formación** es una parte de AgntiaPro con experiencia de descubrimiento audiovisual inspirada en la organización de una biblioteca musical (colecciones, portadas, continuidad, reproducción y recomendaciones), **sin copiar marca, identidad visual ni interfaz de Spotify**. Respetar tokens y componentes reales de la landing AgntiaPro; verificar el branding actual antes de desarrollar.

La unidad pedagógica es un reel de 20–45 s producido con IA, con subtítulos, caption, demostración verificable y CTA contextual: **Conectar aplicación** si no está autorizada, **Pruébalo con LAIA** si ya lo está. La autorización es reutilizable entre ejercicios y revocable. Nunca forzar conexiones para ver contenido.

## Producción editorial · «Deja de aprender la IA y trabaja con LAIA» (60/60)

- [Entrega 1/3 — R01–R20: organización, documentos y conocimiento](./ejercicios/TRABAJA-CON-LAIA-60-PRODUCCION-01-R01-R20.md)
- [Entrega 2/3 — R21–R40: colaboración, proyectos y creatividad](./ejercicios/TRABAJA-CON-LAIA-60-PRODUCCION-02-R21-R40.md)
- [Entrega 3/3 — R41–R50 y P01–P10: vida cotidiana e introducción](./ejercicios/TRABAJA-CON-LAIA-60-PRODUCCION-03-R41-R50-P01-P10.md)

**60 paquetes documentados**: cada uno incluye guion de voz orientativo de 40 s, propuesta de realización, tres consultas de free stock y prompt instrumental Suno sin referencias a artistas. Son materiales de preproducción: requieren revisión editorial y cronometraje, selección y comprobación de licencias de stock, generación musical con derechos comerciales adecuados y verificación de capacidades antes de mostrar demostraciones reales. Los 60 tutoriales de uso específico de AgntiaPro siguen fuera de este paquete.

## Inventario
- **[Propuesta SOP cíclico con Cognition V2 TRUE](./PROPUESTA-SOP-CICLICO-COGNITION-V2-TRUE.md)** — arquitectura objetivo, contraste con código, gates y fallbacks.
- **[60 guiones de 40 segundos](./ejercicios/60-GUIONES-40-SEGUNDOS.md)** — propuestas de locución IA01–IA60, pendientes de revisión y cronometraje.

- **[Auditoría de nomenclatura y lexicón del recomendador](./AUDITORIA-LEXICON-RECOMENDADOR.md)** — contratos reales, colisiones semánticas y gate de implementación.

- **[60 microlecciones de IA técnica y profesional](./ejercicios/60-ia-profesional.md)** — catálogo nuevo, pendiente de producción.
- **[Motor de recomendaciones personalizadas](./ALGORITMO-RECOMENDACIONES-PERSONALIZADAS.md)** — diseño de algoritmo contextual, privacidad y roadmap.

- **[Visión editorial futura — 180 microcursos y producción audiovisual agéntica](./VISION-EDITORIAL-180-MICROCURSOS.md)** (solo planificación; los 60 actuales ya documentados).
- **[Prompt maestra V3 — lógica Spotify y branding AgntiaPro](./PROMPT-MAESTRA-FORMACION-V3-SPOTIFY.md) — referencia UX vigente para la próxima implementación.**
- [Prompt maestra UX/UI V2 — adaptación extensa al branding AgntiaPro](./PROMPT-MAESTRA-FORMACION-V2.md).
- [50 ejercicios cotidianos](./ejercicios/50-reels.md), agrupados en 5 colecciones de 10.
- [10 ejercicios de introducción profesional](./ejercicios/10-introduccion.md).
- [UX de Formación](./UX-FORMACION.md).
- [Contrato de microcurso](./CONTRATOS-Y-DATOS.md).
- [Arquitectura Cognition V2 / Composio](./ARQUITECTURA-Y-SEGURIDAD.md).
- [Producción de reels](./PRODUCCION-Y-CAPTIONS.md).
- [Plan de implementación y pruebas](./IMPLEMENTACION-FUTURA.md).

## Invariantes
1. LAIA es la interfaz conversacional, no ejecutora autónoma de APIs.
2. El LLM solo propone intenciones y argumentos; **Cognition V2** es el puente definitivo. El puente cognitivo anterior es legado a retirar tras migración verificada.
3. Kernel y runtime determinista autorizan, compilan/interpretan SOPs tipados Zod y ejecutan adaptadores registrados.
4. Composio es un proveedor de OAuth/conectividad, nunca una lista libre de tools para el LLM.
5. Separación de identidad, tenant, cuenta personal y empresarial, aprobaciones, auditoría, recibos, idempotencia y revocación.
6. Un conector autorizado se reutiliza para varios ejercicios dentro del mismo scope; la UI jamás solicita reconexión innecesaria.
7. Los ejemplos son **ideas sujetas a validación de disponibilidad de APIs, permisos, restricciones comerciales y acciones por proveedor**.

## Alcance de esta documentación
Solo documentación y material de preparación. No hay UI, vídeos, SDK, OAuth, SOPs nuevos ni despliegue.
