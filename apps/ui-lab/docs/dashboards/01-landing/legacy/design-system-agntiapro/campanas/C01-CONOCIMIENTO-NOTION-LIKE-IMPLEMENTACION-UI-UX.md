# CAMPAÑA ÚNICA C01 — Transformación UI/UX de Conocimiento (Notion-like)
**Estado:** especificación aprobada para ejecución futura; este commit solo añade documentación. **Fecha:** 2026-11-22.
**Base de trabajo documental:** `docs/design-system-agntiapro-master-20261122`.
**Referencias obligatorias:** `docs/design-system-agntiapro/README.md`, `02-identidad-tokens.md`, `03-componentes-patrones.md`, `04-interaccion-motion.md`, `05-workspaces-runtime.md` (este último es solo composición visual pese a su nombre histórico) y `propuestas/01-conocimiento-notion-like-ui-ux.md`.
**Regla innegociable:** únicamente frontend visual y UX. Preservar llamadas API, comportamiento de guardar/borrar, contratos, autenticación, tenancy, chat global y rutas. No implementar conectores Notion, Supabase ni bases de datos. No desplegar ni fusionar sin aprobación.

## Resultado esperado
Pantalla «Conocimiento» como biblioteca documental elegante: lista compacta, búsqueda y filtros discretos por actor/proyecto/sector/tipo, apertura de documento en un canvas editorial, edición manual con la funcionalidad ya disponible, y chat global sin solapamiento. En PC: árbol de navegación visual + zona central amplia + panel opcional. En móvil: cabecera compacta, lista de páginas y filtros en sheet. **La nueva UI no debe afirmar que existan relaciones o metadatos no disponibles en el contrato actual**: utilizar valores reales cuando estén disponibles, ocultar o mostrar estado «Sin asignar» cuando falten; no inventar actores/proyectos/sectores.

## Diagnóstico técnico verificado
`apps/web/src/components/MemoryView.tsx` recibe `memories: MemoryEntry[]`; usa `query`, `category`, `editing`, `editText`, `editCategory`, `editTags`, `busy`, `error`. Filtra `m.text`, `m.tags`, `m.source`. Guarda con POST `/api/agent/memories/:id` y olvida con POST `/api/agent/memories/:id/forget`. Categorías actuales: empresa, cliente, proceso, preferencia, rrhh, producto, otro. JSX: `v2-tasks-view` con `maxWidth:820`, `v2-tasks-header`, `v2-composer`, `v2-pill`, `v2-tag`, cards inline y modal de edición. **No eliminar endpoints ni cambiar payload**. `apps/web/src/workspaces/32-notion/index.ts` declara `status: scaffold`; NO asumir que ya es la UI ni cablearla por defecto. `apps/web/src/design-system/agntia-tokens.css` tiene colores canónicos bajo `.agntia-workspace`. `apps/web/src/index.css` contiene CSS legacy y variables distintas. `apps/web/package.json` tiene React 18, lucide-react y Vite; no se necesita librería adicional para esta campaña.

## Organización de entrega del agente
Rama de implementación sugerida `feat/ui-conocimiento-notion-like-c01` desde la rama efectiva más reciente que contenga la pantalla actual; **antes de crearla comparar con main y la rama documental**. Una sola campaña, 9 fases secuenciales, con commits verificables por fase. Reportes en `docs/implementation-reports/ui-conocimiento-c01/` (solo cuando se ejecute). No editar documentación de otras campañas.

### FASE 0 — Preflight, inventario y snapshots
1. `git status --short; git branch --show-current; git rev-parse HEAD; git merge-base main HEAD`.
2. Comparar `MemoryView.tsx` en main y rama de documentación; comprobar dónde se importa en `App.tsx` y qué shell/chat global lo rodea. Inspeccionar tipo real `MemoryEntry` y `useWorkspaceData`.
3. Localizar selectores `v2-tasks-*`, `v2-composer`, `v2-pill`, `v2-tag` en `index.css` y sus otros consumidores antes de tocarlos.
4. Registrar screenshots de la pantalla actual en móvil 360/390/430 y desktop 1024/1440/1920 con chat cerrado/abierto; verificar si es posible con Playwright existente. Si no hay runner, documentar bloqueo sin inventar resultados.
5. Guardar reporte `00-preflight.md` con paths, import graph, screenshots y riesgos.
**Gate:** no continuar si la rama elegida no contiene la pantalla que se pretende transformar.

### FASE 1 — Aislamiento de estilos y tokens
**Patchset P01** (crear/editar solo según preflight):
- Crear `apps/web/src/components/knowledge/knowledge.css` con clases namespaced `.ag-knowledge-*`.
- En `MemoryView.tsx`, importar `../design-system/agntia-tokens.css` y `./knowledge/knowledge.css`; envolver root en `className="agntia-workspace ag-knowledge"`. **Comprobar previamente que anidar `.agntia-workspace` no altera shell y que la hoja de tokens no se importa ya globalmente.**
- No modificar `:root`, `.v2-*` globales ni `landing.css`.
CSS de arranque:
```css
.ag-knowledge {
  --kn-bg: var(--ag-paper, #fcfaf6);
  --kn-surface: var(--ag-surface, #fff);
  --kn-ink: var(--ag-ink, #242421);
  --kn-muted: var(--ag-muted, #6e6c66);
  --kn-line: var(--ag-line, #e6e1d8);
  --kn-accent: var(--ag-violet, #6550dd);
  min-width: 0;
  min-height: 100%;
  background: var(--kn-bg);
  color: var(--kn-ink);
  font-family: Manrope, system-ui, sans-serif;
}
.ag-knowledge * { box-sizing: border-box; }
.ag-knowledge :is(button, input, textarea, select):focus-visible {
  outline: 2px solid var(--kn-accent);
  outline-offset: 3px;
}
```
**Gate:** ningún cambio visual en otros workspaces; CSS completamente scoped.

### FASE 2 — Separar vista y componentes presentacionales
**Patchset P02** — crear carpeta `apps/web/src/components/knowledge/` con:
- `KnowledgeHeader.tsx`: título, contador secundario, breadcrumbs visuales opcionales, botón contextual.
- `KnowledgeToolbar.tsx`: búsqueda expandible, filtros y selector visual de presentación.
- `KnowledgeList.tsx`: lista de documentos/entradas, con estados empty/loading/error disponibles.
- `KnowledgeRow.tsx`: icono, título derivado del contenido, extracto, metadatos reales, acciones discretas.
- `KnowledgeFiltersSheet.tsx`: sheet accesible para filtros en móvil.
- `KnowledgeDocument.tsx`: lectura/editor de una entrada, con tipografía editorial.
- `KnowledgeLayout.tsx`: layout responsive; navegación lateral opcional.
- `knowledge.types.ts`: tipos **solo de presentación**, sin modificar `MemoryEntry`.
- `knowledge.utils.ts`: título/extracto derivado del texto y formateo de fecha con tests.
**Nota:** estos nombres son propuesta de paths; ajustar a patrones del repo y documentar cambios.

Esqueleto de tipos:
```ts
export type KnowledgePresentation = "list" | "table" | "gallery";
export type KnowledgeScope = "all" | "actor" | "project" | "sector" | "type";
export interface KnowledgeRowVM {
  id: string;
  title: string;
  excerpt: string;
  category?: string | null;
  tags: string[];
  source?: string | null;
  createdAt?: string | null;
  actorLabel?: string | null;
  projectLabel?: string | null;
  sectorLabel?: string | null;
}
```
No asignar actor/proyecto/sector a partir de `source` o tags por heurística: solo mostrar cuando el contrato aporte campos explícitos; si no, filtros deshabilitados con texto «Disponible cuando haya datos» o vacíos, sin datos ficticios.

### FASE 3 — Biblioteca móvil compacta
**Patchset P03** — reemplazar presentación de cards por filas, manteniendo `items` y filtros existentes. Cabecera compacta; búsqueda de una línea; categoría en filtro desplegable; grupos solo cuando existen datos verificables. El primer viewport debe mostrar al menos una fila o estado vacío, sin tres líneas de chips.
JSX orientativo:
```tsx
<section className="ag-knowledge-library" aria-label="Biblioteca de conocimiento">
  <KnowledgeHeader count={items.length} total={memories.length} />
  <KnowledgeToolbar query={query} onQueryChange={setQuery} /* resto de props tipadas */ />
  <KnowledgeList items={viewModels} onOpen={setSelectedId} onEdit={openEdit} onDelete={forget} />
</section>
```
No copiar literalmente: adaptar firmas a props reales. Estilo orientativo:
```css
.ag-knowledge-row {
  display: grid;
  grid-template-columns: 22px minmax(0,1fr) auto;
  align-items: start;
  gap: 12px;
  padding: 13px 12px;
  border-bottom: 1px solid var(--kn-line);
  background: transparent;
}
.ag-knowledge-row__title { font-size: 14px; font-weight: 650; line-height: 1.4; }
.ag-knowledge-row__excerpt {
  color: var(--kn-muted); font-size: 12px; line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
}
```
**Gate:** contenido visible, acciones accesibles, sin FAB tapando filas.

### FASE 4 — Documento editorial y edición manual
**Patchset P04** — al seleccionar entrada, presentar canvas de documento dentro del workspace. Titular Fraunces, cuerpo Manrope, metadatos secundarios y editor limpio. Reutilizar exactamente estado `editing` y funciones `saveEdit`/`forget`; no sustituir el guardado por estado ficticio. El editor puede seguir usando textarea si no hay editor rich-text ya presente; **no introducir TipTap/Lexical ni persistir bloques ricos sin contrato**. Evitar pérdida de texto al cerrar y avisar de cambios no guardados.
CSS orientativo:
```css
.ag-knowledge-document {
  width: min(100%, 820px); margin-inline: auto;
  padding: clamp(20px, 3vw, 48px);
}
.ag-knowledge-document__title {
  font-family: Fraunces, Georgia, serif;
  font-size: clamp(28px, 3vw, 40px);
  line-height: 1.16; font-weight: 400;
}
.ag-knowledge-document__body { font-size: 15px; line-height: 1.7; }
```
**Gate:** editar y guardar siguen llamando al mismo endpoint y muestran error real; no inventar guardado automático.

### FASE 5 — Desktop, sidebar y densidades
**Patchset P05** — layout 3 zonas *opcionales*; no crear panel vacío para llenar espacio. Sidebar 220–260px, canvas flexible, inspector opcional 280–340px. Colapsar a <=1024 según medición, sin hacer la página ilegible. List/table/gallery: solo vistas visuales soportadas por los mismos datos; no anunciar capacidades nuevas. En tabla: cabeceras accesibles, overflow local. En galería: tarjetas compactas, no grandes bloques de texto.
CSS orientativo:
```css
.ag-knowledge-layout { display: grid; grid-template-columns: 240px minmax(0,1fr); min-width: 0; }
.ag-knowledge-layout__main { min-width: 0; padding: 24px clamp(16px,3vw,40px); }
@media (max-width: 1024px) {
  .ag-knowledge-layout { grid-template-columns: minmax(0,1fr); }
  .ag-knowledge-layout__sidebar { display: none; }
}
@media (max-width: 640px) {
  .ag-knowledge-layout__main { padding: 16px; }
}
```
**Gate:** screenshots 1024/1440/1920 sin huecos vacíos arbitrarios, texto de documento con ancho de lectura controlado.

### FASE 6 — Filtros actor/proyecto/sector y sheet
**Patchset P06** — UI de filtros con selección de actor/proyecto/sector/tipo, únicamente si hay metadatos reales disponibles. Inspeccionar `MemoryEntry` y fuentes antes de construir. Si faltan: mostrar chips no operativos claramente etiquetados o posponer su activación; no mapear `source: Chat` a actor humano/IA sin evidencia. El filtro `category` existente debe seguir funcionando. Sheet móvil con encabezado, cierre, focus trap o diálogo nativo, scroll interno, safe areas y botones táctiles 44px.
**Gate:** filtro existente intacto, ausencia de metadatos representada honestamente.

### FASE 7 — Integración visual con shell y chat existente
**Patchset P07** — auditar dónde se dibuja el FAB/chat en `App.tsx` y componentes de shell. No crear segunda instancia ni modificar su lógica. Ajustar padding inferior, stacking y posición con CSS scoped si es posible. En móvil probar chat abierto, cerrado, teclado virtual, rotación, zoom de texto. Si el bug pertenece al shell global, documentar un patch separado de alcance mínimo y pedir revisión antes de tocar otros workspaces.
**Gate:** el chat no tapa editar, borrar, lista, toolbar ni botón de guardar.

### FASE 8 — Validación, accesibilidad y entrega
**Patchset P08** — pruebas y reporte. Comandos (desde raíz, confirmar scripts antes):
```bash
pnpm --filter @agente/web typecheck
pnpm --filter @agente/web build
git diff --check
```
Ejecutar además test runner existente pertinente y pruebas manuales/Playwright si disponibles. Matriz: 360/390/430/640/768/1024/1440/1920, portrait/landscape, teclado virtual, chat abierto/cerrado, filtros, búsqueda, documento, editar/guardar, borrar con confirmación, estados vacío/error, foco, Escape, reduced motion, zoom 200%. Testear que API endpoints y payload no han cambiado. Capturas antes/después y revisión estética comparando landing premium. Reportar resultados verificados, no suponer éxito.

## Secuencia de commits sugerida
```
docs(ui): preflight knowledge C01
style(knowledge): isolate premium tokens
refactor(knowledge): extract presentational components
feat(ui): compact mobile knowledge library
feat(ui): editorial document canvas
feat(ui): responsive desktop knowledge layout
feat(ui): scoped filters and mobile sheet
fix(ui): chat overlap and safe areas
test(ui): knowledge responsive accessibility review
```

## Patch map — tocar/no tocar
| Archivo | Operación | Límite |
|---|---|---|
| `apps/web/src/components/MemoryView.tsx` | refactor visual | conservar API, estado y callbacks |
| `apps/web/src/components/knowledge/*.tsx` | crear | solo presentación |
| `apps/web/src/components/knowledge/knowledge.css` | crear | CSS scoped |
| `apps/web/src/design-system/agntia-tokens.css` | leer; alias solo si necesario | no cambiar tokens globales sin evidencia |
| `apps/web/src/index.css` | leer, idealmente no tocar | evitar regresiones |
| `apps/web/src/App.tsx` | inspeccionar; parche mínimo condicionado | no modificar navegación ni chat funcional |
| `apps/web/src/workspaces/32-notion/**` | solo inspeccionar | NO cablear scaffold |
| `apps/server/**`, `packages/**`, migraciones, Doppler | NO tocar | fuera de alcance |

## Handoff de agente — prompt ejecutable
> Implementa la campaña C01 íntegra, fase a fase, tomando como autoridad este documento y la mini-auditoría aprobada. Antes de modificar, audita la rama real y los componentes; registra preflight. Trabaja en rama de feature independiente, no en main. Implementa solo frontend visual y UX: biblioteca tipo Notion con branding AgntiaPro, documento editorial, móvil y desktop, sin cambiar endpoints ni backend. Preserva editar/borrar, no inventes actor/proyecto/sector ni conectores. Aplica patchsets P01–P08 secuencialmente con tests y reportes. Tras cada fase entrega resumen, archivos, commit, evidencias, riesgos y siguiente fase. Al final prepara PR y espera autorización expresa para merge/deploy.

## Criterios de rechazo
- Cambio de API, esquema, base de datos, proveedor o modelo de memoria.
- Pérdida de edición/borrado, filtros actuales o contenido.
- Datos inventados para actor/proyecto/sector.
- Reemplazo del chat global o doble FAB.
- Cambio global de CSS que altere otras pantallas.
- UI idéntica a Notion sin identidad AgntiaPro.
- Afirmar que Notion ya está integrado.
- Merge o despliegue sin aprobación.

## Definición de completado
Campaña implementada en rama feature, tests ejecutados, screenshots comparativos y reportes, PR listo para revisión. **No significa desplegada**. Toda fase bloqueada se documenta como pendiente, nunca se maquilla.
