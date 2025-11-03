# 📊 Excel Otomatik Senkronizasyon Sistemi

Bu sistem, network klasöründeki Excel dosyalarını otomatik olarak izler ve Firebase'e yükler.

## Sistem Bileşenleri

### 1. File Watcher (Dosya İzleyici)
- Network klasöründeki Excel dosyalarını sürekli izler
- Dosya değişikliğinde otomatik Firebase'e yükler
- Windows Service olarak çalışabilir
- Detaylı loglama

### 2. Web Uygulaması
- Firebase'deki en güncel Excel dosyasını görüntüler
- Otomatik güncelleme
- Tablo formatında gösterim

## Kurulum

### File Watcher Kurulumu

Detaylı kurulum için: [file-watcher/KURULUM.md](file-watcher/KURULUM.md)

**Hızlı Başlangıç:**

```powershell
cd file-watcher
npm install
cp .env.example .env
# .env dosyasını düzenleyin (dosya yolları vs.)
npm start
```

### Web Uygulaması

```powershell
npm install
npm run dev
```

## Kullanım

1. File Watcher'ı başlatın (bir kere kurulum yeterli)
2. Excel dosyalarınızı normal şekilde düzenleyin ve kaydedin
3. Web sitesi otomatik olarak güncel veriyi gösterecek

## Özellikler

✅ Tam otomatik senkronizasyon
✅ Gerçek zamanlı güncelleme
✅ Versiyon kontrolü
✅ Dosya geçmişi
✅ Detaylı loglama
✅ Hata yönetimi
✅ Otomatik yeniden başlatma

## Sistem Mimarisi

```
Excel Dosyası (Network)
       ↓
File Watcher (Node.js)
       ↓
Firebase Storage
       ↓
Web Uygulaması (React)
       ↓
Kullanıcılar
```

## Destek

Sorunlar için logları kontrol edin:
- File Watcher: `file-watcher/logs/watcher.log`
- Web App: Tarayıcı konsolu

## Güvenlik

⚠️ **Önemli Güvenlik Notları:**
- `serviceAccountKey.json` dosyasını **asla** paylaşmayın
- `.env` dosyasını **git'e eklemeyin**
- Network klasör yetkilendirmelerini kontrol edin
