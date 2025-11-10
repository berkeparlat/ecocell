# Excel File Watcher# Excel File Watcher# Excel File Watcher



Excel dosyalarını otomatik olarak Firebase Storage'a yükleyen servis.



## KullanımExcel dosyalarını otomatik olarak Firebase Storage'a yükleyen servis.Ağ klasöründeki Excel dosyalarını otomatik olarak Firebase Storage'a yükler.



### Ön Planda (Terminal Görünür)

1. **Başlatma**: `start.bat` dosyasına çift tıklayın

2. **Durdurma**: Terminal penceresinde `Ctrl+C` basın## Kullanım## 🚀 Hızlı Başlangıç



### Arka Planda (Pencere Kapatılabilir)

1. **Başlatma**: `start-background.vbs` dosyasına çift tıklayın

2. **Durdurma**: Task Manager'dan `node.exe` işlemini sonlandırın1. **Başlatma**: `start.bat` dosyasına çift tıklayın### Seçenek 1: Manuel Başlatma (Terminal kapanınca durur)



## Özellikler2. **Durdurma**: Terminal penceresinde `Ctrl+C` basın```



- Network bağlantısı bekler (30 saniye)START-WATCHER.ps1 dosyasına sağ tık -> "Run with PowerShell"

- Polling mode ile network path izleme

- Otomatik hata düzeltme ve yeniden başlatma## Özellikler```

- Detaylı log kayıtları

Durdurmak için: `Ctrl+C`

## Monitörlenen Dosyalar

- Network bağlantısı bekler (30 saniye)

- Günlük Stok

- Bakım Onarım- Polling mode ile network path izleme### Seçenek 2: Otomatik Başlatma (Sürekli çalışır)

- Bakım Planı

- Arıza Kayıtları- Otomatik hata düzeltme ve yeniden başlatma```

- Çalışma İzinleri

- Satış Siparişleri- Detaylı log kayıtlarıINSTALL-AUTOSTART.ps1 dosyasına sağ tık -> "Run as Administrator"

- Aylık Takvim

- Duruş Listesi```

- Elektrik Tüketimi

## Monitörlenen Dosyalar- ✅ Bilgisayar açıldığında otomatik başlar

- ✅ Arka planda sürekli çalışır

- Günlük Stok- ✅ Terminal kapatılınca durmaz

- Bakım Onarım- ✅ Hata durumunda otomatik yeniden başlar

- Bakım Planı

- Arıza Kayıtları## 📁 Dosyalar

- Çalışma İzinleri

- Satış Siparişleri- `INSTALL-AUTOSTART.ps1` - **Otomatik başlatma kurulumu** (Önerilen)

- Aylık Takvim- `START-WATCHER.ps1` - Manuel başlatma

- Duruş Listesi- `index.js` - Ana file watcher kodu

- Elektrik Tüketimi- `.env` - Yapılandırma dosyası

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
