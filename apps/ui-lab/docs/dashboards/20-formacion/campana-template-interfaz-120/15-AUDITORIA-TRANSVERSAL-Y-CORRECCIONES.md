# 15 · Auditoría transversal de documentación y mejoras aplicadas

**Fecha:** 2026-11-23. **Alcance:** documentación de Formación, no render ni auditoría del código implementado. **Resultado:** APTO COMO BASE DOCUMENTAL CON CORRECCIONES; NO APTO PARA CERTIFICAR CALIDAD VISUAL. No se han ejecutado pruebas de interfaz.

## Fuentes contrastadas
- `01-landing/legacy/design-system-agntiapro/{02-identidad-tokens,03-componentes-patrones,04-interaccion-motion,06-calidad-gobernanza,07-prompt-agentes}.md`.
- Auditorías `19-general/superficies-transversales/AUDITORIA-ESTUDIO-DEMO-VS-LANDING-2026-11-23.md` y `19-general/galeria-branding/AUDITORIA-BRANDING-UX-Y-MOTION-2026-11-23.md`.
- `20-formacion/PROMPT-MAESTRA-FORMACION-V3-SPOTIFY.md`, `DESIGN-ALGORITMO-DISCOVERY-LEARNING-V2.md`.
- Campaña de Formación: README y documentos 01–14, con atención especial a 02, 03, 05, 10–14.
- Mockup Formación compartido en conversación: escena de vídeo, ficha inferior con handle, tabs, lista de episodios, mini-player. Captura de Estudio de Operaciones con videollamada en hoja transversal. **Las imágenes no se han inspeccionado como archivos binarios de GitHub en esta auditoría**; la referencia es el material visual compartido por el founder.

## Hallazgos, gravedad y corrección

| ID | Severidad | Hallazgo | Corrección |
|---|---|---|---|
| A01 | Alta | `03` secuencia C00–C09 empieza Home antes de player/sheet; `13` propone vertical slice primero | Tabla de equivalencia abajo; priorizar escena + sheet antes del catálogo completo |
| A02 | Alta | `02` define `FormationBottomSheet` como «cola/opciones» con estados open/closed, insuficiente frente a mockup | Actualizar responsabilidad a ficha de serie/episodios y snaps peek/half/full; cola es otra superficie |
| A03 | Alta | `MobileChatSheet` comunicado por otro agente, pero 404 en main en consulta previa | Registrar procedencia como NO VERIFICADA EN MAIN, localizar rama/commit antes de clonar; no atribuirlo a `SidebarChat` |
| A04 | Media-alta | Paleta V3 aproximada distinta a guía Landing | Código activo + tokens vigentes prevalecen; los hex de manual son referencia documental, no CSS obligatorio |
| A05 | Media | «Cinematográfico» sin storyboard de estados fallidos | Añadir pruebas de interrupción, scroll, teclado, cierre y retorno de foco |
| A06 | Media | `05` no separa visual, interacción y accesibilidad del sheet | Añadir gates UX16–UX20 y evidencia por viewport |
| A07 | Media | Los 120 registros no equivalen a medios producidos | Mantener estados missing/draft sin play ficticio ni duración inventada |
| A08 | Media | Retención puede entenderse como prohibición de sesiones largas | Respetar modo voluntario Trabajo/Aprender/Explorar; sesiones largas de estudio permitidas, sin inferir horario |
| A09 | Media | Riesgo de replicar densidad Studio y confundir identidad con layout | Prohibir inspector/timeline copiados; usar escena abierta, controles progresivos y estanterías editoriales |
| A10 | Baja | Nomenclatura «curso/serie/episodio» ambigua | Adaptador UI explicita relaciones; no inventar series, IDs ni orden |

## Correspondencia de campañas (una sola ejecución)
| Etapa de `13` | Fases de `03` | Entregable primero |
|---|---|---|
| Campaña 0 Reconocimiento | C00 | referencias activas, rutas y panel recuperado o bloqueo documentado |
| Campaña 1 Fundamentos | C01 + esquema mínimo C02 | tokens/estados + 1 curso canónico |
| Campaña 2 Escena + sheet | **C03 parcial + C08 sheet adelantado + C05 parcial** | vertical slice móvil/desktop antes de Home completo |
| Campaña 3 Home/biblioteca | C02 completo + C03 + C04 + C07 demo | 120 registros y navegación |
| Campaña 4 Player | C05 + C06 | continuidad y CTA honesto |
| Campaña 5 Motion | C08 restante | storyboard y reduced motion |
| Campaña 6 QA | C09 | tests, screenshots y aprobación |

**Precedencia:** para el orden de ejecución prevalece esta tabla; `03` mantiene el inventario de tareas. No ejecutar dos campañas independientes para la misma pieza.

## Contrato de composición que debe verse en pantalla
1. **Móvil inicial:** shell real, escena de vídeo/portada protagonista y borde superior del sheet visible; un único foco editorial.
2. **Peek:** tirador + título + una acción clara. Evitar 6 iconos y metadatos apretados.
3. **Half:** resumen breve + tabs + primeras filas de episodios; el contenido no parece modal administrativo.
4. **Full:** episodios/recursos/transcripción con scroll interior; no secuestrar el gesto del navegador ni tapar chat.
5. **Desktop:** hero y ficha en layout abierto con espacios generosos; no «tres columnas de Studio».
6. **Mini-player:** solo cuando exista media válida; si no, estado «vídeo en preparación» sin fingir reproducción.

## Gate de prueba adicional
- UX16: vídeo/portada y sheet muestran jerarquía clara en 360 y 390px.
- UX17: arrastre peek→half→full→half→peek y cierre con teclado; scroll de episodios no arrastra el sheet.
- UX18: safe area, teclado abierto, cambio de orientación, z-index con FAB chat y navegación.
- UX19: sin pérdida de selección/foco ni reinicio de medio al cambiar snap/tab; reduced-motion.
- UX20: comparativa de **tres fuentes distintas**: Landing para dirección editorial, Studio para controles operativos, mockup Formación para composición. No mezclar roles.

## Riesgos aún abiertos
- No está verificado en `main` el archivo `MobileChatSheet.tsx` comunicado por otro agente. Recuperación desde rama/commit pendiente.
- No se han inspeccionado los JPG originales de Formación en el repositorio ni capturado la pantalla Formación renderizada.
- Los tokens deben confirmarse con CSS activo en la fase C00.
- El contenido audiovisual publicado, licencias y player real no están demostrados.

## Decisión
La documentación es una base útil para ejecutar, **pero no es aún un resultado visual aprobado**. La siguiente tarea de código es recuperar el panel, construir vertical slice escena+sheet en UI Lab y auditarlo frente a las tres referencias antes de ampliar a 120 registros.
