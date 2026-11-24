# CAMPAÑAS V4 · FORMACIÓN NIVEL 9/10
**24 noviembre 2026 · Plan operativo que SOBRESCRIBE la prioridad de la campaña anterior, sin borrar su historia.** Estado: por ejecutar. Objetivo: biblioteca audiovisual editorial premium de AgntiaPro, no academia genérica ni copia de Spotify.

## Precedencia
Founder y lema «Deja de aprender la IA y empieza a trabajar con LAIA» > landing y Estudio Demo reales > PROMPT-MAESTRA-FORMACION-V3-SPOTIFY.md > UX-FORMACION.md > METADATA-120-CURSOS.json y contratos > código actual. Preservar IDs y títulos canónicos; documentar divergencias antes de cambiarlos.

## Baseline verificable
120 registros, 12 imágenes WebP 1536×1024 incorporadas mediante PR #31; búsqueda, filtros, biblioteca local, bottom sheet y CSS de Formación. Typecheck y build PASS en Actions #45291068107; despliegue FAIL por duplicación `apps/ui-lab/apps/ui-lab` en Vercel. No existen vídeos reproducibles: nunca fingirlos. Aún no existe validación visual para afirmar 9/10.

## Invariantes y límites
Solo UI Lab/Formación y documentación, configuración de deploy aislada cuando proceda. No backend, producción principal, OAuth, API de pago ni secretos. No duplicar shell ni chat global. Fotos generadas reales, contenidos sintéticos claramente identificados. Accesibilidad teclado/foco/Escape, reduced-motion, targets ≥44px, contraste AA, responsive 360/390/768/1024/1440. No declarar deploy ni puntuación final sin evidencia.

## C00 — Auditoría y mapa
Leer archivos V3, UX, catálogo, metadata, tokens, landing, Studio Demo y 12 imágenes. Crear AUDITORIA-V4-BASELINE.md y BITACORA-V4.md; inventario de componentes, enlaces y discrepancias. Gate: 120 IDs, 12 assets, contratos reconciliados.

## C01 — Arte editorial
Crear `apps/ui-lab/src/formation/artwork.ts`; mapear imagen a tema/colección, no por reparto ciego. Curar encuadre, overlay y proporciones hero 3:2, colección 4:3, episodio 16:9. Ajustar FormationWorkspace.tsx y formation.css. Reservar espacio, lazy loading, alt semántico donde proceda, evitar 404. Gate: 12 imágenes útiles y sin distorsión.

## C02 — Biblioteca y descubrimiento
Extraer componentes `FormationHero`, `CollectionShelf`, `CourseCard`, `CollectionDetail`, `LocalLibraryNav` a `apps/ui-lab/src/formation/components/`. Inicio, Buscar, Tu biblioteca, Colecciones; estanterías y variedad editorial, sin duplicar navegación global. Conservar filtros y búsqueda en 120 cursos. Gate: navegación y vacíos coherentes.

## C03 — Ficha y continuidad
Extraer `CourseDetailSheet`, `PlayerPlaceholder`, `UpNextQueue`, `PracticePreview`. Bottom sheet con gestos y foco restaurado. Si vídeo no existe: «Vídeo en preparación» sin play ficticio. Continuidad solo demo etiquetada. Gate: teclado, Escape, gestos, foco, scroll y enlaces correctos.

## C04 — Datos sintéticos
Separar `synthetic-demo.ts` de `catalog.ts`. Añadir objetivos, casos de pymes, series y recomendaciones justificadas por documentación; conservar IDs/títulos, duración objetivo y estado no producido. Nada de conectar servicios o simular ejecución real. Gate: 120 IDs únicos, sugerencias válidas y copy sin promesas falsas.

## C05 — Motion cinematográfico
Coreografía hero→estanterías, aparición progresiva, tarjeta→ficha, salida; curvas suaves y desplazamientos pequeños. Sin parallax invasivo, sin librerías pesadas. Reducir movimiento si el usuario lo pide. Gate: sin saltos de layout ni degradación de accesibilidad.

## C06 — Responsive y accesibilidad
Probar 360/390/768/1024/1440, zoom 200%, teclado, lector de pantalla, contraste, touch targets, safe-area y carruseles. Guardar capturas y resultados. Gate: cero bloqueantes.

## C07 — QA y deploy aislado
Ejecutar `pnpm --filter @agente/ui-lab typecheck` y `pnpm --filter @agente/ui-lab build`. Corregir Vercel Root Directory/working-directory duplicado sin tocar producción principal. Confirmar imágenes en dist, URL de preview, /version.json y HTTP assets. Gate: build y deploy PASS; si no, documentar bloqueo.

## C08 — Auditoría de aceptación
Crear AUDITORIA-V4-RESULTADOS.md y cerrar BITACORA-V4.md con commits, capturas, pruebas, rollback y deudas. Rúbrica 100: branding 15, composición 15, arte 10, motion 15, biblioteca 15, ficha 10, responsive/a11y 15, veracidad 5. **≥90/100** y ningún bloqueo es condición para declarar 9/10; no se autoconcede nota.

## Orden y reporte
C00→C01→C02→C03→C04→C05→C06→C07→C08. Cada campaña: archivos, commit en main, pruebas, resultado y siguiente gate. Si falla, reparar antes de avanzar. Esta V4 reemplaza el plan de ejecución antiguo; la documentación histórica se conserva.
