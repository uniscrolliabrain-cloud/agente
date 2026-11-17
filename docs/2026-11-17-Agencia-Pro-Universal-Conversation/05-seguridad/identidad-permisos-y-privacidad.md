# Seguridad, privacidad y cumplimiento

## Modelo de confianza
- Sesión AgntiaPro autentica usuario y determina tenant; cada request revalida membership/ACL.
- OAuth Google/Microsoft delega acceso a cuentas concretas; no implica acceso universal a todo el tenant.
- Cada recurso (email, Drive, adjunto) se autoriza al usarlo; una referencia vieja no concede acceso.
- Un mismo trabajador puede pertenecer a varias empresas: aislamiento estricto de hilo, contexto, memoria, tokens y eventos.
- Conversaciones personales por defecto; hilos compartidos requieren ACL y acción explícita.
- Agentes reciben capabilities mínimas y credenciales efímeras mediadas por servidor; jamás refresh tokens en prompts.
- Aprobación humana para envíos externos, borrados, compartir documentos o operaciones de riesgo conforme a política.
- Prompt injection: contenido de correos/documentos es dato no confiable, no instrucción; separar jerarquía y herramientas.
- Auditoría append-only de acceso, decisiones, acciones y revocaciones; minimización de contenido sensible.
- Cifrado en tránsito y reposo, rotación/revocación, control de retención, exportación y eliminación según obligaciones.
- GDPR/RGPD: base jurídica, roles responsable/encargado, DPA, subencargados, transferencias y región de tratamiento revisados con asesoramiento aplicable.
- Rate limiting, idempotencia, cuotas por tenant, detección de abuso, protección de endpoints embebidos y CSP/origins.

## Riesgos detectados a verificar en repo
threads-routes.ts contiene rutas que usan cabecera x-user-id como identidad de presencia/lock; no permitir que identidad confiable dependa de cabeceras cliente sin verificación. Hay fallbacks tenantId 'default' en ciertas rutas; eliminarlos para operación multiempresa crítica con fail-closed. Validar wiring efectivo de AuthzDeps y tenantService; comentarios no prueban ejecución. Evaluar locks in-memory frente a despliegue distribuido.

## Gates
Negativo: usuario A no puede ver hilo de B, ni misma persona en empresa diferente. Revocación OAuth detiene herramientas pero no borra historial. Correo malicioso no activa envíos. Desconexión y reconexión no filtran recursos. Auditoría identifica actor, origen y aprobación.
