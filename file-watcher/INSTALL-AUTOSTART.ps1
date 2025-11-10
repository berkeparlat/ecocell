# Excel File Watcher - Otomatik Baslatma Kurulumu
# Yonetici yetkisi ile calistirin (sag tik -> Run as Administrator)

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "File Watcher Otomatik Baslatma" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$taskName = "EcocellExcelFileWatcher"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$indexPath = Join-Path $scriptDir "index.js"

# Node.js yolu
try {
    $nodePath = (Get-Command node -ErrorAction Stop).Source
    Write-Host "Node.js bulundu: $nodePath" -ForegroundColor Green
} catch {
    Write-Host "HATA: Node.js bulunamadi!" -ForegroundColor Red
    pause
    exit 1
}

# Mevcut task var mi kontrol et
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existingTask) {
    Write-Host ""
    Write-Host "Mevcut task bulundu. Siliniyor..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

# Yeni task olustur
Write-Host ""
Write-Host "Windows Task Scheduler'a ekleniyor..." -ForegroundColor Yellow

$action = New-ScheduledTaskAction -Execute $nodePath -Argument $indexPath -WorkingDirectory $scriptDir

# Bilgisayar acildiginda baslat
$trigger = New-ScheduledTaskTrigger -AtStartup

# Ayarlar: Her zaman calistir, hata durumunda yeniden baslat
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1)

# Kullanici
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -RunLevel Highest

# Task'i kaydet
try {
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description "Excel dosyalarini otomatik Firebase'e yukler" -ErrorAction Stop
    
    Write-Host ""
    Write-Host "BASARILI!" -ForegroundColor Green
    Write-Host ""
    Write-Host "File Watcher artik:" -ForegroundColor White
    Write-Host "  - Bilgisayar her acildiginda otomatik baslar" -ForegroundColor Gray
    Write-Host "  - Arka planda surekli calisir" -ForegroundColor Gray
    Write-Host "  - Hata durumunda otomatik yeniden baslar" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Simdi baslatmak icin:" -ForegroundColor Cyan
    Write-Host "  Start-ScheduledTask -TaskName '$taskName'" -ForegroundColor White
    Write-Host ""
    Write-Host "Durumu kontrol etmek icin:" -ForegroundColor Cyan
    Write-Host "  Get-ScheduledTask -TaskName '$taskName'" -ForegroundColor White
    Write-Host ""
    Write-Host "Kalici olarak kaldirmak icin:" -ForegroundColor Cyan
    Write-Host "  Unregister-ScheduledTask -TaskName '$taskName'" -ForegroundColor White
    Write-Host ""
    
    # Hemen baslat
    Write-Host "File Watcher baslatiliyor..." -ForegroundColor Yellow
    Start-ScheduledTask -TaskName $taskName
    Start-Sleep -Seconds 2
    
    $taskInfo = Get-ScheduledTask -TaskName $taskName
    Write-Host "Durum: $($taskInfo.State)" -ForegroundColor Green
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "HATA: Task olusturulamadi!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Bu scripti yonetici yetkisi ile calistirdiginizdan emin olun." -ForegroundColor Yellow
    Write-Host ""
}

pause
