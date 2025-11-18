# Excel File Watcher

Ağ klasöründeki Excel dosyalarını otomatik olarak Firebase Storage'a yükler.

## 🚀 Kullanım

### Manuel Başlatma (Geliştirme/Test)
```bash
npm start
```
Durdurmak için: `Ctrl+C`

### Otomatik Başlatma (Production - Windows Startup)
`start-background.vbs` dosyası Windows başlangıcında otomatik çalışır.
- **Başlatma**: Windows açıldığında otomatik başlar
- **Durdurma**: Task Manager'dan `node.exe` işlemini sonlandırın

### Startup Kısayolu
Kısayol konumu: `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\Ecocell File Watcher.lnk`

## 📋 Özellikler

- ✅ Otomatik dosya izleme (10 saniye aralıklarla)
- ✅ Ağ dosyaları desteği
- ✅ Çift yükleme önleme
- ✅ Otomatik eski dosya temizleme (sadece son versiyon tutulur)
- ✅ Ağ bağlantı hatası durumunda otomatik yeniden deneme
- ✅ Detaylı log kayıtları

## 📁 İzlenen Dosyalar

Dosya yolları `.env` dosyasında tanımlıdır:
- Günlük Stok Listesi
- DCS Raporları (A, B, Buhar)
- Elektrik Tüketimi
- Duruş İşleri
- Siparişler
- Yüklemeler
- Bakım Planları (Elektrik/Mekanik)

## 🔧 Yapılandırma

`.env` dosyasını düzenleyerek:
- Dosya yollarını değiştirebilirsiniz
- Firebase yapılandırmasını güncelleyebilirsiniz
- Log dosyası konumunu ayarlayabilirsiniz

## 📝 Loglar

Log dosyası: `./logs/watcher.log`

Her işlem tarih damgası ile kaydedilir.
