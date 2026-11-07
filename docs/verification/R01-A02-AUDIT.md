# Auditoría R01-A02 · Descubrimiento de tests

Estado: abierto (WIP). Criterio de descubrimiento verificado. Base local compartida: 0c8fe81ec8ece4dd35cbc9b12e3b1d1d168ce81f. R01-A01 usa el mismo commit. Rama: sprint/r01-a02-descubrimiento-tests. Ventana de trabajo: 15:31–16:01 (Madrid).

## Stepper

### 0–3 min · Arranque
- [x] Identificar R01-A02 y su gate: recuento antes/después y cero archivos ocultos.
- [x] Crear worktree hermano y rama de sprint desde la base local.
- [x] Registrar el plan antes de editar.
- [x] Revisar scripts de test, gate y CI, y detectar instrucciones locales.
- [x] Registrar versiones de Node y pnpm.

### 3–6 min · Medición de base
- [x] Inventariar los tests versionados por directorio.
- [x] Enumerar qué archivos selecciona cada patrón actual.
- [x] Comparar conjuntos y conservar ejemplos de archivos omitidos.

### 6–22 min · Cambio
- [x] Identificar el punto de entrada que debe cubrir subdirectorios.
- [x] Elegir una expansión portable en Windows y Linux.
- [x] Preservar el preload y las opciones de ejecución vigentes.
- [x] Limitar el cambio de producto a package.json.
- [x] Repetir la comparación y comprobar los cinco subdirectorios.

### 22–26 min · Validación
- [x] Instalar con lockfile congelado.
- [ ] Ejecutar el script real y distinguir descubrimiento de resultado de tests.
- [x] Ejecutar pnpm secrets:check (exit 0).
- [ ] Registrar el resultado de pnpm typecheck.
- [x] Verificar la superficie del cambio de producto y git diff --check.

### 26–30 min · Entrega
- [x] Registrar recuentos, comandos, códigos de salida y pendientes.
- [x] Preparar entrega local WIP en la rama del agente.


## Bitácora

- Node v24.18.1, pnpm 11.19.0. CI llama a pnpm test. El gate y test ya declaran patrón recursivo. test:hanging declara patrón de primer nivel.

- Base: 119 archivos de tests versionados. El patrón de test:hanging selecciona 85 y omite 34: campaign-2 (13), campaign-3 (7), gate (3), load (1), roadmap (10). Cambio: reutilizar en test:hanging el glob recursivo entre comillas que ya utiliza test, conservando el preload y el timeout.

- Comparación del conjunto de git ls-files con node:fs globSync: el patrón recursivo coincide exactamente con los 119 archivos. Instalación congelada en curso.
- Prueba de regresión con node --test --test-isolation=none --test-reporter=tap y 119 archivos temporales (un test mínimo identificado por su ruta en cada uno). Se extrajeron los patrones del package.json base y del actual. Base: exit 0, 85/119, 34 ausentes. Cambio: exit 0, 119/119, 0 ausentes, 0 sobrantes. Los códigos 0 corresponden a la prueba de descubrimiento, no a la suite de aplicación.
- pnpm install --frozen-lockfile: exit 0, 552 paquetes, 15 min 22 s según pnpm. El verificador de secretos ejecutado directamente con Node en modo sample también devolvió exit 0.

## Entrega de sprint

- Superficie: package.json (una línea) y esta auditoría. El comentario de revisión presente en el worktree se conserva fuera de la entrega.
- Gate de descubrimiento: 85 → 119 archivos, 34 → 0 omitidos, 0 sobrantes. La prueba aislada del runner fue satisfactoria en Node 24 para el conjunto recursivo. CI declara Node 22.
- Comprobaciones con exit 0: instalación congelada, secrets:check y git diff --check.
- Pendientes al cierre: pnpm typecheck y pnpm test:hanging. El recuento del fixture no acredita el resultado funcional de la suite.
- Entrega local WIP. El clon carece de remoto para abrir la PR. Petición al portero: ninguna.
