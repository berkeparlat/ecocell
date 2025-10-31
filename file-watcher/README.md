# Excel Dosya İzleyici - Otomatik Yükleme Sistemi

Bu sistem, network klasöründeki Excel dosyalarını otomatik olarak izler ve değişiklik olduğunda Firebase Storage'a yükler.

## Kurulum Adımları

### 1. Firebase Admin SDK Service Account Key Alma

1. [Firebase Console](https://console.firebase.google.com/) adresine gidin
2. Projenizi seçin: **ecocell-8d794**
3. Sol üstteki ⚙️ **Settings** > **Project settings** tıklayın
4. **Service accounts** sekmesine gidin
5. **Generate new private key** butonuna tıklayın
6. İndirilen JSON dosyasını `file-watcher` klasörüne `serviceAccountKey.json` adıyla kaydedin

### 2. Bağımlılıkları Yükleme

```powershell
cd file-watcher
npm install
```

### 3. Ortam Değişkenlerini Ayarlama

`.env.example` dosyasını `.env` olarak kopyalayın ve düzenleyin:

```powershell
cp .env.example .env
```

`.env` dosyasında düzenleyin:

```env
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
FIREBASE_STORAGE_BUCKET=ecocell-8d794.firebasestorage.app

# Stok dosyası yolu (ağ klasöründeki gerçek yol)
STOCK_FILE_PATH=\\\\ServerAdi\\Paylaşım\\Stok.xlsx

# Satış sipariş dosyası yolu
SALES_FILE_PATH=\\\\ServerAdi\\Paylaşım\\Satis_Siparis.xlsx

LOG_FILE_PATH=./logs/watcher.log
```

**Not:** Windows ağ yollarında `\\` kullanın (örnek: `\\\\server\\share\\file.xlsx`)

### 4. Manuel Test

```powershell
npm start
```

Script çalışırken Excel dosyalarından birini açıp kaydedin. Konsol'da yükleme mesajını görmelisiniz.

### 5. Windows Service Olarak Kurulum (Opsiyonel)

Script'in arka planda sürekli çalışması için Windows Service olarak kurabilirsiniz.

#### Node-Windows ile:

```powershell
npm install -g node-windows
npm run install-service
```

Ya da **Windows Task Scheduler** ile:

1. **Task Scheduler**'ı açın
2. **Create Basic Task** tıklayın
3. İsim: `Excel File Watcher`
4. Trigger: **When the computer starts**
5. Action: **Start a program**
6. Program: `node.exe` (örn: `C:\Program Files\nodejs\node.exe`)
7. Arguments: `index.js`
8. Start in: `C:\Users\Otomasyon\Desktop\ecocell\file-watcher`
9. **Finish** tıklayın

### 6. Logları Kontrol Etme

```powershell
cat ./logs/watcher.log
```

veya PowerShell ile canlı izleme:

```powershell
Get-Content ./logs/watcher.log -Wait -Tail 10
```

## Nasıl Çalışır?

1. ✅ Script başlatıldığında belirtilen dosyaları izlemeye başlar
2. ✅ Dosyada değişiklik olduğunda (kaydetme) algılar
3. ✅ 2 saniye bekler (dosya tamamen kaydedilsin diye)
4. ✅ Dosyayı otomatik olarak Firebase Storage'a yükler
5. ✅ Web sitesi otomatik olarak en güncel veriyi gösterir

## Özellikler

- 🔄 Otomatik dosya izleme
- ⚡ Gerçek zamanlı yükleme
- 📝 Detaylı loglama
- 🛡️ Hata yönetimi
- 🔁 Otomatik yeniden başlatma
- 💾 Versiyon kontrolü

## Sorun Giderme

### Dosya bulunamıyor hatası
- Network yolunun doğru olduğunu kontrol edin
- Kullanıcı hesabının dosyaya erişim yetkisi olduğunu kontrol edin

### Firebase yükleme hatası
- `serviceAccountKey.json` dosyasının doğru konumda olduğunu kontrol edin
- Firebase Storage'ın etkin olduğunu kontrol edin
- İnternet bağlantısını kontrol edin

### Script durdu
- Windows Event Viewer'da hataları kontrol edin
- Log dosyasını kontrol edin: `logs/watcher.log`
- Manuel olarak yeniden başlatın: `npm start`

## Güvenlik Notları

⚠️ **ÖNEMLİ:**
- `serviceAccountKey.json` dosyasını **asla** paylaşmayın
- Bu dosyayı `.gitignore`'a ekleyin
- Dosya yüksek yetkiler içerir, güvenli tutun

## Kaldırma

Windows Service olarak kurduysanız:

```powershell
npm run uninstall-service
```

Manuel kullanımda sadece scripti durdurun (Ctrl+C).
