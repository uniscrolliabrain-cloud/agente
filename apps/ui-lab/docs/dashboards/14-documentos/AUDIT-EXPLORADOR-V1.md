# Auditoría UX independiente V1
Alcance: mockup interactivo, sin alineación transversal ni backend. Revisión estática de model.ts, useExplorer.ts, ExplorerParts.tsx, DocumentsExplorer.tsx y explorer.css. No se ejecutó navegador ni build. Nota cualitativa 5,8/10.

## Hallazgos y patchsets V2
| ID | Evidencia | Cambio | Aceptación |
|---|---|---|---|
| D01 | model.ts: seis documentos, ocho carpetas, cuerpo idéntico | Dataset sintético con actores humanos/IA explícitos, carpetas individuales, clientes, proyectos, SOPs y plantillas; contenido diferenciado por formato | Navegar por LAIA, Marcos, Antonio y humanos; documentos relacionados sin duplicar identidad |
| D02 | useExplorer.ts: children restringido a parent===location; visible restringido a carpeta directa | Búsqueda global explícita y búsqueda local opcional, resultados de carpetas descendientes con ruta | Buscar ACME desde inicio y desde su rama; limpiar devuelve vista anterior |
| D03 | DocumentsExplorer.tsx: view solo afecta dx-folders | FileGrid y FileList reales, selección común | Alternar mantiene selección y filtros |
| D04 | preview.body genérico | Lectores sintéticos PDF, texto/MD, hoja, presentación, imagen, vídeo/audio con estados de demo | Abrir/cerrar cada formato, contenido reconocible, sin afirmar reproducción inexistente |
| D05 | upload disabled en raíz; addFiles retorna sin location | Selector de destino, metadatos locales, confirmación | Añadir desde inicio y ver en destino |
| D06 | recent y home comparten visible; falta Mi espacio y Plantillas | Perspectivas diferenciadas, recientes limitados en inicio, navegación completa | Cada vista tiene título y contenido coherentes |
| D07 | count usa folder===id | Recuento descendiente y etiqueta clara | Clientes incluye ACME; recuentos cambian al mover |
| D08 | Sin selección múltiple ni acciones de carpeta | Selección explícita, barra contextual, mover/favoritos/papelera; renombrar carpetas con protección de raíz | Seleccionar varios, cancelar, mover y restaurar sin duplicados |
| D09 | filtros invisibles fuera del diálogo; navigate conserva filtros sin indicación | Chips removibles, contador y reset; decidir alcance al navegar | No hay vacíos inexplicables |
| D10 | dx-content anima solo montaje; modal sin focus trap | Transiciones por ruta, cascada breve, diálogo accesible con foco inicial y restaurado | Teclado completo, Escape, reduced motion |
| D11 | dx-row móvil y papelera usan grid implícito | Áreas de grid explícitas y controles táctiles 44px; barra compacta | 320/390/768/1440 sin overflow |
| D12 | Iconos genéricos y assets pendientes; ausencia de avatares | Integrar renders aprobados cuando estén disponibles; no sustituir por diseño definitivo plano | Comparación visual con mockup y referencias |
| D13 | addFolder admite duplicados y se permite desde papelera | Validar nombres, ámbito y destino; estados vacíos específicos | No crear desde papelera, no nombres vacíos/duplicados |
| D14 | Todos los autores salvo literal Empleado humano se clasifican IA | Actor tipado, no inferir por nombre | Marcos y Antonio IA; humanos correctamente identificados |

## Secuencia
1. Modelo demo y lógica de exploración D01/D02/D06/D07/D13/D14.
2. Componentes de interacción D03/D05/D08/D09.
3. Lectores y accesibilidad D04/D10/D11.
4. Assets y acabado D12, QA visual.
No modificar DocumentsView real, shell, chat transversal ni otros workspaces en esta fase. No desplegar.
