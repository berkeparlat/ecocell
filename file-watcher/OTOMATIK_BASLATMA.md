# 🚀 Otomatik Başlatma Kurulumu

## Yöntem 1: Task Scheduler (Önerilen)

### Adım 1: Yönetici PowerShell Açın
1. Windows tuşuna basın
2. "PowerShell" yazın
3. **Sağ tıklayın** → "Yönetici olarak çalıştır"

### Adım 2: Kurulum Komutlarını Çalıştırın

```powershell
cd "c:\Users\berke.parlat\Desktop\ecocell\file-watcher"
.\install-task.ps1
```

### Adım 3: Task'ı Başlatın

```powershell
Start-ScheduledTask -TaskName "EcocellExcelFileWatcher"
```

### Adım 4: Durumu Kontrol Edin

```powershell
Get-ScheduledTask -TaskName "EcocellExcelFileWatcher" | Get-ScheduledTaskInfo
```

---

## Yöntem 2: Windows Başlangıç Klasörü (Basit)

### Adım 1: Başlangıç Klasörünü Açın
1. `Win + R` tuşlarına basın
2. `shell:startup` yazın
3. Enter'a basın

### Adım 2: Kısayol Oluşturun
1. `c:\Users\berke.parlat\Desktop\ecocell\file-watcher\start.bat` dosyasına sağ tıklayın
2. "Kısayol oluştur" seçin
3. Oluşan kısayolu "Başlangıç" klasörüne taşıyın

✅ Artık bilgisayar her açıldığında otomatik çalışacak!

---

## 📊 Kontrol Komutları

### Log dosyasını görüntüle (canlı)
```powershell
Get-Content logs\watcher.log -Wait -Tail 20
```

### Task durumunu kontrol et
```powershell
Get-ScheduledTask -TaskName "EcocellExcelFileWatcher"
```

### Task'ı durdur
```powershell
Stop-ScheduledTask -TaskName "EcocellExcelFileWatcher"
```

### Task'ı başlat
```powershell
Start-ScheduledTask -TaskName "EcocellExcelFileWatcher"
```

### Task'ı kaldır
```powershell
Unregister-ScheduledTask -TaskName "EcocellExcelFileWatcher" -Confirm:$false
```

---

## ✅ Başarılı Kurulum Kontrolü

1. ✅ Task oluşturuldu mu?
   ```powershell
   Get-ScheduledTask -TaskName "EcocellExcelFileWatcher"
   ```

2. ✅ Task çalışıyor mu?
   ```powershell
   Get-ScheduledTask -TaskName "EcocellExcelFileWatcher" | Select State
   ```

3. ✅ Loglar yazılıyor mu?
   ```powershell
   Get-Content logs\watcher.log -Tail 10
   ```

---

## 🔄 Nasıl Çalışır?

```
Windows Başlangıcı
        ↓
Task Scheduler Başlatır
        ↓
  Node.js Script Çalışır
        ↓
Excel Dosyaları İzlenir
        ↓
 Değişiklik Algılanır
        ↓
Firebase'e Yüklenir
```

## 💡 İpuçları

- **Sorun mu var?** Logları kontrol edin: `logs\watcher.log`
- **Task çalışmıyor?** Bilgisayarı yeniden başlatın
- **Manuel başlatma:** `start.bat` dosyasını çift tıklayın
- **Network erişim sorunu?** .env dosyasındaki yolları kontrol edin

---

**Kurulum Tamamlandı!** 🎉
