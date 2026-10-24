# FIND_HANGING_BEFORE_V1 — localiza los tests cuyo `before` se cuelga.
# Ejecuta cada archivo de tests por separado con timeout de 10s.
# Los que salen por timeout son candidatos.
# Salida: docs/audits/_prep/hanging-before.txt

$ErrorActionPreference = "Continue"
Set-Location "C:\Users\Alfonso\Desktop\git hub repos\agente"

$out = "docs/audits/_prep/hanging-before.txt"
New-Item -ItemType Directory -Force -Path (Split-Path $out) | Out-Null

$files = Get-ChildItem tests -Filter "*.test.ts" -File
$hanging = @()

"# Tests que superan 10s (candidatos a before colgado)" | Out-File -FilePath $out -Encoding utf8
"# Generado: $(Get-Date -Format o)" | Out-File -FilePath $out -Append -Encoding utf8

foreach ($f in $files) {
  $start = Get-Date
  $proc = Start-Process -FilePath "pnpm" -ArgumentList "exec","tsx","--test","--test-timeout=10000",$f.FullName -PassThru -NoNewWindow -RedirectStandardOutput "NUL" -RedirectStandardError "NUL"
  $done = $proc.WaitForExit(15000)
  if (-not $done) {
    $proc.Kill()
    $hanging += $f.Name
    "$($f.Name) — TIMEOUT >15s" | Out-File -FilePath $out -Append -Encoding utf8
    Write-Host "HANG: $($f.Name)" -ForegroundColor Red
  } else {
    $elapsed = ((Get-Date) - $start).TotalSeconds
    if ($elapsed -gt 8) {
      "$($f.Name) — lento: $([math]::Round($elapsed,1))s" | Out-File -FilePath $out -Append -Encoding utf8
      Write-Host "SLOW: $($f.Name) $([math]::Round($elapsed,1))s" -ForegroundColor Yellow
    }
  }
}

"" | Out-File -FilePath $out -Append -Encoding utf8
"Total candidatos: $($hanging.Count)" | Out-File -FilePath $out -Append -Encoding utf8
Write-Host "Informe: $out" -ForegroundColor Green
