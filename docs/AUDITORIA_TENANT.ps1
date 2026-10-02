# AUDITORIA_TENANT
# Script que recorre el repo y reporta donde se usa owner/tenant.

Write-Host "=== Auditoria owner/tenant ===" -ForegroundColor Cyan
Write-Host ""

$root = "C:\Users\Alfonso\Desktop\git hub repos\agente\apps\server\src"
$files = Get-ChildItem -Path $root -Filter "*.ts" -Recurse | Where-Object { $_.FullName -notmatch "node_modules" }

$owners = @()
$tenants = @()
$missing = @()

foreach ($f in $files) {
    $content = [System.IO.File]::ReadAllText($f.FullName)
    $rel = $f.FullName.Substring($root.Length + 1)
    if ($content -match '\bowner\b') { $owners += $rel }
    if ($content -match '\btenantId\b') { $tenants += $rel }
    if ($content -match '\bowner\b' -and $content -notmatch '\btenantId\b') { $missing += $rel }
}

Write-Host "Ficheros con owner:   $($owners.Count)"
Write-Host "Ficheros con tenantId: $($tenants.Count)"
Write-Host "Ficheros con owner sin tenantId: $($missing.Count)"
Write-Host ""
Write-Host "=== Ficheros con owner sin tenantId ===" -ForegroundColor Yellow
$missing | Sort-Object | ForEach-Object { Write-Host "  $_" }