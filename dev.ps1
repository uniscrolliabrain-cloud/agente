# dev.ps1 — arranque limpio de OpenMuse
# Uso:  .\dev.ps1        (arranque normal)
#       .\dev.ps1 -Reset (borra la DB y re-siembra)

param([switch]$Reset)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
Set-Location $root

$accessKey = "uniscroll_admin_dev_key_2026"

Write-Host "=== 1. Matando node huerfanos ===" -ForegroundColor Cyan
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "`n=== 2. Comprobando DB ===" -ForegroundColor Cyan
$dbPath = Join-Path $root ".openmuse\postgres"
if ($Reset -and (Test-Path $dbPath)) {
  $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
  Rename-Item $dbPath "postgres.broken-$stamp"
  Write-Host "  DB renombrada a postgres.broken-$stamp" -ForegroundColor Yellow
}

Write-Host "`n=== 3. Arrancando backend ===" -ForegroundColor Cyan
Start-Process cmd -ArgumentList "/k","cd /d `"$root`" && pnpm dev" -WindowStyle Normal
Write-Host "  Backend lanzado en ventana CMD (espera 15s a que arranque)" -ForegroundColor Green

Write-Host "`n=== 4. Esperando al backend ===" -ForegroundColor Cyan
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
  Start-Sleep -Seconds 1
  try {
    $r = Invoke-WebRequest "http://127.0.0.1:8787/api/health" -UseBasicParsing -TimeoutSec 2
    if ($r.StatusCode -eq 200) { $ready = $true; break }
  } catch {}
}
if (-not $ready) {
  Write-Host "  Backend no arranco. Revisa la ventana CMD del backend." -ForegroundColor Red
  exit 1
}
Write-Host "  Backend OK" -ForegroundColor Green

Write-Host "`n=== 5. Sembrando datos ===" -ForegroundColor Cyan
$session = Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8787/api/session" -ContentType "application/json" -Body (@{accessKey=$accessKey} | ConvertTo-Json)
$headers = @{ Authorization = "Bearer $($session.token)"; "Content-Type" = "application/json" }

$existingSops = (Invoke-RestMethod "http://127.0.0.1:8787/api/sops" -Headers $headers).Count
if ($existingSops -lt 12) {
  Write-Host "  Sembrando business-records y SOPs..." -ForegroundColor Yellow
  & pnpm exec tsx scripts/seed-agency.ts | Out-Host
  $env:OPENMUSE_ACCESS_KEY = $accessKey
  & pnpm exec tsx scripts/seed-sops-agency.ts | Out-Host
} else {
  Write-Host "  Ya hay $existingSops SOPs, no se resiembra" -ForegroundColor DarkGray
}

$existingSkills = (Invoke-RestMethod "http://127.0.0.1:8787/api/skills" -Headers $headers).Count
if ($existingSkills -lt 6) {
  Write-Host "  Registrando skills..." -ForegroundColor Yellow
  $skillDefs = @(
    @{ id="factura";                name="Factura";               description="Genera HTML de factura con IVA 21%"; entrypoint="main.py"; requirements=@(); version="1.0.0"; prompt=""; category="Cobros"; active=$true },
    @{ id="propuesta";              name="Propuesta comercial";   description="Genera HTML de propuesta"; entrypoint="main.py"; requirements=@(); version="1.0.0"; prompt=""; category="Ventas"; active=$true },
    @{ id="audit-web";              name="Audit web";             description="Audita HTTPS, headers y meta tags"; entrypoint="main.py"; requirements=@(); version="1.0.0"; prompt=""; category="Ventas"; active=$true },
    @{ id="gmb-post-prepare";       name="GMB post prepare";      description="Prepara paquete de publicacion GMB"; entrypoint="main.py"; requirements=@(); version="1.0.0"; prompt=""; category="Entregables"; active=$true },
    @{ id="social-post-prepare";    name="Social post prepare";   description="Genera 3 variantes de post"; entrypoint="main.py"; requirements=@(); version="1.0.0"; prompt=""; category="Entregables"; active=$true },
    @{ id="whatsapp-reply-prepare"; name="WhatsApp reply prepare";description="Clasifica y prepara respuesta WhatsApp"; entrypoint="main.py"; requirements=@(); version="1.0.0"; prompt=""; category="Atencion cliente"; active=$true }
  )
  foreach ($s in $skillDefs) {
    try {
      $res = Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8787/api/skills" -Headers $headers -Body ($s | ConvertTo-Json -Compress)
      Write-Host "    OK $($res.id)" -ForegroundColor Green
    } catch {
      Write-Host "    FALLO $($s.id): $($_.Exception.Message)" -ForegroundColor Red
    }
  }
} else {
  Write-Host "  Ya hay $existingSkills skills, no se reregistran" -ForegroundColor DarkGray
}

Write-Host "`n=== 6. Arrancando frontend ===" -ForegroundColor Cyan
Start-Process cmd -ArgumentList "/k","cd /d `"$root`" && pnpm --filter @openmuse/web dev" -WindowStyle Normal
Start-Sleep -Seconds 6

Write-Host "`n=== LISTO ===" -ForegroundColor Green
Write-Host "Backend:  http://127.0.0.1:8787" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Abriendo navegador..." -ForegroundColor Cyan
Start-Process "http://localhost:5173/"

Write-Host ""
Write-Host "Las dos ventanas CMD nuevas son las del backend y frontend." -ForegroundColor Yellow
Write-Host "Para pararlas: cierra las ventanas con la X (NO pulses Ctrl+C)." -ForegroundColor Yellow
