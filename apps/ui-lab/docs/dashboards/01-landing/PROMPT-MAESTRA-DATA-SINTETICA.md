# Prompt maestra · data sintética · 01-landing

Estado: propuesta para revisión; no registros materializados. Leer primero [contrato común del lote](../../agntia-demo/07-proyecciones-dashboards/00-CONTRATO-GENERACION-LOTE-01.md), [dataset](../../agntia-demo/03-compilacion-y-dataset/DATASET-SINTETICO.md), [registros propuestos](../../agntia-demo/06-diagnostico-copy-data-sintetica/01-COPY-Y-REGISTROS-NUEVOS-PROPUESTOS.md) y [componentes reales](./componentes-reales/README.md).

## Mandato de producto
Quiero que la landing represente la oferta de AgntiaPro sin convertir la simulación en prueba comercial. El visitante todavía no es el owner autenticado. La conversación pública con LAIA es una escena de descubrimiento, no acceso a datos privados.
### Proyección y registros
- PublicOffer: leer copy de Landing.jsx y oferta documental de compilación 1.500 EUR y suscripción desde 1.000 EUR; no insertar precios en el copy si no están aprobados para esa superficie. Campos offerId, title, description, sourceRef, publicationStatus, currency, priceKind. Separar capacidad comercial propuesta de capacidad técnica verificada.
- PublicAgentCard: agent-laia, agent-antonio, agent-pedro; nombre, función, assetRef, quote y duración únicamente como metadato editorial si existe. No inventar reproducción de vídeo ni disponibilidad online. Usar retratos existentes /landing/laia.png, antonio.png, pedro.png.
- DiscoveryScene: lead-001, thread-001, msg-001 de Taller Bruma, con texto de consulta ficticio, respuesta contextual, siguiente paso y estado de simulación. No exponer email, teléfono, contrato, factura ni datos de otros clientes.
- ProductScene: cuatro escenas actuales Centro de Mando, Conversación, Operaciones y Workspaces; proyectar fragmentos públicos de la historia A y B sin cambiar copy aprobado. Marcar visualizaciones conceptuales como tales.
- CTAState: idle, composing, preview-response, unavailable, error; una cita o contacto real exige un flujo autorizado distinto del fixture.
### Casos y densidad
Tres tarjetas de agentes existentes, cuatro escenas de producto, una conversación principal de 4–6 mensajes propuestos, una alternativa de consulta sin datos suficientes y un estado de error. No crear testimonios, logos de clientes, conversiones, métricas de ROI ni sellos de confianza ficticios.
### Recorrido causal
Visita anónima → consulta sobre citas perdidas → LAIA solicita contexto → propuesta de discovery → oportunidad simulada lead-001/opportunity-001. La conversión real no se ejecuta. El mismo lead puede aparecer en la historia interna únicamente en la sesión demo autenticada.
### Aceptación
La proyección pública usa allowlist de campos, no importa el dataset privado completo en el bundle público; los enlaces legales proceden de publicSite.ts; ninguna escena revela credenciales, identidad del founder ni cifras de clientes como hechos reales.

## Entrega exigida al futuro generador
Proponer schema tipado y mapeo a props existentes; manifest de registros con IDs y fuente; escenarios positivos y negativos; proyección pura con tests de referencias, determinismo y aislamiento; informe de campos no soportados. Guardar datos ejecutables únicamente en la fuente central futura apps/ui-lab/agntia-demo/, no en esta carpeta. No implementar backend, cambiar código activo ni desplegar sin autorización.
