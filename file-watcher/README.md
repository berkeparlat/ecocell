# 📊 Excel File Watcher

Network klasöründeki Excel dosyalarını otomatik olarak Firebase Storage'a yükleyen Windows servisi.

## 🎯 Özellikler

- ✅ **Gerçek Zamanlı İzleme** - Dosya değişikliklerini anında algılar
- ✅ **Otomatik Yükleme** - Firebase Storage'a otomatik yükler
- ✅ **Gizli Modda Çalışır** - Arka planda, hiçbir pencere açmadan
- ✅ **Otomatik Başlatma** - Windows başlangıcında otomatik çalışır
- ✅ **Log Kaydı** - Tüm işlemleri kaydeder
- ✅ **Network Desteği** - Network paylaşımlarını izler

## 📋 Gereksinimler

- Windows 10/11
- Node.js 14+
- Firebase projesi ve Service Account Key
- Network paylaşımına erişim

## 🚀 Kurulum

### 1. Bağımlılıkları Yükle

```bash
cd file-watcher
npm install
```

### 2. Firebase Service Account Key

1. [Firebase Console](https://console.firebase.google.com/) → Proje ayarları
2. **Service Accounts** sekmesi
3. **Generate new private key** butonuna tıklayın
4. İndirilen dosyayı `serviceAccountKey.json` olarak bu klasöre kaydedin

### 3. Ortam Değişkenlerini Yapılandır

`.env.example` dosyasını `.env` olarak kopyalayın:

```bash
copy .env.example .env
```

`.env` dosyasını düzenleyin:

```env
# Firebase Admin SDK Service Account Key dosya yolu
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json

# Firebase Storage Bucket adı
FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app

# İzlenecek Excel dosyalarının yolları
STOCK_FILE_PATH=\\\\SUNUCU\\Paylaşım\\Stok.xlsx
SALES_FILE_PATH=\\\\SUNUCU\\Paylaşım\\Siparisler.xlsx

# Log dosyası yolu
LOG_FILE_PATH=./logs/watcher.log
```

**Not:** Windows yollarında `\\` kullanın (çift backslash).

### 4. Test Et

```bash
node index.js
```

Başarılı çıktı:
```
[2025-11-03T12:00:00.000Z] Kullanılan bucket: your-project.firebasestorage.app
[2025-11-03T12:00:00.000Z] ============================================================
[2025-11-03T12:00:00.000Z] Excel Dosya İzleyici Başlatıldı
[2025-11-03T12:00:00.000Z] ============================================================
[2025-11-03T12:00:00.000Z] İzlenen dosyalar:
[2025-11-03T12:00:00.000Z]   - \\SUNUCU\Paylaşım\Stok.xlsx
[2025-11-03T12:00:00.000Z]   - \\SUNUCU\Paylaşım\Siparisler.xlsx
[2025-11-03T12:00:00.000Z] ============================================================
[2025-11-03T12:00:00.000Z] ✓ Dosya izleyici hazır ve çalışıyor...
```

## 🔄 Otomatik Başlatma

### Yöntem 1: VBScript ile Gizli Başlatma (Önerilen)

1. **Startup klasörüne kısayol ekle:**

```powershell
# PowerShell'de çalıştırın:
$startupFolder = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"
$vbsPath = "$PWD\start-hidden.vbs"
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$startupFolder\Ecocell File Watcher.lnk")
$Shortcut.TargetPath = "wscript.exe"
$Shortcut.Arguments = "`"$vbsPath`""
$Shortcut.WorkingDirectory = $PWD
$Shortcut.Description = "Excel dosyalarını Firebase'e otomatik yükler"
$Shortcut.Save()
```

2. **Bilgisayarı yeniden başlatın** - Otomatik çalışacak!

### Yöntem 2: Task Scheduler (Alternatif)

**Yönetici PowerShell** açın ve çalıştırın:

```powershell
.\install-task.ps1
```

Task'ı başlat:
```powershell
Start-ScheduledTask -TaskName "EcocellExcelFileWatcher"
```

## 📊 Kullanım

### Manuel Başlatma

**Görünür modda:**
```bash
start.bat
```

**Gizli modda:**
```bash
start-hidden.vbs  # Çift tıklayın
```

### Durumu Kontrol Et

```powershell
# Çalışan process'i kontrol et
Get-Process -Name "node"

# Log dosyasını görüntüle
Get-Content logs\watcher.log -Wait -Tail 20
```

### Durdur

```powershell
# Process'i durdur
Stop-Process -Name "node"

# veya Task Scheduler'dan
Stop-ScheduledTask -TaskName "EcocellExcelFileWatcher"
```

## 📁 Dosya Yapısı

```
file-watcher/
├── index.js                # Ana uygulama
├── package.json            # NPM bağımlılıkları
├── .env                    # Ortam değişkenleri (GIT'e dahil değil)
├── .env.example            # Örnek yapılandırma
├── serviceAccountKey.json  # Firebase key (GIT'e dahil değil)
├── start.bat               # Manuel başlatma
├── start-hidden.vbs        # Gizli başlatma
├── install-task.ps1        # Task Scheduler kurulum
├── OTOMATIK_BASLATMA.md    # Detaylı kurulum rehberi
└── logs/
    └── watcher.log         # İşlem logları
```

## 🔍 Log Örnekleri

### Başarılı Yükleme
```log
[2025-11-03T12:05:30.123Z] Değişiklik algılandı: \\SUNUCU\Paylaşım\Stok.xlsx
[2025-11-03T12:05:30.456Z] Dosya yükleniyor: \\SUNUCU\Paylaşım\Stok.xlsx (Tip: stock)
[2025-11-03T12:05:32.789Z] ✓ Başarılı: stock.xlsx Firebase'e yüklendi (güncellendi)
```

### Hata
```log
[2025-11-03T12:10:15.123Z] Değişiklik algılandı: \\SUNUCU\Paylaşım\Stok.xlsx
[2025-11-03T12:10:15.456Z] ✗ HATA: ENOENT: no such file or directory
```

## 🐛 Sorun Giderme

### "ENOENT: no such file or directory"
- `.env` dosyasındaki dosya yollarını kontrol edin
- Network paylaşımına erişim olduğundan emin olun
- Dosyanın gerçekten var olduğunu kontrol edin

### "Firebase error"
- `serviceAccountKey.json` dosyasının doğru olduğunu kontrol edin
- Firebase Storage'ın aktif olduğunu kontrol edin
- Bucket adının doğru olduğunu kontrol edin

### "Process çalışmıyor"
```powershell
# Process'i kontrol et
Get-Process -Name "node"

# Yoksa başlat
.\start-hidden.vbs
```

### "Otomatik başlamıyor"
```powershell
# Startup klasörünü kontrol et
explorer "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"

# Kısayolun olduğundan emin olun
```

## ⚙️ Yapılandırma

### İzlenen Dosyaları Değiştir

`.env` dosyasını düzenleyin:

```env
STOCK_FILE_PATH=\\\\YeniSunucu\\Paylaşım\\YeniStok.xlsx
SALES_FILE_PATH=\\\\YeniSunucu\\Paylaşım\\YeniSiparis.xlsx
```

Servisi yeniden başlatın:
```powershell
Stop-Process -Name "node"
.\start-hidden.vbs
```

### Firebase Bucket Değiştir

`.env` dosyasında:
```env
FIREBASE_STORAGE_BUCKET=new-project.firebasestorage.app
```

## 🔒 Güvenlik

- ⚠️ `serviceAccountKey.json` dosyasını **asla** paylaşmayın
- ⚠️ `.env` dosyasını **asla** Git'e eklemeyin
- ⚠️ Firebase güvenlik kurallarını kontrol edin
- ✅ Sadece güvenilir network yollarını izleyin

## 📝 Notlar

- Excel dosyası açık olduğunda geçici dosyalar oluşur (~$Dosya.xlsx)
- Bu geçici dosyalar otomatik olarak göz ardı edilir
- Her dosya değişikliğinde Firebase'deki dosya güncellenir (üzerine yazılır)
- Log dosyası sürekli büyür, periyodik olarak temizleyin

## 🔗 İlgili Dökümanlar

- [Ana Proje README](../README.md)
- [OTOMATIK_BASLATMA.md](OTOMATIK_BASLATMA.md) - Detaylı otomatik başlatma rehberi

## 📞 Destek

Sorun yaşarsanız:
1. `logs/watcher.log` dosyasını kontrol edin
2. Process'in çalıştığını kontrol edin
3. Network bağlantısını test edin
4. Firebase Console'u kontrol edin

---

**Son Güncelleme:** Kasım 2025
