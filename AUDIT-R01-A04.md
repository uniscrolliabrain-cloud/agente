# Auditoría de sprint R01-A04

Base: 0c8fe81. Objetivo: CI bloqueante para worker y caché de pnpm.

## Stepper

### 1. Preparar el carril (00–04)
- [x] Localizar el plan de campaña.
- [x] Identificar la fila R1 A04 y su criterio de cierre.
- [x] Reservar worktree y rama propios.
- [x] Confirmar checkout y estado de partida.
- [x] Identificar instrucciones del repositorio.

### 2. Inspeccionar CI (04–09)
- [x] Enumerar jobs, pasos y dependencias del workflow.
- [x] Localizar la tolerancia de fallo del worker.
- [x] Identificar dónde se instala y usa pnpm.
- [x] Localizar el lockfile y comprobar el orden de las acciones.
- [x] Identificar el método de validación disponible.

### 3. Aplicar cambios (09–16)
- [x] Retirar la tolerancia de fallo en el ámbito exacto.
- [x] Activar caché del store de pnpm con el lockfile raíz.
- [x] Verificar que pnpm está en PATH antes de resolver el store.
- [x] Conservar el comando y las condiciones de ejecución del worker.
- [x] Revisar el diff de CI.

### 4. Verificar (16–25)
- [x] Validar sintaxis y semántica del workflow.
- [x] Comprobar el código de salida del paso en Bash y revisar la propagación según la configuración de GitHub Actions.
- [ ] Observar el fallo del job y una restauración de caché en un runner de GitHub.
- [x] Comprobar la configuración de caché en cada job que instala.
- [x] Ejecutar git diff --check.
- [x] Registrar resultados y límites de la verificación.

### 5. Cerrar (25–30)
- [x] Clasificar el sprint según la evidencia.
- [x] Registrar comandos, archivos y SHA base.
- [x] Preparar la entrega WIP para revisión.
- [x] Comprobar disponibilidad de remoto para PR.

## Resultado del sprint

**Estado: abierto para verificación remota.** El cambio y las comprobaciones locales están completos. El repositorio carece de remoto configurado; quedan pendientes la ejecución de GitHub Actions y el PR.

- Rama: sprint/r01-a04-ci-bloqueante. Base: 0c8fe81.
- Superficie: .github/workflows/ci.yml y este informe.
- Base: worker tenía continue-on-error a nivel de job. Release gate depende de unit y worker.
- Cambio: se retira la tolerancia de fallo del worker. Los cinco jobs resuelven el store tras corepack enable y restauran la caché antes de la instalación congelada. La clave incluye sistema operativo, arquitectura y hash del lockfile raíz.
- actionlint 1.7.7 y git diff --check: código de salida 0.
- PyYAML 6.0.3: YAML válido. Comparación estructural contra la base: al descontar los dos pasos nuevos de cada job y la tolerancia retirada, ambos workflows son idénticos.
- Bash con un doble de pnpm: publicó la ruta del store con espacios. Un fallo al resolverla devolvió 19 y el fallo simulado del paso de typecheck devolvió 42.
- En GitHub Actions, al fallar el worker, falla el workflow y el release gate queda omitido por su dependencia. La prueba local cubre la salida del comando; el resultado del job y el acierto de caché quedan pendientes en el runner.
- Verificación remota pendiente: observar un run con fallo controlado del worker y comprobar que el release gate se omite en main. En dos runs correctos con el mismo lockfile, comprobar guardado y restauración del store.
