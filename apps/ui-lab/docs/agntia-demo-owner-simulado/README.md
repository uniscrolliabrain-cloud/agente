# agntia-demo · Owner simulado y compilación empresarial

Plantilla maestra reutilizable para crear **owners demo** y simular la compilación de una empresa en AgntiaPro. El tenant de referencia es `agntia-demo`; las instancias de owner y empresa simuladas deben tener identificadores propios, sin confundirse con el tenant. **Esta carpeta define estructuras y taxonomías, no datos reales ni la historia de una empresa concreta.**

## Orden de uso

1. Duplicar la plantilla en una carpeta de escenario/owner, sin sobrescribir el modelo maestro.
2. Definir primero el perfil ontológico (qué entidades existen y cómo se relacionan).
3. Definir después el perfil operacional (qué procesos, acciones y ciclos de vida existen).
4. Construir escenarios de simulación y fixtures coherentes, manteniendo IDs y referencias entre workspaces.
5. Diseñar y cerrar libremente la UX/UI demo. **Solo después** realizar la auditoría ligera de código y documentar la integración futura, siguiendo `../AGENT-DEMO-WORKFLOW.md`.

## Archivos

- `TEMPLATE-OWNER-COMPILACION.md`: plantilla de las 18 taxonomías en cuatro capas.
- `TAXONOMIAS-TRANSVERSALES.md`: seis dimensiones comunes y sus relaciones.
- `TEMPLATE-ESCENARIO.md`: plantilla de situaciones y eventos simulados, separada del perfil.
- `CONTRATO-FIXTURES.md`: reglas de consistencia para datos ficticios y referencias compartidas.

## Principios

- Todas las identidades, cifras, contratos, documentos, movimientos, mensajes y eventos son **ficticios** y deben etiquetarse como demo.
- No utilizar secretos, cuentas, datos personales reales, pagos reales ni conexiones operativas.
- El perfil no impone pantallas ni limita la creatividad UX. El diseño visual no se supedita al backend existente.
- No inventar que una acción simulada fue ejecutada en producción.
- Mantener diferenciados: **tenant**, **owner**, **empresa**, **agente**, **usuario**, **escenario** y **evento**.
