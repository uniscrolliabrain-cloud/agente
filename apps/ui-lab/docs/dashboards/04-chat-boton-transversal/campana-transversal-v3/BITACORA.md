# Bitácora · Chat transversal V3

## 2026-11-24 · Arranque

- Se lee el material preparado: `00-CAMPAÑA-MAESTRA.md`, `01-CONTRATO-VISUAL.md`, `assets/README.md`, los diez componentes de `baseline/`, `DesktopChatDock.tsx` de `legacy/`, el CSS del shell y del dock en `release/landing-legal-20261122` (`91576dc…`) y el cableado de `componentes-reales/`.
- Huecos: no existe `baseline/wiring/`; el dock de escritorio y su CSS no estaban en `baseline/`; `assets/` no contiene el PNG de LAIA.

## Decisiones

1. **Puerta literal de los gestos**: `widths()`, `visiblePx()`, `minVisible()` y `nearestSnap()` se copian del baseline, no se reescriben. El estado del gesto se escribe en el DOM, nunca con `setState`.
2. **Adaptador demo** en lugar de dependencias de backend (`uploadFile`, tipos, typewriter): respuestas, ideas y actas sintéticas.
3. **Fotografía**: al no haber PNG en `assets/`, se usa provisionalmente `public/landing/laia.png`. A mitad de campaña llega el PNG del founder (`file_00000000bad881f4a18a32b6c6edc2c8.png`, `0aa55fbe…`): misma modelo, **otra fotografía oficial** (traje, cartel «AgntiaPro LAIA»). Se regenera el WebP desde ese archivo (`e5ca0db0…`, 68,2 kB), se conserva el original con su nombre numérico y se elimina la copia provisional. No se inventó ninguna persona.
4. **Un solo estado de hilo** en la raíz para que texto, voz, vídeo y acta compartan conversación y borrador.
5. **Encaje con UI Lab**: `.lab-embed:has(.ctv)` y `body:has(.ctv)` para que la insignia de 26 px no saque la hoja del viewport. Mismo patrón que el launcher ya aprobado.

## Ejecución

- Módulo completo en `apps/ui-lab/src/chat-transversal-v3/` y registro `chat-transversal-v3`.
- Typecheck 0 y build 0. Build del artifact: `eb65167917e8` (el paquete empaqueta ese código; los commits posteriores son solo documentación).
- QA real: 47 comprobaciones en navegador cloud (escritorio 1440/1366/1280/1024; móvil y tablet 768/390/360/320; gestos, teclado, acciones, llamadas, acta, reduced motion, consola).
- Corrección tras la primera pasada: el workspace medía 375 px a 390 de viewport y la página scrolleaba 26 px por la insignia del laboratorio; se corrigió con el encaje `:has()` y se repitió la matriz completa.
- Refinamiento de la escena de voz: anillos más contenidos (escala 1,55), capas y composición centrada para que el texto no se cruce con los anillos.

## Sincronización con el trabajo paralelo

- `785d5d1d`…`7bc2b79d` publican `baseline/wiring/` (App, AppShell, SidebarV2) y `3ae7f612` añade `baseline/DesktopChatDock.tsx`: se rebasa sobre ello, se verifica que el dock es idéntico a `legacy/` y que el cableado coincide con lo implementado (`data-chat`, una columna para rail + chat).
- `c9364fc4` sube el PNG de LAIA. Se rebasa y se sustituye el retrato provisional por el definitivo.

## Límites aceptados y declarados

- Cámara con permiso concedido, dictado y micrófono no verificables en el navegador cloud.
- El artifact de GitHub Actions no se ejecuta aquí; el ZIP se genera y valida en local con el mismo script.
- La aprobación estética es del founder.
