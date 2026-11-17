# Campañas piloto: Laia en Gmail para 2–3 clientes

## GW-00 — Verificación de restricciones y costes
Investigar documentación vigente de Apps Script vs HTTP add-ons, Gmail personal vs Workspace, límites de testing, instalación entre dominios, OAuth consent, scopes, Marketplace unlisted, revisiones y requisitos de seguridad. Entregable: matriz de capacidades y fuentes con fecha. Gate: una ruta de distribución externa realmente comprobada.

## GW-01 — Proyecto Google Cloud y OAuth
Crear proyecto dev separado, OAuth consent screen External, usuarios de prueba, credenciales y redirect URIs, scopes mínimos de identidad. Secretos solo en vault. Entregable: checklist manual de cuentas y secretos (sin valores). Gate: login de un usuario externo autorizado y revocación verificados.

## GW-02 — Add-on Gmail chat-only
Implementar panel de LAIA con tarjetas/acciones soportadas por Gmail, login seguro contra AgntiaPro, input de texto, historial paginado, estados de ejecución y errores. No leer correos todavía. Gate: conversación en Gmail y AgntiaPro sincronizada.

## GW-03 — Tenant isolation
Probar usuarios de tres empresas con cuentas distintas, cambios de tenant, permisos, sesiones caducadas, cierre de pestaña, reconexión, nuevo chat y mensajes simultáneos. Gate: 0 fugas cross-tenant, 0 pérdida/duplicación en pruebas.

## GW-04 — Distribución externa
Determinar si test deployment cubre pilotos externos; si no, preparar publicación Marketplace unlisted con revisión y verificaciones necesarias. No prometer que OAuth Testing habilita instalación. Gate: usuario externo instala add-on de forma autorizada y reproducible.

## GW-05 — Contexto y herramientas Gmail
Introducir lectura contextual con permisos incrementales, policy y tratamiento de datos. No solicitar scopes restringidos sin evaluar verificación y seguridad. Gate: consentimiento explícito, revocación, inyección adversarial y trazabilidad.

## GW-06 — Handoff de producción
Documentar limitaciones del host, soporte, incidencias, costes reales, cuotas, RGPD, DPA, monitorización y criterios de paso a más clientes. Gate: revisión del fundador antes de deploy o publicación.

## Reporte obligatorio por campaña
- Commit SHA y branch.
- Inventario de archivos tocados y creados.
- Dependencias y scopes añadidos.
- Evidencia de instalación y tests ejecutados.
- Costes reales observados frente a estimados.
- Riesgos, decisiones y bloqueos.
- Próximo paso con gate explícito.

## Dependencias
GW-00 antes de GW-01/GW-04. Universal Conversation server-side antes de GW-02. GW-03 antes de pilotos reales. GW-05 solo después de evaluar scopes. No merge a main, deploy ni publicación sin aprobación.
