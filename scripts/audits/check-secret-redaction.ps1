# CHECK_SECRET_REDACTION_V1 — verifica que los logs no contienen secretos.
# Ver: docs/audits/02-observabilidad/roadmap.md §8.

$ErrorActionPreference = "Continue"
Set-Location "C:\Users\Alfonso\Desktop\git hub repos\agente"

$out = "docs/audits/_prep/secret-redaction-check.txt"
New-Item -ItemType Directory -Force -Path (Split-Path $out) | Out-Null

$patterns = @(
  "Bearer\s+[A-Za-z0-9_\-\.]{20,}",         # authorization
  "sk-[A-Za-z0-9]{20,}",                    # api key estilo OpenAI
  "AIza[A-Za-z0-9_\-]{30,}",                # api key Google
  '"password"\s*:\s*"[^"]+"',               # password en JSON
  '"token"\s*:\s*"[^"]+"'                   # token en JSON
)

$logs = Get-ChildItem -Path "artifacts" -Recurse -Include "*.log" -ErrorAction SilentlyContinue
if (-not $logs) {
  "=== No hay logs en artifacts/ para analizar ===" | Out-File -FilePath $out -Encoding utf8
  Write-Host "SKIP: no hay logs en artifacts/" -ForegroundColor Yellow
  return
}

$findings = @()
foreach ($log in $logs) {
  foreach ($pattern in $patterns) {
    $hits = Select-String -Path $log.FullName -Pattern $pattern -ErrorAction SilentlyContinue
    if ($hits) {
      $findings += [pscustomobject]@{
        File = $log.Name
        Pattern = $pattern
        Count = $hits.Count
      }
    }
  }
}

"=== Resultado de la verificación de redacción ===" | Out-File -FilePath $out -Encoding utf8
if ($findings.Count -eq 0) {
  "OK: no se han encontrado secretos en claro en los logs." | Out-File -FilePath $out -Append -Encoding utf8
  Write-Host "OK: redacción funciona" -ForegroundColor Green
} else {
  "FALLO: los siguientes archivos contienen posibles secretos:" | Out-File -FilePath $out -Append -Encoding utf8
  $findings | Format-Table -AutoSize | Out-String | Out-File -FilePath $out -Append -Encoding utf8
  Write-Host "FALLO: hay $($findings.Count) hallazgos" -ForegroundColor Red
}
