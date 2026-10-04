# _runner.ps1 - funciones comunes para los scripts de fixes.
# NO se ejecuta directamente. Se hace dot-source desde bloque-NN.ps1.
#
# Uso:
#   . <PSScriptRoot>/_runner.ps1
#
# Funciones:
#   Read-File           - lee un archivo preservando line endings.
#   Write-File          - escribe el archivo con UTF-8 sin BOM.
#   Apply-Fix           - aplica un fix idempotente.
#   Assert-Mark         - verifica que la marca existe en el archivo.
#   Get-RepoRoot        - devuelve la raiz del repo.
#   Invoke-BlockVerification - verifica una lista de fixes al final.

Set-StrictMode -Version Latest
$script:RepoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..\..")).Path
$script:FixResults = @()

function Get-RepoRoot { return $script:RepoRoot }

function Read-File {
  param([Parameter(Mandatory)][string]$Path)
  $full = Join-Path $script:RepoRoot $Path
  if (-not (Test-Path -LiteralPath $full)) { throw "Archivo no existe: $Path" }
  $raw = [System.IO.File]::ReadAllText($full)
  $hadCRLF = $raw.Contains("`r`n")
  $normalized = if ($hadCRLF) { $raw.Replace("`r`n", "`n") } else { $raw }
  return [pscustomobject]@{ FullPath = $full; Text = $normalized; HadCRLF = $hadCRLF }
}

function Write-File {
  param(
    [Parameter(Mandatory)][string]$FullPath,
    [Parameter(Mandatory)][string]$Text,
    [Parameter(Mandatory)][bool]$HadCRLF
  )
  $out = if ($HadCRLF) { $Text.Replace("`n", "`r`n") } else { $Text }
  [System.IO.File]::WriteAllText($FullPath, $out, (New-Object System.Text.UTF8Encoding $false))
}

function Apply-Fix {
  param(
    [Parameter(Mandatory)][string]$Id,
    [Parameter(Mandatory)][string]$Path,
    [Parameter(Mandatory)][string]$Mark,
    [Parameter(Mandatory)][string]$Anchor,
    [Parameter(Mandatory)][string]$Replacement
  )
  $result = [pscustomobject]@{ Id = $Id; Path = $Path; Mark = $Mark; Status = ""; Note = "" }
  try {
    $file = Read-File -Path $Path
    if ($file.Text.Contains($Mark)) {
      $result.Status = "SKIP"; $result.Note = "ya aplicado"
      $script:FixResults += $result; return
    }
    $anchorNorm = $Anchor.Replace("`r`n", "`n").TrimEnd("`n")
    if (-not $file.Text.Contains($anchorNorm)) {
      $result.Status = "MISS"; $result.Note = "anchor no encontrado"
      $script:FixResults += $result; return
    }
    $newText = $file.Text.Replace($anchorNorm, $Replacement.TrimEnd("`n"))
    Write-File -FullPath $file.FullPath -Text $newText -HadCRLF $file.HadCRLF
    $result.Status = "OK"; $result.Note = "aplicado"
  } catch {
    $result.Status = "ERR"; $result.Note = $_.Exception.Message
  }
  $script:FixResults += $result
}

function Assert-Mark {
  param(
    [Parameter(Mandatory)][string]$Path,
    [Parameter(Mandatory)][string]$Mark
  )
  $full = Join-Path $script:RepoRoot $Path
  if (-not (Test-Path -LiteralPath $full)) { return $false }
  $t = [System.IO.File]::ReadAllText($full)
  return $t.Contains($Mark)
}

function Report-Results {
  param([string]$BlockName)
  Write-Host ""
  Write-Host "=== Resultados bloque $BlockName ===" -ForegroundColor Cyan
  $ok = 0; $skip = 0; $miss = 0; $err = 0
  foreach ($r in $script:FixResults) {
    switch ($r.Status) {
      "OK"   { $ok++;   $color = "Green"  }
      "SKIP" { $skip++; $color = "DarkGray" }
      "MISS" { $miss++; $color = "Yellow" }
      "ERR"  { $err++;  $color = "Red"    }
      default { $color = "White" }
    }
    Write-Host ("  {0,-6} {1,-6} {2}" -f $r.Status, $r.Id, $r.Path) -ForegroundColor $color
  }
  Write-Host ""
  Write-Host ("  OK=$ok  SKIP=$skip  MISS=$miss  ERR=$err  TOTAL=$($script:FixResults.Count)") -ForegroundColor $(if ($miss -eq 0 -and $err -eq 0) { "Green" } else { "Yellow" })
  return ($miss -eq 0 -and $err -eq 0)
}

function Invoke-BlockVerification {
  param([array]$Fixes)
  Write-Host ""
  Write-Host "=== Verificacion de marcas ===" -ForegroundColor Cyan
  $ok = 0; $bad = @()
  foreach ($f in $Fixes) {
    if (Assert-Mark -Path $f.Path -Mark $f.Mark) { $ok++ }
    else { $bad += $f }
  }
  Write-Host ("  Con marca OK = {0}/{1}" -f $ok, $Fixes.Count) -ForegroundColor $(if ($ok -eq $Fixes.Count) { "Green" } else { "Yellow" })
  foreach ($b in $bad) {
    Write-Host "  SIN MARCA $($b.Id)  $($b.Path)  falta $($b.Mark)" -ForegroundColor Yellow
  }
  return ($ok -eq $Fixes.Count)
}
