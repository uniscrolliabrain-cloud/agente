# CAPTURE_LOG_SAMPLES_V1 — arranca el API, hace un request, captura logs.
# Ver: docs/audits/02-observabilidad/roadmap.md §8.

$ErrorActionPreference = "Continue"
Set-Location "C:\Users\Alfonso\Desktop\git hub repos\agente"

$out = "docs/audits/_prep/log-samples.txt"
$correlation = "audit-corr-$(Get-Random -Maximum 99999)"

Write-Host "Arrancando API en background..." -ForegroundColor Cyan
$api = Start-Process -FilePath "pnpm" -ArgumentList "dev" -PassThru -NoNewWindow `
  -RedirectStandardOutput "artifacts/api-stdout.log" `
  -RedirectStandardError "artifacts/api-stderr.log" `
  -ErrorAction SilentlyContinue

Start-Sleep -Seconds 8

try {
  Write-Host "Haciendo request con correlationId=$correlation..." -ForegroundColor Cyan
  Invoke-WebRequest -Uri "http://127.0.0.1:8787/api/health" `
    -Headers @{ "X-Correlation-Id" = $correlation } -UseBasicParsing | Out-Null
  Start-Sleep -Seconds 2
} finally {
  $api.Kill()
}

if (Test-Path "artifacts/api-stdout.log") {
  $matches = Select-String -Path "artifacts/api-stdout.log" -Pattern $correlation
  "=== Líneas con correlationId $correlation ===" | Out-File -FilePath $out -Encoding utf8
  if ($matches) {
    $matches | ForEach-Object { $_.Line } | Out-File -FilePath $out -Append -Encoding utf8
    Write-Host "OK: $($matches.Count) líneas encontradas" -ForegroundColor Green
  } else {
    "FALLO: ninguna línea con el correlationId" | Out-File -FilePath $out -Append -Encoding utf8
    Write-Host "FALLO: el correlationId no se propagó" -ForegroundColor Red
  }
}
