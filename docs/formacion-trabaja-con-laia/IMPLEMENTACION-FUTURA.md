# Handoff de implementación futura (NO ejecutar en esta rama)

## Fases
1. **Baseline:** leer UI Formación existente, componentes de branding de landing, navegación real, Cognition V2 y kernel. Inventariar rutas activas; no asumir V1 definitivo.
2. **Catálogo editorial:** convertir 60 ejercicios en fixtures tipados con IDs estables; verificar que no se duplican y que cada caption y CTA existe.
3. **UX:** biblioteca, colecciones, reproductor, progreso, accesibilidad, móvil/escritorio. Reutilizar diseño real AgntiaPro.
4. **Conexiones:** decidir Composio tras revisión de cobertura, seguridad, términos, región y costes. OAuth backend, permisos mínimos, revocación, scopes personales/empresa y conexión reutilizable.
5. **Cognition V2:** registrar capacidades explícitas, contratos Zod por operación, SOP versionado y kernel fail-closed; cero herramientas directas para LLM.
6. **Primer vertical:** un ejercicio de solo lectura y uno de escritura con aprobación, recibo y reconciliación.
7. **Reels:** producir 3 pilotos, validar con usuarios, después lotes de 10. Publicar solo los que tengan experiencia honesta.
8. **Despliegue:** feature flag, dogfooding, telemetría mínima y rollout gradual; no deploy sin aprobación.

## Tests obligatorios
- Rechazo de capability inexistente, inputs extra, conexión ajena, tenant ajeno, cuenta revocada y usuario inactivo.
- LLM sin acceso a SDK/credenciales/HTTP libre.
- Aprobación vinculada al hash de la propuesta, acción, principal, conexión y versión SOP.
- Concurrencia e idempotencia de escrituras, timeout y resultado desconocido sin doble efecto.
- Progreso no se marca completado al ver vídeo ni solo al conectar OAuth.
- Reutilización de conexión en 10 ejercicios sin reconectar; revocación bloquea ejecución.
- UX responsive, subtítulos, teclado, fallback de vídeo y CTA según estado.

## Entrega futura
PR con inventario de archivos, wiring, pruebas ejecutadas, evidencias, limitaciones y rollback. Mantener docs y código separados; no hacer merge automático.
