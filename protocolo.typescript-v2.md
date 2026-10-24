# Protocolo operativo v2 - Fixes de PowerShell en repositorios TypeScript

<!-- PROTOCOLO_FIXES_V2 -->

## Como trabajar sin fallar: metodo estricto, verificable y reproducible

Este documento es la v2 del protocolo. La v1 estaba escrita como lecciones aprendidas despues de 5 fallos reales. La v2 esta escrita como el orden de operaciones que hace que esos fallos no puedan ocurrir. La diferencia es de centro de gravedad: la v1 explicaba que habia salido mal; la v2 explica que hay que hacer antes de escribir para que no salga mal.

La regla raiz es la misma, pero ahora es operativa: no se escribe un patchset hasta que se ha demostrado, contra el disco, que el ancla existe exactamente una vez, con el line ending correcto, la indentacion correcta y sin caracteres que rompan el parser de PowerShell.

Si esa demostracion falla, el patchset no se escribe. Se anota el miss y se pide el fichero. No se improvisa.

---

## 1. Verificacion previa obligatoria (antes de escribir nada)

Este es el bloque que hay que ejecutar antes de proponer un solo patchset. Si no se ejecuta, el patchset no empieza. No es opcional. No es 'si da tiempo'. Es el paso 0.

### 1.1. Confirmar el repo y la rama

```powershell
$repoRoot = "C:\ruta\al\repo"
if (-not (Test-Path (Join-Path $repoRoot ".git"))) { throw "No es un repo git" }
$branch = git -C $repoRoot branch --show-current
if ($branch -ne "feat/multitenancy-campaign") { throw "Rama incorrecta: $branch" }
Write-Host "rama: $branch" -ForegroundColor Green
```

### 1.2. Confirmar que la fase anterior esta cerrada

Cada fase tiene marcas de idempotencia en los ficheros que toco. Antes de empezar la fase N, comprobar que las marcas de la fase N-1 existen:

```powershell
$checks = @{
  "ruta/fichero1.ts" = "MARCA_FASE_ANTERIOR_V1"
  "ruta/fichero2.ts" = "OTRA_MARCA_V1"
}
foreach ($k in $checks.Keys) {
  $c = Get-Content (Join-Path $repoRoot $k) -Raw -ErrorAction SilentlyContinue
  if (-not $c) { throw "Falta fichero: $k" }
  if ($c -notmatch [regex]::Escape($checks[$k])) { throw "Falta marca $($checks[$k]) en $k" }
}
Write-Host "Fase anterior verificada" -ForegroundColor Green
```

Si falta alguna marca, la fase N se aborta. No se construye sobre arena.

### 1.3. Confirmar que los ficheros que toca el patchset existen

```powershell
$files = @(
  "ruta/fichero1.ts",
  "ruta/fichero2.ts"
)
foreach ($f in $files) {
  if (-not (Test-Path (Join-Path $repoRoot $f))) { throw "Falta $f" }
}
```

Si falta un fichero, se pide. No se inventa.

### 1.4. Confirmar el typecheck actual

```powershell
Set-Location $repoRoot
$tc = pnpm --filter "@openmuse/server" exec tsc --noEmit 2>&1 | Out-String
$errs = ($tc -split "`n" | Where-Object { $_ -match "error TS" })
Write-Host ("errores TS: " + @($errs).Count)
$errs | Select-Object -First 20
```

Registrar el numero. Si hay errores nuevos respecto a la fase anterior, la fase se aborta. Si hay errores preexistentes conocidos (worker.ts, por ejemplo), se anotan y no se aborta.

### 1.5. Leer el $old del fichero real, no del Repomix

Para cada MODIFY, antes de escribir el $old:

```powershell
$file = Join-Path $repoRoot "ruta/fichero.ts"
$raw = Get-Content $file -Raw
Write-Host ("bytes: " + $raw.Length)
Write-Host ("CRLF: " + ($raw -match "`r`n"))
Write-Host "primeras 5 lineas:"
($raw -split "`n" | Select-Object -First 5) | ForEach-Object { Write-Host "  $_" }
```

Si el fichero ha sido tocado por un patchset anterior, el Repomix original ya no sirve. Se lee del disco.

### 1.6. Si falta un fichero, se pide. No se inventa.

La regla del protocolo v1 §1.5 sigue vigente: si el fichero no esta en el Repomix y no lo tienes pegado, se pide. No se construye un $old aproximado. No se sustituye por otro parecido.

---

## 2. Formato obligatorio de un patchset

Cada patchset tiene estos elementos, en este orden:

- **ID unico**: F<N>.<K> o FIX_<NNN>. Sin colisiones.
- **Fichero**: ruta exacta desde la raiz.
- **Tipo**: CREATE / MODIFY / WIRE / READ / NO TOUCH.
- **Marca de idempotencia**: XXX_V1. En comentario, no en codigo ejecutable.
- **Precondicion**: Select-String o Get-Content que demuestra que el $old existe exactamente 1x.
- **$old literal**: copiado del fichero real, con line ending e indentacion exactos.
- **$new**: con el mismo line ending e indentacion. Sin mezclar tabs y espacios.
- **Verificacion post en memoria**: la marca aparece, el $old ya no esta, el $new esta. Si falla, throw sin escribir.
- **Escritura atomica**: [System.Text.UTF8Encoding]::new($false) + [System.IO.File]::WriteAllText, con backup previo.
- **Verificacion post en disco**: Get-Content -Raw + conteo de marca + conteo de bytes.
- **Resultado**: PASS / FAIL / BLOCKED / DEFERRED / NOT APPLICABLE, con evidencia.

Si el $old no coincide exactamente 1x, el patchset se marca FAIL con el numero de coincidencias y **no se escribe**. No se improvisa un $old alternativo.

---


```powershell
git add ruta/fichero1.ts
git add ruta/fichero2.ts
git commit -m "feat(multiusuario): fase N - <nombre> [MARCA1, MARCA2, ...]"
git push origin feat/multitenancy-campaign
```

Nunca git add . Nunca --force. Nunca git reset --hard.

---

## 8. Gestion de misses y deudas

Un FAIL con throw es un exito del metodo, no un fracaso del fix. El patchset no se ha escrito, el fichero no se ha tocado, el repo sigue en el estado anterior. Se anota el miss con:

- **Patchset:** F<N>.<K>
- **Fichero:** ruta

**Sintoma:** FIX_016a y FIX_016b fallaron con ancla = 0.

**Solucion:** Get-Content -Raw y [string]::Join. En la v2, §1.5 y §3.2 lo convierten en obligatorio.

### Fallo 5: asumir que el Repomix original sigue siendo valido tras fixes

**Sintoma:** FIX_016a fallo porque el Repomix original no mostraba el estado post-Fase 3 del bloque /search.

**Solucion:** la fuente de verdad es el disco. En la v2, §1.5 lo convierte en el Paso 0.

---

## 11. Reglas fijas (resumen ejecutivo)

Para una IA que solo lea esta seccion:

1. **Antes de escribir, verifica contra el disco.** Rama, marcas de la fase anterior, ficheros existen, typecheck, $old literal.
2. **Un patchset = un fichero + un proposito.** No agrupes cambios independientes.
3. **$old literal del fichero real, con line ending e indentacion exactos.** Si el fichero es LF, LF. Si es CRLF, CRLF. Detecta antes.
4. **Si el $old contiene backticks o $, construye con [char]96 y [char]36.** No los pongas literales en strings con comillas dobles.
5. **Si el $old contiene comentarios intermedios, copialos.** No construyas de memoria.
6. **Assert-MatchCount = 1.** Si no, throw y aborta. No escribas.
7. **Verifica en memoria antes de escribir.** La marca aparece, el $old ya no esta.
8. **Escribe con [System.Text.UTF8Encoding]::new($false) + WriteAllText.** Backup previo.
9. **Verifica en disco despues de escribir.** Marca 1x, bytes > 0, $old ya no esta.
10. **Typecheck + tests + diff.** Sin verde, no hay commit.
11. **git add selectivo.** Nunca git add .
12. **Los misses van a missed/_pendientes.md con diagnostico.** Las deudas a -pendientes.md con precondicion.
13. **La fase no se cierra sin checklist completo.** No declares PASS sin evidencia.
14. **Si falta un fichero, se pide. No se inventa.**

