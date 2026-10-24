# SOP â€” CÃ³mo se audita, diagnostica y arregla el repo

> v1 Â· 2026-10-05 Â· MÃ©todo oficial.

## Ciclo por bloque

Se repite para cada bloque NN del repo.

### 1. Ãrbol del repo

El humano entrega el Ã¡rbol actualizado del repo
(`Get-ChildItem -Recurse | Select FullName`) o el bloque lo pide si no lo tiene.
El Ã¡rbol se usa para verificar rutas antes de pedir archivos.

### 2. Repomix

El agente pide un repomix con los archivos que necesita:
    npx repomix --style markdown --include "<rutas>" --ignore "**/node_modules/**" --output repomix-bloqueNN.md

Reglas del repomix:
- Rutas verificadas contra el Ã¡rbol.
- Nunca rutas inventadas.
- Un repomix por bloque o por fase si es muy grande.

### 3. Inventario en chat

El agente lista:
- Archivos que ya tiene (con contenido).
- Archivos que necesita.
- Cambios ya hechos en el repo.
- Documentos del audit que existen (`miniaudit.md`, `roadmap.md`, `fixes.md`).

### 4. Repomix faltante

El humano entrega los repomix que el agente pide.

### 5. Preestrategia

El agente escribe en chat:
- DiagnÃ³stico hueco por hueco del miniaudit, con evidencia real (archivo:lÃ­nea + snippet).
- Veredicto por hueco: CONFIRMADO / FALSO / PARCIAL / FUERA DE ALCANCE / NO VERIFICABLE.
- Problemas nuevos detectados al leer el cÃ³digo.
- Lista de fixes reales (id, archivo, LOC aprox).
- Decisiones pendientes (numeradas).

### 6. ValidaciÃ³n

El humano responde a las decisiones en una lÃ­nea cada una.
Si hay algo mal, vuelve al paso 5.
Si estÃ¡ bien, se aprueba.

### 7. Mini scripts

El agente escribe un mini script PowerShell por fix:

    $path = "apps/server/src/..."
    $content = Get-Content $path -Raw
    if ($content -match "MARCA_V1") {
      Write-Host "SKIP" -ForegroundColor DarkGray
    } else {
      $anchor = @'
    <cÃ³digo actual>
    '@
      $replacement = @'
    <cÃ³digo nuevo>
    '@
      if (-not $content.Contains($anchor)) {
        Write-Host "MISS: anchor no encontrado" -ForegroundColor Yellow
      } else {
        $new = $content.Replace($anchor, $replacement)
        [System.IO.File]::WriteAllText((Resolve-Path $path), $new, (New-Object System.Text.UTF8Encoding $false))
        Write-Host "OK: MARCA_V1" -ForegroundColor Green
      }
    }

Reglas de los mini scripts:
- Uno por fix. Nunca varios fixes en un script.
- Marcas `NN-XX` (bloque-fix).
- Idempotente: si la marca existe, SKIP.
- Si el anchor no existe, MISS.
- Si dos fixes tocan la misma lÃ­nea, se aplican en serie.
- Antes de escribir el script, el agente verifica el anchor contra el archivo real.

### 8. AplicaciÃ³n

El humano ejecuta cada mini script y pega el output.
- `OK` â†’ siguiente fix.
- `SKIP` â†’ ya estaba, siguiente.
- `MISS` â†’ el agente ajusta el anchor y reenvÃ­a.

### 9. Cierre del bloque

- El agente escribe `docs/audits/NN/diagnostico.md` con el diagnÃ³stico real.
- El agente escribe `docs/audits/NN/fixes.md` con la tabla de fixes aplicados.
- Cline corre typecheck.
- Si hay errores, se resuelven con mini scripts.
- Si todo OK, el bloque se cierra y se pasa al siguiente.

### 10. Loop

Si un bloque no tiene `miniaudit.md` ni `roadmap.md`, primero se crean:
1. DiagnÃ³stico (paso 5).
2. Miniaudit (huecos declarados + huecos profundos).
3. Roadmap (estado verificado + huecos + objetivo + criterios de cierre).
4. Luego se aplican fixes (pasos 7-9).

## Reglas duras

- Rutas verificadas contra el Ã¡rbol. Nunca inventar.
- Evidencia real: archivo:lÃ­nea + snippet. Nunca parafrasear.
- Veredicto explÃ­cito por hueco. Nunca 100% PENDIENTE.
- Un fix = un mini script.
- Typecheck lo hace Cline.
- Tests al final (bloque 01).
- Modelo del repo: clone-por-cliente. Multi-tenant dinÃ¡mico estÃ¡ documentado aparte.

## Orden de bloques

00, 02, 07, 03, 04 ya cerrados.
05 en curso.
Siguientes: 06, 08, 09, 10, 11-25.
01 (tests) al final.
---

## PATCHSET_TECHNIQUE_V1 — la técnica oficial

### Nombre

- Cada `.ps1` de un bloque es un **patchset**.
- Cada fix dentro del patchset es un **hunk**.
- El conjunto de los 25 patchsets es el **audit-fix-bundle**.
- Vocabulario del repo: `Apply-Fix -Id -Path -Mark -Anchor -Replacement`.

### Qué es

Un patchset es un script PowerShell que aplica N cambios a archivos de código mediante find-and-replace verificado, sin AST, sin parser, sin diff/patch de GNU.

### Componentes de cada hunk

- **Id** (ej. `05-B9`).
- **Mark** (ej. `WORKER_RECOVERED_STATE_V1`): etiqueta única que queda en el código. Sirve para idempotencia.
- **Anchor**: fragmento literal del código actual que se va a reemplazar.
- **Replacement**: fragmento nuevo que sustituye al anchor.
- **Guard de idempotencia**: `if ($content -match "MARCA_V1") { SKIP }`.
- **Guard de anchor**: `if (-not $content.Contains($anchor)) { MISS }`.
- **Escritura atómica**: `[System.IO.File]::WriteAllText` con UTF-8 sin BOM.

### Por qué funciona

- No depende de AST ni de parser (rápido).
- Es idempotente (se puede re-ejecutar sin romper).
- Falla limpio: SKIP si ya está, MISS si el anchor no coincide, sin corromper.
- Auditable: cada fix deja una marca en el código.
- Portable: no requiere dependencias externas.

### Cuándo falla

- Cuando el anchor cambia por un fix anterior del mismo patchset (solapamiento).
- Cuando el archivo tiene CRLF y el anchor tiene LF (o viceversa).
- Cuando hay caracteres invisibles o encoding distinto.
- Cuando el anchor aparece más de una vez en el archivo.

**Prevención:** antes de escribir cada hunk, verificar el anchor con `Select-String` contra el archivo real. Si dos hunks tocan la misma línea, aplicar en serie.

### Qué NO es

- No es AST-based refactor.
- No es idempotente por hash (es idempotente por marca textual).
- No valida sintaxis antes de aplicar. El typecheck lo hace Cline al final.

### Nombres técnicos equivalentes

- Surgical patching.
- Idempotent find-and-replace patcher.
- Anchor-based codemod.
- Multi-hunk idempotent patch.

### Cómo se loguea lo que no entra

Todo hunk que da MISS se apunta en `docs/audits/_pendientes.md` con:
- Marca.
- Archivo.
- Anchor esperado.
- Anchor real (si se sabe).
- Replacement esperado.
- Motivo del MISS.
- Estado: pendiente / resuelto / revisar manualmente.

Al final de todos los bloques, otra IA retoma `_pendientes.md` y aplica los fixes con anchor actualizado.

### Reglas duras del patchset

- Un hunk = un fix. Nunca varios fixes en un solo hunk.
- Un patchset = todos los hunks de un bloque.
- Antes de escribir el patchset, el agente verifica los anchors.
- Antes de aplicar cada hunk, si hay riesgo de solapamiento, verificar con `Select-String`.
- Si un hunk da MISS, se loguea y se sigue con el siguiente. No se bloquea el patchset.
- Al final del patchset, se verifica con `Select-String` que todas las marcas están puestas.
- Las que no estén, van a `_pendientes.md`.

### Flujo del patchset

1. Diagnóstico del bloque.
2. Lista de hunks.
3. Validación del humano.
4. Patchset PowerShell.
5. Aplicación hunk por hunk.
6. Los OK quedan. Los MISS van a `_pendientes.md`.
7. Cierre del bloque.
8. Typecheck por Cline.