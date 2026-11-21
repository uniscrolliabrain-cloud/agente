# Matriz viva de requisitos

Estado tras la implementación Freebuff. Las evidencias técnicas se detallan en el [handoff](reports/FREEBUFF-HANDOFF-FINAL.md). Los borradores requieren aprobación antes de publicar.

| ID | Control | Campaña | Evidencia exigida | Responsable | Estado |
|---|---|---|---|---|---|
| INV-01 | Inventario datos/finalidades/bases legales | 01 | mapa tablas-endpoints-proveedores | Ingeniería + legal | Inventario técnico en [datos y flujos](inventario/DATOS-Y-FLUJOS.md). Finalidades y bases por aprobar |
| INV-02 | Roles responsable/encargado/subencargado | 01/04 | ROPA, DPA, lista proveedores | Legal | [Mapa de proveedores](inventario/PROVEEDORES-Y-TRANSFERENCIAS.md). ROPA, DPA y roles pendientes de aprobación |
| INV-03 | Cookies/storage y SDK externos | 01/02 | inventario y prueba navegador | Frontend | [Inventario técnico](inventario/COOKIES-STORAGE.md) y prueba inicial en Chromium. Infraestructura externa pendiente |
| INV-04 | Google OAuth scopes, retención y verificación | 01/02 | scopes reales y consola verificada por fundador | Integraciones | [Scopes y flujos](inventario/OAUTH-SCOPES.md) verificados en código. Consola y permisos amplios pendientes |
| LEG-01 | Aviso legal e identidad del prestador | 02 | página pública revisada | Fundador + legal | Borrador protegido por el gate. Identidad legal pendiente |
| LEG-02 | Privacidad, información arts. 13/14 | 02 | páginas/versiones y enlaces | Legal | Borrador versionado y enlaces locales verificados. Aprobación pendiente |
| LEG-03 | Cookies y CMP si aplica | 02 | prueba aceptación/rechazo/revocación | Frontend | Inventario y borrador actualizado. Validación jurídica y de hosting pendiente |
| LEG-04 | Términos SaaS y DPA | 02/04 | contratos aprobados | Legal | Borrador y estado visible en gobernanza. Contrato SaaS y DPA pendientes |
| DSR-01 | Acceso y portabilidad/exportación | 03 | tests tenant-scoped | Backend | Registro y seguimiento para revisión humana. Entrega y portabilidad manuales |
| DSR-02 | Rectificación, supresión, limitación, oposición | 03 | flujos y auditoría | Backend | Solicitudes verificadas por API. Ejecución y respuesta delegadas a revisión humana |
| DSR-03 | Retención, backups, eventos, RAG, embeddings | 03 | política y test de purga | Backend | [Mapa de retención](inventario/RETENCION-Y-BORRADO.md). Purga reconciliada y restauración pendientes |
| DSR-04 | Incidentes y respuesta brechas | 03/06 | runbook y simulacro | Seguridad | Pendiente de responsable, procedimiento y simulacro |
| TEN-01 | Aislamiento tenant, roles y permisos | 04 | tests de acceso cruzado | Kernel | Gobernanza con permiso vigente y prueba HTTP. RLS de entorno objetivo pendiente |
| TEN-02 | Políticas, subencargados, contratos por tenant | 04 | configuración y DPA | Producto + legal | Estados visibles para owner. Contratos y políticas por aprobar |
| TEN-03 | Logs/auditoría sin PII y sin falsas anonimizaciones | 04 | pruebas y análisis | Kernel | Recibo de solicitud minimizado; digest de auditoría potencialmente vinculable. Revisión general pendiente |
| AI-01 | Aviso de interacción con IA | 05 | UI y pruebas | Producto | Aviso integrado en chat completo, dock y sheet. Evidencia Chromium |
| AI-02 | Voz, avatar y contenido sintético | 05 | UX, metadata y contratos proveedor | Producto | Dictado identificado. Telefonía, Anam y marcado por canal pendientes |
| AI-03 | Clasificación por caso de uso, RRHH y otros | 05 | registro de usos y evaluación legal | Legal + producto | [Inventario de casos](inventario/CASOS-USO-IA.md); clasificación jurídica por caso pendiente |
| AI-04 | Supervisión humana, aprobaciones y trazabilidad | 05 | tests y procedimientos | Kernel | Controles existentes conservados. Validación transversal y procedimiento pendientes |
| QA-01 | Tests automáticos, seguridad, accesibilidad | 06 | CI y evidencias | QA | Gate, comprobaciones HTTP y prueba Chromium. Consultar alcance en handoff |
| QA-02 | Checklist Google, proveedores y producción | 06 | aprobación explícita | Fundador | Pendiente de aprobación y validación de proveedores, dominios y consola |

## Reglas de actualización
Cada fila debe enlazar a evidencia concreta (archivo, commit, test, revisión legal fechada) antes de pasar a HECHO. Distinguir controles que solo pueden cerrarse con acciones externas del fundador. Nunca guardar tokens ni datos reales en evidencias.
