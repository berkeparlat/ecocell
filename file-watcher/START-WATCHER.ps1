# Excel File Watcher - Basit Baslatma Scripti
# Yonetici yetkisi ile calistirin (sag tik -> Run as Administrator)

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Excel File Watcher Baslatiyor..." -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$indexPath = Join-Path $scriptDir "index.js"

# Node.js yuklu mu kontrol et
try {
    $nodePath = (Get-Command node -ErrorAction Stop).Source
    Write-Host "Node.js bulundu: $nodePath" -ForegroundColor Green
} catch {
    Write-Host "HATA: Node.js bulunamadi! Lutfen Node.js yukleyin." -ForegroundColor Red
    pause
    exit 1
}

# index.js var mi kontrol et
if (-not (Test-Path $indexPath)) {
    Write-Host "HATA: index.js bulunamadi: $indexPath" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "Dosya izleyici baslatiliyor..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Durdurmak icin Ctrl+C basin" -ForegroundColor Gray
Write-Host ""

# File watcher'i baslat
Set-Location $scriptDir
& node index.js
