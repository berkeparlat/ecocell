# Windows Task Scheduler Kurulum Scripti
# PowerShell'i yönetici olarak çalıştırın ve bu scripti çalıştırın

$taskName = "EcocellExcelFileWatcher"
$scriptPath = "$PSScriptRoot\index.js"
$nodePath = (Get-Command node).Source

# Task zaten var mı kontrol et
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if ($existingTask) {
    Write-Host "Mevcut task siliniyor..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

# Yeni task oluştur
$action = New-ScheduledTaskAction -Execute $nodePath -Argument $scriptPath -WorkingDirectory $PSScriptRoot

# Trigger: Bilgisayar açıldığında
$trigger = New-ScheduledTaskTrigger -AtStartup

# Task ayarları
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 1)

# Principal (Kullanıcı)
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -RunLevel Highest

# Task'ı kaydet
Register-ScheduledTask `
    -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Description "Excel dosyalarını otomatik olarak Firebase'e yükler"

Write-Host "`n✓ Task başarıyla oluşturuldu: $taskName" -ForegroundColor Green
Write-Host "`nTask'ı başlatmak için:" -ForegroundColor Cyan
Write-Host "  Start-ScheduledTask -TaskName '$taskName'" -ForegroundColor White
Write-Host "`nTask durumunu kontrol etmek için:" -ForegroundColor Cyan
Write-Host "  Get-ScheduledTask -TaskName '$taskName' | Get-ScheduledTaskInfo" -ForegroundColor White
Write-Host "`nTask'ı kaldırmak için:" -ForegroundColor Cyan
Write-Host "  Unregister-ScheduledTask -TaskName '$taskName' -Confirm:`$false" -ForegroundColor White
