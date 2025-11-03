# 🚀 Yeni Bilgisayarda Kurulum Hızlı Rehber

## 1️⃣ Projeyi İndir
```bash
git clone https://github.com/[kullanici-adi]/ecocell.git
cd ecocell
```

## 2️⃣ Ana Proje Kurulumu
```bash
npm install
```

### Firebase Yapılandırması
1. `src/config/firebase.js` dosyasındaki Firebase config'i kontrol edin
2. Gerekirse kendi Firebase projenizle değiştirin

## 3️⃣ File Watcher Kurulumu (Opsiyonel - Sadece Excel izleme yapacak bilgisayarda)

### Adım 1: Bağımlılıkları Yükle
```bash
cd file-watcher
npm install
```

### Adım 2: Firebase Service Account Key İndir
1. [Firebase Console](https://console.firebase.google.com/) → Projeniz
2. ⚙️ Project Settings → Service Accounts
3. "Generate new private key" → İndirilen dosyayı `serviceAccountKey.json` olarak kaydet
4. Dosyayı `file-watcher/` klasörüne kopyala

### Adım 3: .env Dosyasını Oluştur
```bash
# .env.example'ı kopyala
copy .env.example .env
```

`.env` dosyasını aç ve Excel dosya yollarını düzenle:
```env
STOCK_FILE_PATH=\\10.0.0.6\klasor\STOK.xlsx
SALES_FILE_PATH=\\10.0.0.6\klasor\SIPARIS.xlsx
```

### Adım 4: Test Et
```bash
node index.js
```

Excel dosyasını değiştir → Firebase'de güncellenmeli ✓

### Adım 5: Otomatik Başlatma (Windows)
1. `Win + R` → `shell:startup`
2. `start-hidden.vbs` dosyasının kısayolunu oluştur
3. Kısayolu Startup klasörüne taşı
4. Bilgisayarı yeniden başlat

✅ Artık arka planda otomatik çalışacak!

## 4️⃣ Ana Projeyi Çalıştır
```bash
# Ana klasöre dön
cd ..

# Development sunucusu
npm run dev

# Production build
npm run build
```

## 📋 Kontrol Listesi

### Ana Proje
- [ ] `npm install` çalıştırıldı
- [ ] Firebase config doğru
- [ ] `npm run dev` çalışıyor

### File Watcher (İzleme yapacak PC'de)
- [ ] `file-watcher/` klasöründe `npm install` yapıldı
- [ ] `serviceAccountKey.json` eklendi
- [ ] `.env` dosyası oluşturuldu ve Excel yolları girildi
- [ ] Test edildi ve çalışıyor
- [ ] Startup klasörüne eklendi

## 🔧 Sorun Giderme

### "serviceAccountKey.json bulunamadı"
→ Firebase Console'dan service account key'i indirin

### "Excel dosyası bulunamadı"
→ `.env` dosyasındaki yolları kontrol edin (network erişimi olmalı)

### File watcher çalışmıyor
```bash
# Process kontrolü
Get-Process -Name "node"

# Log kontrolü
Get-Content file-watcher/logs/watcher.log -Tail 20
```

## 📞 Yardım

Sorun yaşarsanız:
1. `file-watcher/logs/watcher.log` dosyasını kontrol edin
2. Firebase Console'da Storage'ı kontrol edin
3. Network erişimini test edin

---

**Not:** `serviceAccountKey.json` ve `.env` dosyaları GitHub'a yüklenmez (güvenlik). Her bilgisayarda yeniden oluşturmalısınız.
