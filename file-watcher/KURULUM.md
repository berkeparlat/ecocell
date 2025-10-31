# 🚀 Hızlı Kurulum Rehberi - Excel Otomatik Yükleme

## Adım 1: Firebase Service Account Key İndirme

1. [Firebase Console](https://console.firebase.google.com/) → **ecocell-8d794** projesini açın
2. ⚙️ **Settings** → **Project settings** → **Service accounts**
3. **Generate new private key** butonuna tıklayın
4. İndirilen dosyayı `file-watcher` klasörüne kopyalayın
5. Dosyayı `serviceAccountKey.json` olarak yeniden adlandırın

## Adım 2: Kurulum

```powershell
cd file-watcher
npm install
```

## Adım 3: Ayarları Yapılandırma

`.env.example` dosyasını `.env` olarak kopyalayın:

```powershell
cp .env.example .env
```

`.env` dosyasını açın ve düzenleyin:

```env
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
FIREBASE_STORAGE_BUCKET=ecocell-8d794.firebasestorage.app

# Gerçek dosya yollarını girin (örnek):
STOCK_FILE_PATH=\\\\SUNUCU\\Paylaşım\\Stok.xlsx
SALES_FILE_PATH=\\\\SUNUCU\\Paylaşım\\Satis_Siparis.xlsx

LOG_FILE_PATH=./logs/watcher.log
```

**Not:** Ağ yollarını tam olarak girin. Örnek:
- `\\\\SRV01\\Ortak\\Excel\\Stok.xlsx`
- `C:\\Sirket\\Stok.xlsx`

## Adım 4: Test

```powershell
npm start
```

veya

```powershell
.\start.bat
```

✅ "Dosya izleyici hazır ve çalışıyor..." mesajını görmelisiniz.

Excel dosyalarından birini açıp kaydedin. Konsol'da yükleme mesajını göreceksiniz.

## Adım 5: Otomatik Başlatma (Opsiyonel)

### Yöntem 1: Windows Task Scheduler (Önerilen)

PowerShell'i **YÖNETİCİ OLARAK** açın ve çalıştırın:

```powershell
cd "C:\Users\Otomasyon\Desktop\ecocell\file-watcher"
.\install-task.ps1
```

Task'ı başlatın:

```powershell
Start-ScheduledTask -TaskName "EcocellExcelFileWatcher"
```

### Yöntem 2: Windows Başlangıç Klasörü

1. `Win + R` tuşlarına basın
2. `shell:startup` yazın ve Enter'a basın
3. `start.bat` dosyasının kısayolunu bu klasöre kopyalayın

## Kontrol ve İzleme

### Logları Görüntüleme

```powershell
cat logs/watcher.log
```

Canlı izleme:

```powershell
Get-Content logs/watcher.log -Wait -Tail 20
```

### Task Durumu (Eğer Task Scheduler kullanıyorsanız)

```powershell
Get-ScheduledTask -TaskName "EcocellExcelFileWatcher" | Get-ScheduledTaskInfo
```

## Nasıl Çalışır?

```
Excel Dosyası Güncellendi
         ↓
  Script Değişikliği Algılar
         ↓
   2 Saniye Bekler
         ↓
Firebase Storage'a Yükler
         ↓
  Web Sitesi Otomatik Güncellenir
```

## ✅ Başarılı Kurulum Kontrolü

1. Script çalışıyor mu? → `npm start` ile test edin
2. Dosya yolu doğru mu? → `.env` dosyasını kontrol edin
3. Firebase bağlantısı var mı? → `serviceAccountKey.json` dosyası yerinde mi?
4. Yükleme çalışıyor mu? → Excel dosyasını değiştirip kaydedin

## 🆘 Sorun mu var?

### "Dosya bulunamadı" Hatası
- `.env` dosyasındaki yolları kontrol edin
- Network klasörüne erişim yetkisi var mı kontrol edin

### "Firebase hatası"
- `serviceAccountKey.json` dosyası doğru mu?
- Firebase Storage etkin mi?

### Script durdu
- Logları kontrol edin: `logs/watcher.log`
- Windows Event Viewer'a bakın

## Kaldırma

Task Scheduler'dan kaldırma:

```powershell
Unregister-ScheduledTask -TaskName "EcocellExcelFileWatcher" -Confirm:$false
```

---

**Kurulum tamamlandı!** Artık Excel dosyalarınız otomatik olarak web sitesinde güncellenecek. 🎉
