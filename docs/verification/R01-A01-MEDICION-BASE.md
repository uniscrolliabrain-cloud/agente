# R01 · A01 — Medición de la base

**Estado: bloqueada en el arranque de pnpm.** Medición parcial del 7 de noviembre de 2026.

- Worktree: `wt-r01-a01`.
- Rama: `sprint/r01-a01-medir-base`.
- SHA auditado: `0c8fe81ec8ece4dd35cbc9b12e3b1d1d168ce81f`.
- Superficie de escritura: este informe. Los artefactos del gate se conservan localmente bajo `artifacts/gate/` si el runner llega a generarlos.

## Auditoría de partida

El worktree estaba limpio. `docs/verification/` contenía evidencia anterior del vertical. El gate de este SHA ya declara un chequeo de tipos separado para el worker, además del chequeo raíz, la suite y las auditorías del registro. El runner y `pnpm test` usan el patrón recursivo `tests/**/*.test.ts`, aunque la configuración de ejecución difiere entre ambos.

Se comparó `node:fs.globSync` con un inventario recursivo independiente de los archivos con sufijo `.test.ts`. Con Node v24.18.1 se encontraron **119 de 119 archivos**, incluidos **34 en subdirectorios**, y **0 ausentes**. Esta comprobación mide el patrón en ese entorno. La ejecución y los totales TAP quedan pendientes.

## Plan de ejecución revisado

1. Registrar SHA, rama, estado de Git y versiones antes de instalar. Usar un entorno por agente y el lockfile congelado.
2. Comprobar el inventario de tests por separado para conservar evidencia aunque falle la preparación del entorno.
3. Ejecutar el gate completo una vez sobre el SHA de base, antes de aplicar cambios de otros agentes. Capturar el código de salida del comando y preservar `report.json`, `summary.txt` y los logs por check. En un reintento, archivar cualquier evidencia previa fuera del worktree antes de que el runner la sobrescriba.
4. Contrastar los códigos, contadores y estados del JSON con los logs. Separar fallos del entorno, fallos de la base y checks sin medición. Si hace falta probar en otro entorno, registrar ese entorno y repetir el mismo SHA.
5. Entregar a los dueños de cada tarea los hallazgos que les correspondan. A01 mide y documenta. A02 conserva el descubrimiento de tests, A04 conserva CI, A05 conserva el gate y A10 conserva la clasificación y los reintentos de tests fallidos.

## Ejecución y resultados

| Comprobación | Evidencia | Resultado |
| --- | --- | --- |
| Estado inicial de Git | `git status --porcelain=v1` salió 0 sin entradas | Limpio |
| Runtime | `node --version` devolvió v24.18.1 | Cumple el mínimo declarado, 22.6.0 |
| Descubrimiento del patrón | Inventario 119, glob 119, ausentes 0 | Medido |
| Acceso al registro npm | Metadatos de `pnpm@11.19.0`, HTTP 200, curl salió 0 | Accesible para esa consulta |
| Instalación congelada | El intento con el lanzador local dejó el log vacío y no se observó código de salida ni `node_modules` | Inconclusa |
| `pnpm gate` | Se intentó desde el lanzador del PATH y desde la entrada local de pnpm. Sin código de salida observado ni `artifacts/gate/` en la última comprobación | Sin veredicto |
| Chequeo de tipos raíz y worker, tests y auditorías | Sin reporte del runner | Sin medición por check |

El proyecto fija `pnpm@11.19.0`. El primer lanzador del PATH pasa por Corepack. También se intentó la entrada instalada en el perfil de usuario y la descarga de la versión fijada en un directorio temporal. Las herramientas agotaron tiempos de espera durante el diagnóstico. La causa raíz sigue abierta. Los logs temporales observados están en `%LOCALAPPDATA%\Temp\agente-r01-a01-run-EbL5yi`. Son evidencia local y pueden caducar.

## Handoff para revisión y commit

1. Verifica que estás en `wt-r01-a01` y que `git rev-parse HEAD` coincide con el SHA indicado. Revisa `git status --short` y si algún intento anterior terminó o generó `artifacts/gate/report.json`.
2. Si falta el informe del runner, verifica primero que `pnpm --version` devuelve `11.19.0`. Si el lanzador de Windows sigue esperando, prueba la versión fijada en un entorno limpio con el mismo SHA. Ejecuta `pnpm install --frozen-lockfile` y, tras una instalación exitosa, `pnpm gate`. Guarda los códigos y la evidencia local. Mantén la configuración del repo y las superficies de los otros agentes.
3. Actualiza esta tabla con los resultados de cada check y el total TAP. Si sigue bloqueado, registra la causa que puedas demostrar y deja el estado abierto. El recuento de archivos no sirve para declarar la ronda verde.
4. Revisa que el informe no exponga secretos. Añade explícitamente este archivo con `git add -- docs/verification/R01-A01-MEDICION-BASE.md` y revisa `git diff --cached --check`, `git diff --cached --stat` y el diff completo antes del commit. Si el gate queda medido, mensaje sugerido: `sprint(r01-a01): docs(verification): registra medición de la base`. Si solo se conserva evidencia parcial, usa `wip: r01-a01 registra medición parcial de la base` y deja la tarea abierta.

El informe queda sin commit para la IA revisora.
