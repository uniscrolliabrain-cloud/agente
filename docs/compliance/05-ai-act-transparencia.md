# Campaña 05 — AI Act: agentes, voz, avatar y contenido sintético

## Meta
Transparencia de LAIA y demás agentes, supervisión humana y evaluación por caso de uso. No etiquetar todo el producto como «alto riesgo» sin análisis.

## Fases
1. **Inventario de usos**: chat, automatización SOP, emails, llamadas, traducción, avatares Anam, clonación de voz, contenido sintético, RRHH, finanzas, ciberseguridad, leads y decisiones que afecten personas.
2. **Clasificación**: identificar rol proveedor/deployer según funcionalidad, obligaciones aplicables y calendario vigente del Reglamento (UE) 2024/1689; revisar prohibiciones, transparencia, alto riesgo y otras obligaciones por caso de uso. Especial atención a selección/evaluación de empleados y usos sensibles.
3. **Transparencia UI**: indicar claramente interacción con IA cuando aplique, en onboarding/chat/voz/videollamada/canales externos; la personalidad de LAIA no debe ocultar su naturaleza artificial.
4. **Medios sintéticos**: avisos contextuales de avatar, voz generada o clonada y contenido sintético cuando sea exigible; metadata o marcado legible por máquina cuando aplique al proveedor y al tipo de salida. Evaluar requisitos de consentimiento de voz y derechos de imagen.
5. **Gobernanza**: acciones de alto impacto con aprobación humana, registro de decisiones y override, trazabilidad del SOP, gestión de errores y límites de autonomía.
6. **Proveedores**: verificar contratos y documentación de Anam, ElevenLabs y modelos utilizados; no dar por certificado el sandbox o la operación real. Auditar `engine/voice-v2/coordinator.ts` y UX de consentimiento.
7. **Pruebas**: avisos presentes en canales pertinentes; prohibir ejecución sin aprobación en acciones sujetas a control; comprobar localización futura ES/EN/FR de avisos.

## Entregables
`inventario/CASOS-USO-IA.md`, `inventario/AVISOS-IA.md`, matriz de clasificación y obligaciones por uso, `reports/CAMPANA-05-REPORTE.md`.

## Aceptación
Cada caso de uso tiene clasificación razonada, evidencias y dueño; transparencia comprobada en canales operativos; asuntos jurídicos no resueltos marcados bloqueantes para producción.

## Especificación transversal obligatoria
Ejecutar conforme a [07 Mapa UX real](07-UX-LEGAL-MAPA-INTERFAZ.md) y [08 Copy y links](08-COPY-LEGAL-UX-Y-LINKS.md). La landing pública ya tiene footer y cinco páginas HTML preliminares en esta rama; no publicar borradores. Verificar rutas, hosting y las ramas de UI actuales antes de integrar la app.
