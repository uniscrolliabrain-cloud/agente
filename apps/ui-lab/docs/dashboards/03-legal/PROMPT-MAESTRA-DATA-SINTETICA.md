# Prompt maestra · data sintética · 03-legal

Estado: propuesta para revisión; no registros materializados. Leer primero [contrato común del lote](../../agntia-demo/07-proyecciones-dashboards/00-CONTRATO-GENERACION-LOTE-01.md), [dataset](../../agntia-demo/03-compilacion-y-dataset/DATASET-SINTETICO.md), [registros propuestos](../../agntia-demo/06-diagnostico-copy-data-sintetica/01-COPY-Y-REGISTROS-NUEVOS-PROPUESTOS.md) y [componentes reales](./componentes-reales/README.md).

## Mandato de producto
Quiero que esta superficie muestre información jurídica auténtica y distinguible de los datos ficticios. No quiero que un agente invente políticas de privacidad, responsables, domicilios, NIF, plazos de retención ni garantías.
### Proyección y registros
- LegalLink: seis claves verificadas en publicSite.ts: notice/aviso-legal.html, privacy/privacidad.html, terms/terminos.html, cookies/cookies.html, ai/transparencia-ia.html, trust/confianza.html. Campos key, path, label, origin, verificationStatus. Resolver origen con función existente, no inventar URL.
- LegalDocumentMetadata: documentId, sourceRef, version, effectiveDate, reviewStatus, publicationStatus, locale; campos desconocidos null. El texto completo solo se incorpora desde fuente legal autorizada, no desde generación sintética.
- LegalViewScenario: loading, available, unavailable, outdated-link, error. Usar texto de placeholder inequívoco «Documento no disponible en esta preview» cuando falte fuente.
- ConsentScenario (solo si existe contrato): purposeId, decision, logicalTimestamp, policyVersion, simulationMode. Probar aceptar/rechazar/retirar sin almacenar consentimiento real ni activar trackers.
### Densidad y límites
Seis enlaces, cinco estados de lectura y escenarios de consentimiento exclusivamente de prueba. No crear seis documentos jurídicos ficticios. No hay componente legal propio identificado en snapshot; localizar implementación antes de diseñar.
### Recorrido
Visitante de landing o login → enlace legal → lectura de documento verificado o estado no disponible → regreso al origen. Un consentimiento demo nunca se convierte en consentimiento jurídico real.
### Aceptación
Verificar fuente y destino por enlace, distinguir publicado de borrador, no mostrar fecha de vigencia inventada ni declarar cumplimiento RGPD por diseño. Si faltan fuentes, registrar bloqueo y mantener la interfaz en preview.

## Entrega exigida al futuro generador
Proponer schema tipado y mapeo a props existentes; manifest de registros con IDs y fuente; escenarios positivos y negativos; proyección pura con tests de referencias, determinismo y aislamiento; informe de campos no soportados. Guardar datos ejecutables únicamente en la fuente central futura apps/ui-lab/agntia-demo/, no en esta carpeta. No implementar backend, cambiar código activo ni desplegar sin autorización.
