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


## Anexo de contraste con código real · revisión 2
Baseline 21364ef55320ffb46fdcfd65a02802d593f9285b. Lectura focalizada de snapshots y contratos activos; no certifica auditoría exhaustiva de todos los imports transitivos ni QA visual. Esta sección prevalece sobre cualquier descripción anterior incompatible.

| Landing.jsx / función | Datos y estados requeridos | Prueba |
|---|---|---|
| agents / supportAgents | 3 protagonistas con id, name, role, img, duration, quote, detail; 3 colaboradores Marcos/Ana/Juan con name, role, initials, detail. Conservar copy existente; mapear IDs editoriales a actores centrales sin cambiar roles unilateralmente. | 6 agentes; abrir protagonistas y preguntar por colaboradores |
| laiaReply / send | 8 ramas explícitas (clientes, atención, implantación, precio, finanzas, seguridad/web, equipo, saludo) y fallback; mensajes role laia/user, text; typing y exclusión de envío concurrente; retardo actual 850ms | probar cada rama, prioridad de coincidencias y texto vacío |
| initialMessages / chips | saludo literal existente y tres chips comerciales; conversación pública compartida entre inline y launcher | abrir launcher conserva mensajes |
| askAgent / openAgent | nombre y rol del agente; selectedAgent, playing, progress 0–100 | diálogo, reinicio y cierre; progreso simulado no equivale a vídeo |
| ProductScene | 4 tabs; vista 0 imagen product-dimension.webp; vista 1 conversación/plan de 3 pasos; vista 2 tres columnas de dos tareas; vista 3 tres carpetas | conservar composición; Estudio Lumen es dato antiguo a sustituir solo en futura proyección autorizada |
| submitForm | name, company, sector, phone; nombre >=2, empresa no vacía, teléfono 7–15 dígitos y caracteres admitidos; errors, submitted | error por campo, foco inicial, éxito local, reset; no crear reserva real |
| navigation / workflow / implementation | 4 enlaces internos, 4 pasos de trabajo, 4 de implantación; copy editorial no dataset privado | enlaces y CTA |
| Dialog / composerNote / legalVisible | estado UI local, no hechos empresariales | cierre, aviso, foco; no inferir consentimiento |
| BrandLockup / publicSite | marca estática y rutas legales | no generar registros empresariales para decoración |

Corrección de alcance: la oferta 1.500 EUR y desde 1.000 EUR ya aparece en la rama precio de laiaReply. No sustituir respuestas existentes por un LLM ficticio. El formulario no persiste lead: el vínculo lead-001 es una propuesta narrativa, no comportamiento implementado.
