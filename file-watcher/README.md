# Excel File Watcher

Ağ klasöründeki Excel dosyalarını otomatik olarak Firebase Storage'a yükler.

## 🚀 Hızlı Başlangıç

### Seçenek 1: Manuel Başlatma (Terminal kapanınca durur)
```
START-WATCHER.ps1 dosyasına sağ tık -> "Run with PowerShell"
```
Durdurmak için: `Ctrl+C`

### Seçenek 2: Otomatik Başlatma (Sürekli çalışır)
```
INSTALL-AUTOSTART.ps1 dosyasına sağ tık -> "Run as Administrator"
```
- ✅ Bilgisayar açıldığında otomatik başlar
- ✅ Arka planda sürekli çalışır
- ✅ Terminal kapatılınca durmaz
- ✅ Hata durumunda otomatik yeniden başlar

## 📁 Dosyalar

- `INSTALL-AUTOSTART.ps1` - **Otomatik başlatma kurulumu** (Önerilen)
- `START-WATCHER.ps1` - Manuel başlatma
- `index.js` - Ana file watcher kodu
- `.env` - Yapılandırma dosyası
- `logs/watcher.log` - Çalışma logları

## Özellikler

✅ Ağ bağlantısı koptuğunda otomatik yeniden başlatma
✅ Dosya kilitli olduğunda otomatik retry
✅ Beklenmeyen hatalarda çökme koruması
✅ Detaylı log kayıtları

## İzlenen Dosyalar

- Günlük Stok Listesi
- Elektrik Tüketimi
- İşletme Duruş İş Planı
- Sipariş ve Yükleme Listesi
- Elektrik/Mekanik Bakım Günlük İş Listesi
- Elektrik/Mekanik Bakım Duruş Listesi
