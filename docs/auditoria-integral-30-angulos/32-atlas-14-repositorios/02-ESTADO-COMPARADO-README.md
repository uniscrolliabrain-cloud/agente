# Lectura comparativa de los 14 README en main — 15 noviembre 2026

> **Evidencia:** lectura directa del README de cada repositorio, en su rama por defecto. Los estados siguientes son **declaraciones del repositorio**, no resultados de tests ejecutados por esta auditoría. Se ha observado que la ruta estándar del Concept Master no aparece en el default branch de los repos consultados; no se infiere ausencia del documento en otras ramas.

| Repo | Estado declarado | Frontera de integración crítica |
|---|---|---|
| [ciberseguridad](./ciberseguridad.md) | Python/FastAPI + SDK TS server-only; README declara 84 rutas /v1, 196 tests Python, demo sintética y producción deshabilitada. | Autoridad de escaneo, límites de misión, cadena de custodia, clasificación de evidencia, secretos y scopes de agentes. |
| [clientes](./clientes.md) | README declara SKELETON_IMPLEMENTED, 42 campañas, 87 tests locales y 9 escenarios E2E; sin proveedores, Postgres/RLS ni bridge al padre. | Customer identity vs tenant identity; CRM, tickets, consentimientos, SLA, timeline y correlación con comunicaciones. |
| [gestoria](./gestoria.md) | Python 3.11+, API y dashboard, SQLite/documentos, token de owner, sesiones opacas; README describe modelos 303/130 y expedientes. | Fiscalidad España, obligaciones, expediente documental, firma/revisión humana, puente TS-Python y tenancy. |
| [comunicacion](./comunicacion.md) | README DOCUMENTATION_ONLY / NOT_STARTED; relaciones públicas, comunicación interna, prensa y crisis. | Identidad de canal, voz/chat, entregabilidad, aprobaciones de publicación, comunicaciones de crisis. |
| [ventas](./ventas.md) | README DOCUMENTATION_ONLY, 42 campañas NOT_STARTED; JWT Supabase y twins como diseño. | Oportunidades, propuestas, quotes, approvals, autoridad de pipeline y CRM de Clientes. |
| [finanzas](./finanzas.md) | README indica fundaciones C01–C05 con 41 tests; catálogo vacío, sin persistencia/adaptadores/UI/E2E. | Ledger, saldos vs forecast, conciliación, PSD2/consentimientos, roles de pago, finanzas vs gestoría. |
| [redes](./redes.md) | README DOCUMENTATION_ONLY; JWT Supabase y twins previstos, sin conectores ni publicaciones. | Calendario, consentimientos, publicaciones, receipts, métricas, intersección con Marketing y Comunicación. |
| [marketing](./marketing.md) | README informa implementación en rama: 23 DONE, 15 PARTIAL, 4 BLOCKED; 88 tests declarados; sin proveedores/Postgres. | Campañas, audiencias, medición, consentimientos, outbox, SDK y puente al padre. |
| [video](./video.md) | README describe MVP 0.4 con Python/FFmpeg, @agntia/video TS, adaptador Hono y 16/17 herramientas. | Asset lifecycle, jobs asíncronos, derechos, storage, presupuesto, voz/avatar y artefactos. |
| [branding](./branding.md) | README DOCUMENTATION_ONLY; 42 campañas NOT_STARTED; Supabase/twins y AuthorityMap previstos. | Brand guidelines versionadas, identidad, derechos y aprobación de assets entre Diseño/Vídeo/Marketing. |
| [dise-o](./dise-o.md) | README DOCUMENTATION_ONLY / NOT_STARTED; diseño UI/UX, web y activos. | Design system, experiencia accesible, design-to-code fidelity, versiones y derechos. |
| [legal](./legal.md) | README declara implementación local TS/Hono, 221 tests; 16 IMPLEMENTED, 24 PARTIAL, 2 STUBBED; proveedores y RLS real sin validar. | Provenance de fuentes, jurisdicción, vigencia, revisión profesional, contratos y consentimiento. |
| [seguros](./seguros.md) | README DOCUMENTATION_ONLY; 42 campañas NOT_STARTED; operador autorizado en el diseño. | Pólizas, siniestros, coberturas, notificaciones y evidencia desde Ciberseguridad/Legal. |
| [formacion](./formacion.md) | README DOCUMENTATION_ONLY; 42 campañas NOT_STARTED; LMS/tutores IA previstos. | Objetivos, módulos, progreso, pruebas, acreditación y minimización de datos personales. |

## Hallazgo transversal principal
La **heterogeneidad no es un defecto**: hay servicios Python/FastAPI, Python/FFmpeg, TypeScript/Hono y departamentos documentales. El padre no debe exigir stack único. Debe exigir **protocolo y semántica únicos**: identidad/mandato, tenant, contratos de capacidades, schemaVersion, errores, efectos, receipts, evidencias, auditabilidad y autorización.

## Diferencia especialmente relevante
Los README de Ventas, Redes, Branding, Legal, Seguros y Formación hablan de **JWT Supabase y twins vinculados**; el padre ya define `Actor`, `AgentActor`, `ExecutionContext`, `tenantId`, `roleId` y `runtimeId`. Es imprescindible acordar **qué representa un twin, cómo se vincula a la identidad canónica, quién emite el token y cómo se verifica el mandato**. No asumir que un JWT Supabase por sí solo concede permisos de kernel.

## Método de expansión de fichas
Las fichas son **v1 de contexto arquitectónico**; cada una necesita lectura de contratos, schemas y léxicos propios, además del Concept Master. Priorizar relaciones semánticas y diseño final, no auditoría de calidad ni supervisión de implementadores.
