# Campaña 04 — Cumplimiento multi-tenant

## Meta
Gobernanza contractual y técnica por organización sin contaminar permisos, datos ni responsabilidades.

## Fases
1. **Roles legales**: AgntiaPro responsable de datos propios (cuentas, facturación, marketing propio); generalmente encargado respecto de datos que trata por cuenta de clientes, según finalidad real. Documentar excepciones y roles de subencargados.
2. **Contrato SaaS/DPA**: definir instrucciones documentadas, medidas, subencargados, transferencias, asistencia a derechos, brechas, auditoría, fin de servicio y devolución/borrado. Revisión jurídica obligatoria.
3. **Modelo por tenant**: verificar owner/manager/empleado/invitado/agente, roles y permisos, membresías, scopes, RLS, delegaciones, aislamiento de conectores y almacenamiento. No confiar en tenantId proporcionado por cliente.
4. **Configuración**: defaults seguros de retención, conectores, consentimientos cuando corresponda, avisos, subencargados y región; evitar que un owner desactive obligaciones legales.
5. **Auditoría**: trazabilidad de cambios de políticas, accesos, aprobaciones y operaciones sensibles; minimización de logs. Revisar semántica de anonimización de `kernel/audit/entry.ts`.
6. **Escenarios jerárquicos**: documentar futuras organizaciones anidadas sin asumir que la implementación actual ya las soporta. Evaluar permisos por ancestor/descendant y límites de acceso antes de habilitar.
7. **Pruebas**: dos tenants reales de dogfooding y usuarios con distintos roles; intentos cruzados de consulta/exportación/borrado/acciones/proveedores.

## Entregables
`inventario/ROLES-Y-SUBENCARGADOS.md`, borrador DPA versionado, matriz RBAC/ABAC, `reports/CAMPANA-04-REPORTE.md`, evidencias de aislamiento.

## Aceptación
Ninguna política, credencial, archivo, memoria, evento ni solicitud de derechos cruza tenants; las responsabilidades contractuales están definidas y aprobadas.
