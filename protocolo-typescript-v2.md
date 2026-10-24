

=== INICIO ===

# Protocolo operativo v2 - Fixes de PowerShell en repositorios TypeScript

## Como trabajar sin fallar: metodo estricto, verificable y reproducible

Este documento es la v2 del protocolo. La v1 estaba escrita como lecciones aprendidas despues de 5 fallos reales. La v2 esta escrita como el orden de operaciones que hace que esos fallos no puedan ocurrir. La diferencia es de centro de gravedad: la v1 explicaba que habia salido mal; la v2 explica que hay que hacer antes de escribir para que no salga mal.

La regla raiz es la misma, pero ahora es operativa: no se escribe un patchset hasta que se ha demostrado, contra el disco, que el ancla existe exactamente una vez, con el line ending correcto, la indentacion correcta y sin caracteres que rompan el parser de PowerShell.

Si esa demostracion falla, el patchset no se escribe. Se anota el miss y se pide el fichero. No se improvisa.

---

## 1. Verificacion previa obligatoria (antes de escribir nada)

Este es el bloque que hay que ejecutar antes de proponer un solo patchset. Si no se ejecuta, el patchset no empieza. No es opcional. No es "si da tiempo". Es el paso 0.

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

## 3. Los cuatro asesinos silenciosos del $old

En la practica, el 90% de los "ancla = 0" vienen de estos cuatro. La v2 los trata como seccion propia, no como apendice.

### 3.1. Line ending: LF vs CRLF

Windows usa CRLF. Linux usa LF. Un repo mixto puede tener los dos. Si el fichero es LF y tu construyes el $old con CRLF, el ancla = 0.

**Deteccion:**

```powershell
$raw = Get-Content $file -Raw
$hasCRLF = $raw -match "`r`n"
$le = if ($hasCRLF) { "`r`n" } else { "`n" }
Write-Host ("line ending: " + $(if ($hasCRLF) { "CRLF" } else { "LF" }))
```

**Patron robusto:** normalizar el fichero a LF en memoria, construir el $old con LF, aplicar el Replace, y volver a convertir a CRLF antes de escribir si el original era CRLF.

```powershell
$raw = Get-Content $file -Raw
$hasCRLF = $raw -match "`r`n"
$content = $raw -replace "`r`n", "`n"
$old = "linea1`nlinea2"
$new = "linea1`nlinea2 modificada"
$updated = $content.Replace($old, $new)
if ($hasCRLF) { $updated = $updated -replace "`n", "`r`n" }
[System.IO.File]::WriteAllText($file, $updated, $utf8)
```

### 3.2. Indentacion: espacios vs tabs

Si el fichero usa tabs y tu escribes 6 espacios, el ancla = 0. Si usa 2 espacios y tu escribes 4, idem.

**Deteccion:**

```powershell
$firstLines = ($raw -split "`n" | Select-Object -First 20)
foreach ($l in $firstLines) {
  $indent = [regex]::Match($l, '^(\s*)').Groups[1].Value
  Write-Host ("indent: '" + $indent + "' len=" + $indent.Length + " | " + $l.Substring(0, [Math]::Min(60, $l.Length)))
}
```

**Regla:** copiar la indentacion exacta de cada linea del $old del fichero real. No de un Select-String con -Context, que normaliza tabs a espacios.

### 3.3. Backticks en strings de PowerShell

Si el $old contiene backticks (por ejemplo `action:${action}`), dentro de un string con comillas dobles PowerShell los interpreta como escape. El $old se rompe.

**Sintoma:** FAIL: ancla = 0 en un fichero que sabes que tiene el texto.

**Solucion:** construir el $old concatenando con [char]96 para los backticks, y [char]36 para los $:

```powershell
$bt = [char]96
$dollar = [char]36
$oldB = "... return this.policy.can(owner, role, " + $bt + "action:" + $dollar + "{action}" + $bt + ", policyAction); ..."
```

Asi no hay backticks literales en el script. No hay ${} que PowerShell intente interpolar. No hay aqui-string que se rompa al pegar.

### 3.4. Comentarios intermedios

Si el $old es "personaId: ... });" pero el fichero real tiene "personaId: ... // KERNEL_CONTEXT_PERSONA_PROPAGATE_V1 });", el ancla = 0.

**Sintoma:** el fichero tiene el texto, pero el $old no coincide porque hay una linea entre medias.

**Solucion:** leer el fichero completo con Get-Content -Raw y copiar el bloque literal, incluyendo los comentarios. No construir el $old de memoria con lo que crees que hay.

---

## 4. Estructura obligatoria de un patchset

Todo patchset sigue este flujo, sin saltarse pasos. Si falla cualquier comprobacion previa, no se escribe.

```
1. Definir $repoRoot y $file.
2. Test-Path $file. Si no existe, throw.
3. Crear backup en .tmp/patchset-backups/<file>.<timestamp>.
4. $raw = Get-Content $file -Raw.
5. Detectar line ending. $hasCRLF = $raw -match CRLF.
6. $content = $raw -replace CRLF, LF.
7. Si $content contiene la marca de idempotencia:
     - Comprobar que el $new tambien esta aplicado.
     - Si si, SKIP.
     - Si no, AVISO y abortar (estado inconsistente).
8. Construir $old con LF.
9. $c = ([regex]::Matches($content, [regex]::Escape($old))).Count.
10. Si $c -ne 1, throw con diagnostico (incluye conteo parcial de fragmentos).
11. Construir $new con LF.
12. Verificar en memoria: $new contiene la marca, $old ya no esta en $new.
13. $updated = $content.Replace($old, $new).
14. Si $hasCRLF, $updated = $updated -replace LF, CRLF.
15. [System.IO.File]::WriteAllText($file, $updated, $utf8).
16. $rd = Get-Content $file -Raw.
17. Verificar post: marca 1x, $old ya no esta, $new esta, bytes > 0.
18. Write-Host PASS F<N>.<K>.
```

Si falla el paso 10, el patchset aborta antes del paso 15. El fichero no se toca. El backup esta en .tmp/patchset-backups/ por si acaso.

**Regla fija:** el throw en el paso 10 aborta el script entero, no solo el patchset. Los patchsets siguientes no se ejecutan. Esto es intencional: si un patchset falla, no se sigue a ciegas.

---

## 5. Idempotencia: SKIP, no overwrite

Si la marca ya existe en el fichero:

- **Comprobar que el $new tambien esta aplicado.** Por ejemplo, si la marca esta en governance.ts pero canExecuteAction no tiene actor, el estado es inconsistente: la marca existe pero el cambio no se aplico.
- **Si $new esta aplicado:** SKIP.
- **Si $new no esta aplicado:** AVISO y abortar. No sobrescribir. Diagnosticar que paso.
- **Si la marca no existe:** aplicar.

La marca va en comentario, nunca en codigo ejecutable. Nunca dos marcas iguales en el mismo fichero (a menos que sea intencional, como TENANT_ASSERT_NOT_DEFAULT_WIRED_V1 que aparece en import y en handler; en ese caso, la verificacion cuenta el numero esperado).

---

## 6. Escritura atomica

- [System.Text.UTF8Encoding]::new($false) (sin BOM). Nunca New-Object System.Text.UTF8Encoding $false.
- [System.IO.File]::WriteAllText($file, $updated, $utf8).
- Backup previo en .tmp/patchset-backups/<file>.<timestamp>.
- Si el fichero tenia BOM, detectar con $raw[0] -eq [char]0xFEFF y usar $true.
- Si el fichero era CRLF, volver a CRLF antes de escribir.
- No dejar ficheros parcialmente escritos si la operacion falla. Si el throw ocurre antes del WriteAllText, el fichero queda intacto. Si ocurre despues, el backup esta ahi.

---

## 7. Verificacion post: typecheck, tests, diff

Despues de todos los patchsets de la fase:

### 7.1. Typecheck

```powershell
Set-Location $repoRoot
$tc = pnpm --filter "@openmuse/server" exec tsc --noEmit 2>&1 | Out-String
$errs = ($tc -split "`n" | Where-Object { $_ -match "error TS" })
Write-Host ("errores TS: " + @($errs).Count)
$errs | Select-Object -First 40
```

Si hay errores nuevos respecto al paso 1.4, la fase no se cierra. Se diagnostica y se corrige en un patchset adicional.

### 7.2. Tests

```powershell
pnpm test
```

Si rojo por el fix, revertir. Si rojo por tests preexistentes congelados, anotar y no revertir.

### 7.3. Diff

```powershell
git diff --check
git diff -- <archivo>
```

Si el diff no es exactamente el cambio esperado, revertir con Copy-Item $backup $file -Force.

### 7.4. Commit selectivo

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
- **Ancla esperada:** $old
- **Ancla encontrada:** 0x
- **Diagnostico:** que fragmento parcial si esta (para saber si es line ending, indentacion, backticks o comentario intermedio)
- **Accion:** pedir el fichero, ajustar el $old, reintentar

Los misses van a docs/miniaudits/<campana>/missed/_pendientes.md. La IA no lo escribe. Lo revisa el humano.

Las deudas que no son misses (cambios que van a otra fase) van a docs/miniaudits/<campana>/-pendientes.md. Cada deuda con:

- **ID:** DEUDA_<N>
- **Descripcion:** que falta
- **Fase:** donde se resuelve
- **Estado:** ABIERTA / CERRADA
- **Precondicion verificable:** como se sabe que esta resuelta

---

## 9. Criterio de cierre de una fase

Una fase no esta cerrada hasta que:

- [ ] Todos los patchsets de la fase estan PASS o SKIP (idempotencia).
- [ ] Los FAIL estan en missed/_pendientes.md con diagnostico.
- [ ] Las deudas nuevas estan en -pendientes.md con precondicion.
- [ ] Typecheck verde (o errores preexistentes anotados).
- [ ] Tests verde (o fallos preexistentes anotados).
- [ ] git diff de cada fichero es exactamente el cambio esperado.
- [ ] git add selectivo (nunca git add .).
- [ ] git commit con mensaje que incluye las marcas.
- [ ] git push a la rama de campana.
- [ ] Confirmacion al humano: Fase N cerrada. Siguiente: Fase N+1.

Si falta cualquier casilla, la fase no se cierra. No se declara PASS sin evidencia.

---

## 10. Apendice - los 5 fallos de la v1

La v1 documentaba 5 fallos reales. Se mantienen aqui como referencia historica, porque ensenan. Pero ya no son el centro del protocolo. El centro es el metodo de §1-§9, que evita que ocurran.

### Fallo 1: return dentro de if no aborta en bloque pegado a consola

**Sintoma:** FIX_015b-bis imprimio FAIL: handler = 0 y luego PASS falso. El fichero se escribio sin el cambio.

**Solucion:** throw en lugar de return. En la v2, todo throw aborta el script entero. No hay return en comprobaciones.

### Fallo 2: New-Object System.Text.UTF8Encoding $false rompe el parser

**Sintoma:** No se encuentra el tipo [System.Text].

**Solucion:** [System.Text.UTF8Encoding]::new($false). En la v2, es la unica forma aceptada.

### Fallo 3: comillas dobles escapadas dentro de comillas dobles rompen el parser

**Sintoma:** Token residual inesperado.

**Solucion:** comillas simples para envolver el string. En la v2, §3.3 extiende la regla a backticks y $.

### Fallo 4: Select-String -Context normaliza y no sirve para copiar anclas literales

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

=== FIN ===
