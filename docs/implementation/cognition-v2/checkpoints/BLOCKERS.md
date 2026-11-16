# Bloqueos y decisiones pendientes

Checkpoint UTC: 2026-11-16T13:47:34.208372+00:00. Código auditado: [640a55db01fc9f934bf927dec53e97035f0455f3](https://github.com/uniscrolliabrain-cloud/agente/commit/640a55db01fc9f934bf927dec53e97035f0455f3). Base: [54b8d5407a8576459448c4d059a877297d18ca7a](https://github.com/uniscrolliabrain-cloud/agente/commit/54b8d5407a8576459448c4d059a877297d18ca7a). Evidencia local sintética; no certificación de producción.

## Trabajo autónomo disponible

Corregir P1-01/P1-02 con regresiones, migrar más consumidores a proyecciones durables, integrar W6 controladamente después de publicar esta referencia, implementar gateway de egress/cuota desactivado por defecto, mejorar migración y contratos de ACK, ampliar pruebas de RLS y compatibilidad empresarial. Reparar tooling de cobertura/browser cuando el entorno permita dependencias. No hace falta una nueva decisión ontológica para continuar esto.

## Credenciales y configuración externa

- Fast/Slow: cuentas y credenciales de proveedores, modelos aprobados, cuotas y presupuestos por tenant, entorno sintético para carga/costes. Fixtures no miden facturación real.
- JEV: documentación oficial verificada en Typesafe (typesafe.ai -> docs.typesafe.ai; API /v1/systemone). jev.ai estaba aparcado: no se usa. API key/cuenta, modelo pinneado, acuerdo de datos/región/retención y autorización de egress por tenant. No se hicieron inferencias reales. Fuentes y OpenAPI hash en rama W6; no se inventa coste ni calibración.
- Anam y ElevenLabs: cuentas/entitlements, SDK y contrato vigente, callbacks/session tokens, consentimiento de voz y entorno de prueba; no hay cliente nuevo operativo. No asumir que ambas plataformas se usan juntas ni enviar datos por tener credencial.
- Ciberseguridad: broker/PDP/delegaciones padre-hijo, identidad de servicio, configuración de tenant y assets sintéticos autorizados; revisión licencia SDK private/UNLICENSED. No escanear/remediar terceros.

## Decisiones arquitectónicas

C05 ya tiene aprobación del fundador: decisión founder-20261116-card-ontology-001; ocho familias, seis polos en tres pares y diez dimensiones independientes con unknown=null. Documento aprobado en 83ae5a0, SHA256 df014cf043a5d5ccfd6cef98ee7351ce6dba0713bd5f12cdc9c15ca94b697182. Se implementó registro versionado y pruebas; no está BLOCKED_DECISION por ontología. Quedan calibración, taxonomía empresarial por tenant, permisos de publicación/revisión y política de gobierno para futuras versiones; no se necesita reinterpretar la aprobación existente.

Debe fijarse la garantía de ACK por consumidor: recibo interno, recepción cliente o playback no son el mismo evento. Hasta entonces el servidor solo acredita persistencia interna. Retención/visibilidad/consentimiento externo y política de datos requieren configuración gobernada. Los modelos solo proponen clasificación; el kernel decide acciones y no hereda autoridad de confianza/scoring.

## Autorización antes de activar o desplegar

No merge a main, producción, activación con empresas reales, remediaciones externas ni migración destructiva. Requieren autorización posterior y resultado concreto revisable. Publicar ramas de este checkpoint sí está autorizado. No se ha solicitado permiso adicional para trabajo reversible local. C15 sigue NO_GO por gates incompletos, defectos P1 y falta de evidencia de integración real.

