# run-fixes.ps1 - arrancador de todos los scripts de fixes por bloque.
# Uso: powershell -ExecutionPolicy Bypass -File scripts/fixes/run-fixes.ps1
#      powershell -ExecutionPolicy Bypass -File scripts/fixes/run-fixes.ps1 -Only 10
#      powershell -ExecutionPolicy Bypass -File scripts/fixes/run-fixes.ps1 -From 05 -To 09
#
# Recorre los 25 bloques en orden topologico.
# Los bloques que no existan se saltan con aviso.
# Al final imprime un resumen global.

param(
  [string]$Only = "",
  [string]$From = "",
  [string]$To = "",
  [switch]$ListOnly
)

$ErrorActionPreference = "Continue"
Set-Location (Resolve-Path (Join-Path $PSScriptRoot "..\\..")).Path

# Orden topologico del POLICY_REPO.md
$order = @(
  "01-tests",
  "02-observabilidad",
  "08-bus-de-eventos",
  "03-resiliencia",
  "05-motor-tareas-durable",
  "06-aprobaciones-acciones",
  "04-multi-usuario-concurrente",
  "07-aislamiento-multi-tenant",
  "09-kernel-cognitivo",
  "10-fast-slow-llm",
  "11-chat-con-llm",
  "12-contexto-memoria",
  "13-ui-servida-viewspec",
  "14-templates-reales",
  "15-frontend-react",
  "16-autenticacion",
  "17-seguridad-basica",
  "18-deploy-infra",
  "19-backups-restore",
  "20-computer-sandbox",
  "21-browser-worker",
  "22-google-drive-gmail",
  "23-whatsapp-stripe-gmb",
  "24-business-os-goals",
  "25-docs-operativos"
)

Write-Host ""
Write-Host "=== run-fixes.ps1 ===" -ForegroundColor Cyan
Write-Host ("Repo: " + (Get-Location).Path)
Write-Host ""

if ($ListOnly) {
  Write-Host "Bloques en orden topologico:" -ForegroundColor Cyan
  foreach ($b in $order) {
    $num = $b.Split("-")[0]
    $scriptA = "scripts/fixes/bloque-$num-A.ps1"
    $scriptB = "scripts/fixes/bloque-$num-B.ps1"
    $existsA = Test-Path $scriptA
    $existsB = Test-Path $scriptB
    $tag = if ($existsA -and $existsB) { "LISTO" } elseif ($existsA -or $existsB) { "PARCIAL" } else { "FALTA" }
    Write-Host ("  [{0,-8}] {1}" -f $tag, $b)
  }
  return
}

foreach ($b in $order) {
  $num = $b.Split("-")[0]

  if ($Only -and $num -ne $Only) { continue }
  if ($From -and [int]$num -lt [int]$From) { continue }
  if ($To -and [int]$num -gt [int]$To) { continue }

  foreach ($pass in @("A", "B")) {
    $scriptPath = "scripts/fixes/bloque-$num-$pass.ps1"
    if (-not (Test-Path $scriptPath)) {
      Write-Host ("  SKIP  {0}  (no existe {1})" -f $b, $scriptPath) -ForegroundColor DarkGray
      continue
    }
    Write-Host ""
    Write-Host ("--- Bloque {0} pasada {1} ---" -f $num, $pass) -ForegroundColor Cyan
    try {
      & powershell -ExecutionPolicy Bypass -File $scriptPath
    } catch {
      Write-Host ("  ERR   {0}: {1}" -f $scriptPath, $_.Exception.Message) -ForegroundColor Red
    }
  }
}

Write-Host ""
Write-Host "=== Fin de run-fixes.ps1 ===" -ForegroundColor Cyan
