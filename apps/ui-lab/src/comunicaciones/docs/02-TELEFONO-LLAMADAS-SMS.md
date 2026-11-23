# Pantalla 02 · Teléfono, llamadas y SMS · V1

## Propósito
Experiencia familiar de teléfono Android combinada con supervisión de llamadas agénticas. Inspiración conceptual de Vapi y ElevenLabs Agents, sin copiar sus componentes ni depender de sus APIs.

## Secciones funcionales
1. **Llamadas**: lista de llamadas sintéticas con contacto, empresa, agente, duración, fecha y estado. Selección abre detalle, transcripción y contexto.
2. **Detalle de llamada**: cabecera, visualización de onda estática, botón explícito de vista previa visual (sin reproducción real), transcripción con hablantes.
3. **Supervisión**: resumen de la llamada, siguiente acción, mejora propuesta de memoria, validación/descarte de la mejora y aprobación de la revisión. Cambios solo en estado local.
4. **SMS**: selección de conversación, mensajes de cliente/LAIA/humano y composición local. El botón añade un SMS simulado; no lo envía.
5. **Contactos**: agenda de empresas ficticias; elegir contacto rellena el marcador.
6. **Teclado**: dígitos, edición del número, inicio y finalización de una llamada simulada, controles de silencio y altavoz sin hardware.
7. **Políticas de voz**: tres interruptores de ejemplo sobre autorización, aprobación y transferencia humana. No ejecutan políticas reales.

## Dataset
- Taller Bruma / Elena Martín: consulta de reservas; propuesta y mejora por volumen de llamadas.
- Estudio Caliza / Clara Ruiz: demostración de gestión de proyectos.
- Mercado Ladera / David Pérez: solicitud de intervención humana.
- Costa Nido / Lucía Herrera: consulta de trámite administrativo.
- SMS sintéticos relacionados con Taller Bruma y Estudio Caliza.
- LAIA figura como agente de voz; el conocimiento y las decisiones de ejecución corresponderán al runtime determinista, no a un prompt gigante.

## Experiencia móvil
Navegación horizontal compacta de cinco secciones; lista → detalle con retorno; detalle, transcripción e inspector en flujo vertical. No se fuerza una composición de tres columnas en pantallas pequeñas.

## Diseño de integración posterior
Eventos de llamada append-only (call.started, call.ended, transcript.segment, review.requested, review.approved), correlationId, tenantId, callId, idempotency keys y estados de autorización. Audio y transcripción como artefactos separados con políticas de acceso y retención. Propuesta de memoria → revisión humana → versión y auditoría → publicación controlada. SOPs de voz con fail-closed y consentimiento previo.

## Seguridad
No iniciar llamadas ni enviar SMS desde la demo. En producción verificar consentimiento, obligaciones de grabación, roles, separación por tenant, políticas de retención y autorizaciones por capacidad. Evitar guardar secretos o números reales en fixtures.

## Pendiente V2
Audio real con controles, timeline sincronizada con transcripción, escucha en directo, transferencia/handoff humano, análisis de calidad, tests e2e móvil, persistencia, conectores de telefonía, eventos reales y aprobación de memorias.
