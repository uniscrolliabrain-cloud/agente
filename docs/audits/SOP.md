# SOP — Cómo se audita, diagnostica y arregla el repo

> v1 · 2026-10-05 · Método oficial.

## Ciclo por bloque

Se repite para cada bloque NN del repo.

### 1. Árbol del repo

El humano entrega el árbol actualizado del repo
(`Get-ChildItem -Recurse | Select FullName`) o el bloque lo pide si no lo tiene.
El árbol se usa para verificar rutas antes de pedir archivos.

### 2. Repomix

El agente pide un repomix con los archivos que necesita:
    npx repomix --style markdown --include "<rutas>" --ignore "**/node_modules/**" --output repomix-bloqueNN.md

Reglas del repomix:
- Rutas verificadas contra el árbol.
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
- Diagnóstico hueco por hueco del miniaudit, con evidencia real (archivo:línea + snippet).
- Veredicto por hueco: CONFIRMADO / FALSO / PARCIAL / FUERA DE ALCANCE / NO VERIFICABLE.
- Problemas nuevos detectados al leer el código.
- Lista de fixes reales (id, archivo, LOC aprox).
- Decisiones pendientes (numeradas).

### 6. Validación

El humano responde a las decisiones en una línea cada una.
Si hay algo mal, vuelve al paso 5.
Si está bien, se aprueba.

### 7. Mini scripts

El agente escribe un mini script PowerShell por fix:

    $path = "apps/server/src/..."
    $content = Get-Content $path -Raw
    if ($content -match "MARCA_V1") {
      Write-Host "SKIP" -ForegroundColor DarkGray
    } else {
      $anchor = @'
    <código actual>
    '@
      $replacement = @'
    <código nuevo>
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
- Si dos fixes tocan la misma línea, se aplican en serie.
- Antes de escribir el script, el agente verifica el anchor contra el archivo real.

### 8. Aplicación

El humano ejecuta cada mini script y pega el output.
- `OK` → siguiente fix.
- `SKIP` → ya estaba, siguiente.
- `MISS` → el agente ajusta el anchor y reenvía.

### 9. Cierre del bloque

- El agente escribe `docs/audits/NN/diagnostico.md` con el diagnóstico real.
- El agente escribe `docs/audits/NN/fixes.md` con la tabla de fixes aplicados.
- Cline corre typecheck.
- Si hay errores, se resuelven con mini scripts.
- Si todo OK, el bloque se cierra y se pasa al siguiente.

### 10. Loop

Si un bloque no tiene `miniaudit.md` ni `roadmap.md`, primero se crean:
1. Diagnóstico (paso 5).
2. Miniaudit (huecos declarados + huecos profundos).
3. Roadmap (estado verificado + huecos + objetivo + criterios de cierre).
4. Luego se aplican fixes (pasos 7-9).

## Reglas duras

- Rutas verificadas contra el árbol. Nunca inventar.
- Evidencia real: archivo:línea + snippet. Nunca parafrasear.
- Veredicto explícito por hueco. Nunca 100% PENDIENTE.
- Un fix = un mini script.
- Typecheck lo hace Cline.
- Tests al final (bloque 01).
- Modelo del repo: clone-por-cliente. Multi-tenant dinámico está documentado aparte.

## Orden de bloques

00, 02, 07, 03, 04 ya cerrados.
05 en curso.
Siguientes: 06, 08, 09, 10, 11-25.
01 (tests) al final.