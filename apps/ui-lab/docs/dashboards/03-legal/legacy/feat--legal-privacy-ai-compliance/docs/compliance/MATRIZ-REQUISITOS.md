# Matriz viva de requisitos

**Todos los estados iniciales son PENDIENTE DE VERIFICACIÓN.** No implica incumplimiento demostrado.

| ID | Control | Campaña | Evidencia exigida | Responsable | Estado |
|---|---|---|---|---|---|
| INV-01 | Inventario datos/finalidades/bases legales | 01 | mapa tablas-endpoints-proveedores | Ingeniería + legal | Pendiente |
| INV-02 | Roles responsable/encargado/subencargado | 01/04 | ROPA, DPA, lista proveedores | Legal | Pendiente |
| INV-03 | Cookies/storage y SDK externos | 01/02 | inventario y prueba navegador | Frontend | Pendiente |
| INV-04 | Google OAuth scopes, retención y verificación | 01/02 | scopes reales y consola verificada por fundador | Integraciones | Pendiente |
| LEG-01 | Aviso legal e identidad del prestador | 02 | página pública revisada | Fundador + legal | Pendiente |
| LEG-02 | Privacidad, información arts. 13/14 | 02 | páginas/versiones y enlaces | Legal | Pendiente |
| LEG-03 | Cookies y CMP si aplica | 02 | prueba aceptación/rechazo/revocación | Frontend | Pendiente |
| LEG-04 | Términos SaaS y DPA | 02/04 | contratos aprobados | Legal | Pendiente |
| DSR-01 | Acceso y portabilidad/exportación | 03 | tests tenant-scoped | Backend | Pendiente |
| DSR-02 | Rectificación, supresión, limitación, oposición | 03 | flujos y auditoría | Backend | Pendiente |
| DSR-03 | Retención, backups, eventos, RAG, embeddings | 03 | política y test de purga | Backend | Pendiente |
| DSR-04 | Incidentes y respuesta brechas | 03/06 | runbook y simulacro | Seguridad | Pendiente |
| TEN-01 | Aislamiento tenant, roles y permisos | 04 | tests de acceso cruzado | Kernel | Pendiente |
| TEN-02 | Políticas, subencargados, contratos por tenant | 04 | configuración y DPA | Producto + legal | Pendiente |
| TEN-03 | Logs/auditoría sin PII y sin falsas anonimizaciones | 04 | pruebas y análisis | Kernel | Pendiente |
| AI-01 | Aviso de interacción con IA | 05 | UI y pruebas | Producto | Pendiente |
| AI-02 | Voz, avatar y contenido sintético | 05 | UX, metadata y contratos proveedor | Producto | Pendiente |
| AI-03 | Clasificación por caso de uso, RRHH y otros | 05 | registro de usos y evaluación legal | Legal + producto | Pendiente |
| AI-04 | Supervisión humana, aprobaciones y trazabilidad | 05 | tests y procedimientos | Kernel | Pendiente |
| QA-01 | Tests automáticos, seguridad, accesibilidad | 06 | CI y evidencias | QA | Pendiente |
| QA-02 | Checklist Google, proveedores y producción | 06 | aprobación explícita | Fundador | Pendiente |

## Reglas de actualización
Cada fila debe enlazar a evidencia concreta (archivo, commit, test, revisión legal fechada) antes de pasar a HECHO. Distinguir controles que solo pueden cerrarse con acciones externas del fundador. Nunca guardar tokens ni datos reales en evidencias.
