# Trans01 · Turno T1 — evidencia válida del kernel

**Base:** `892061c9` · **Commit evaluado:** `7dd328b0` · **Rama:** `converge/trans00-core` · **Fecha:** 2026-11-27
**Autorización:** continuación de Trans00 ordenada por el operador. Sin merge, sin despliegue, sin llamadas a proveedores.

## 1. Qué se hizo

1. **Re-ejecutar las 29 suites focalizadas** de kernel (`tests/trans01-*.test.ts`) con los flags canónicos del protocolo y `ALLOW_NETWORK=0`.
2. **Cerrar H1**: el `EVIDENCIA.json` histórico de Trans01 registraba el SHA-256 del fichero vacío para `tsc` (`e3b0c442…b855`). Se regeneró el log desde el árbol evaluado, con cabecera, salida y código de salida.

## 2. Resultado

| Comprobación | Resultado |
| --- | --- |
| Suites `trans01-*` | **29 suites, 142 tests: 139 PASS, 3 SKIP, 0 FAIL** |
| Typecheck raíz (`tsconfig.json`) | **exit 0**, 0 errores |
| Typecheck worker (`apps/worker/tsconfig.json`) | **exit 0**, 0 errores |
| H1 | **cerrado**: log real (`5bc9d538…`), no el hash de fichero vacío |

La cifra coincide con la forense del corpus (`892061c9`: 139 PASS / 3 SKIP / 0 FAIL), así que no hay regresión entre la auditoría y este árbol.

### Las tres omisiones

Son las que necesitan **PostgreSQL nativo**; se conservan como `SKIP`, con su motivo, y **no** se cuentan como PASS. La certificación de concurrencia real sigue pendiente y requiere una instancia desechable.

## 3. Cómo se ejecutó

- El lote completo excede el límite de cinco minutos del runner, así que se partió en **cuatro tandas** con los mismos flags (`--test-isolation=none --test-timeout=60000 --test-force-exit`, `--import tsx --import ./tests/setup.ts`, `ALLOW_NETWORK=0`). Los totales se agregan desde los cuatro logs.
- `tsx` y las dependencias de tipos (`react`, `@types/react`, `playwright`) **no estaban instaladas** en este entorno: `node_modules/.bin/tsx` era un symlink huérfano. Se instalaron con `--no-save --no-package-lock`, sin tocar `pnpm-lock.yaml`.
- Antes de instalar esas dos dependencias, `tsc` daba 10 errores `TS2307` en `apps/web` y `apps/worker` por módulos ausentes. Con ellas, **0 errores**. El primer intento no se maquilló: quedó registrado como fallo ambiental.

## 4. Qué NO demuestra

- **No es el gate integral**: un test focal no es el gate. `pnpm gate` sigue sin ejecutarse aquí.
- **No certifica concurrencia** con PostgreSQL real (3 SKIP).
- **No contacta proveedores**: todas las tandas con `ALLOW_NETWORK=0`; ningún `LIVE_UNVERIFIED` cambia de estado.
- **No mueve el ledger**: los 48 bloques de Trans01 siguen `PENDING`. Un pase de suites no satisface el criterio de un bloque (12 fases × 4 pasadas con evidencia por pasada); ascenderlos sería exactamente el error que el protocolo prohíbe.

## 5. Evidencia

`Trans01/EJECUCION/EVIDENCIA.json` (nuevo esquema: turno, base, commit evaluado, comandos, totales, exit codes, hashes) + seis logs versionados en `EVIDENCIA/logs/`. El fichero anterior se conserva como `EVIDENCIA-HISTORICA.json` porque sus rutas `/tmp` no son reproducibles desde esta rama; se declara inválido como prueba, no se borra.

## 6. Siguiente

- **Trans02** (cognición): 114 tests citados por el corpus, frontera Fast/Slow/JEV y ontología versionada.
- **Trans05** es el que más valor tiene: montar longitudinal, hoy `UNMOUNTED` con `01.02`, `01.03`, `12.02` en curso.
- Antes de Trans05, decidir **D1** o confirmar explícitamente que el slow lane se queda en `config.ts`/`model-chain.ts`.
