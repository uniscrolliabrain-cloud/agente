# Atlas de los 14 repositorios hijos — índice de investigación

> Esta sección reúne los 14 Concept Masters y los relaciona con el código de `agente`. **No certifica que las capacidades estén implementadas.** La investigación de cada hijo se amplía sin intervenir en su desarrollo.

| # | Repositorio | Concepto central | Dependencias transversales principales |
|---|---|---|---|
| 1 | [agntia-ciberseguridad](https://github.com/uniscrolliabrain-cloud/agntia-ciberseguridad) | Security & Agent Trust | Kernel, permisos, evidencias, eventos |
| 2 | [agntia-clientes](https://github.com/uniscrolliabrain-cloud/agntia-clientes) | Customer Intelligence | CRM, identidad, consentimientos |
| 3 | [agntia-gestoria](https://github.com/uniscrolliabrain-cloud/agntia-gestoria) | Accounting & Administrative Operations | Finanzas, Legal, documentos |
| 4 | [agntia-comunicacion](https://github.com/uniscrolliabrain-cloud/agntia-comunicacion) | Unified Communications | Laia, voz, canales, privacidad |
| 5 | [agntia-ventas](https://github.com/uniscrolliabrain-cloud/agntia-ventas) | Revenue & Sales | Clientes, Marketing, Finanzas |
| 6 | [agntia-finanzas](https://github.com/uniscrolliabrain-cloud/agntia-finanzas) | Financial Intelligence | Gestoría, Ventas, Seguros |
| 7 | [agntia-redes](https://github.com/uniscrolliabrain-cloud/agntia-redes) | Social Media Operations | Marketing, Branding, Comunicación |
| 8 | [agntia-marketing](https://github.com/uniscrolliabrain-cloud/agntia-marketing) | Marketing Intelligence | Ventas, Clientes, Redes |
| 9 | [agntia-video](https://github.com/uniscrolliabrain-cloud/agntia-video) | Video & Avatar Production | Comunicación, Diseño, Branding |
| 10 | [agntia-branding](https://github.com/uniscrolliabrain-cloud/agntia-branding) | Brand Intelligence | Diseño, Marketing, Vídeo |
| 11 | [agntia-dise-o](https://github.com/uniscrolliabrain-cloud/agntia-dise-o) | Design & Experience OS | Branding, Web, Video |
| 12 | [agntia-legal](https://github.com/uniscrolliabrain-cloud/agntia-legal) | Legal Intelligence | Gestoría, Seguros, Finanzas |
| 13 | [agntia-seguros](https://github.com/uniscrolliabrain-cloud/agntia-seguros) | Insurance Intelligence & Resilience | Ciberseguridad, Legal, Finanzas |
| 14 | [agntia-formacion](https://github.com/uniscrolliabrain-cloud/agntia-formacion) | Learning & Training | Vídeo, Comunicación, RRHH |

## Ficha obligatoria de cada repo
1. **Visión final:** síntesis fiel del Concept Master y motores diferenciales.
2. **Léxico original:** palabras, IDs, status, eventos, rutas, schema, naming y sus fuentes.
3. **Ownership:** entidades, datos, capacidades y efectos que pertenecen al hijo.
4. **Contratos con el padre:** identidad, mandato, aprobación, evento, capability, resultado y UI.
5. **Contratos con hermanos:** mínimo dato compartido, consentimiento, versión, causalidad.
6. **Frontera de seguridad:** secretos, PII, riesgo, jurisdicción y acción regulada.
7. **Arquitectura de destino:** qué hace el hijo, qué nunca debería duplicar y qué servicios comunes consume.
8. **Mapa de código observado:** archivos, SHAs, ramas, evidencias y lagunas; no confundir con Concept Master.
9. **Pruebas de convergencia:** escenario interdominio sin LLM, con LLM y con fallo.
10. **Conflictos de léxico:** equivalencias, colisiones, aliases, propuesta de decisión.
11. **Riesgos sistémicos:** transacciones, latencia, consistencia, recuperación, coste, datos.
12. **Decisiones abiertas:** ADR propuestos, dependencias y aceptación futura.

## Escenarios que prueban arquitectura global
- Nuevo cliente: Clientes crea relación; Legal documenta consentimiento; Gestoría configura registros; Finanzas prepara cobros; Comunicación activa canales; Ciberseguridad audita acceso; LAIA explica el estado.
- Incidente de ransomware: Ciberseguridad documenta hechos; Seguros prepara evidencia contractual; Legal evalúa notificaciones; Finanzas modela pérdida; Comunicación prepara mensajes; runtime preserva autoridad.
- Lanzamiento comercial: Branding aporta identidad; Diseño crea componentes; Marketing define campaña; Redes publica con aprobación; Ventas gestiona leads; Finanzas mide resultados; Formación genera guía.
- Producción audiovisual: Branding fija identidad; Diseño prepara assets; Vídeo produce; Comunicación distribuye; Legal verifica derechos; Redes/Marketing planifican canales.

**Próximo trabajo de investigación:** leer léxicos de cada repo y comparar esquemas reales antes de completar fichas individuales. No atribuir al padre la propiedad de los datos especializados.
