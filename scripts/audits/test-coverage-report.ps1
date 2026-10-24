# TEST_COVERAGE_REPORT_V1 — % de cobertura por bloque de la campaña.
# Los 6 módulos críticos del roadmap 01: worker, service, actions,
# kernel, rag, tenant. Este script los mide.

$ErrorActionPreference = "Continue"
Set-Location "C:\Users\Alfonso\Desktop\git hub repos\agente"

Write-Host "Corriendo pnpm test:coverage..." -ForegroundColor Cyan
pnpm test:coverage 2>&1 | Out-Host

$summary = "coverage/coverage-summary.json"
if (-not (Test-Path $summary)) {
  Write-Host "FALLO: no hay $summary. ¿Instalaste c8?" -ForegroundColor Red
  return
}

$data = Get-Content $summary -Raw | ConvertFrom-Json

$critical = @{
  "worker.ts"   = "apps/server/src/engine/worker.ts"
  "service.ts"  = "apps/server/src/engine/service.ts"
  "actions.ts"  = "apps/server/src/actions.ts"
  "kernel/*"    = "apps/server/src/kernel/"
  "rag.ts"      = "apps/server/src/engine/rag.ts"
  "tenant.ts"   = "apps/server/src/engine/tenant.ts"
}

Write-Host "`n=== Cobertura por módulo crítico ===" -ForegroundColor Cyan
foreach ($name in $critical.Keys) {
  $path = $critical[$name]
  $matches = $data.PSObject.Properties | Where-Object { $_.Name -like "*$path*" }
  if ($matches) {
    $sum = $matches | ForEach-Object { $_.Value.lines.pct } | Measure-Object -Average
    $pct = [math]::Round($sum.Average, 1)
    $color = if ($pct -ge 50) { "Green" } else { "Yellow" }
    Write-Host ("  {0,-15} {1,6}%" -f $name, $pct) -ForegroundColor $color
  } else {
    Write-Host ("  {0,-15} sin datos" -f $name) -ForegroundColor DarkGray
  }
}
