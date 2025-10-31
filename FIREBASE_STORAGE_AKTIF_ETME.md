# 🔥 Firebase Storage Aktif Etme ve Excel Yükleme

## ❌ SORUN
Web sitesinde Excel dosyaları görünmüyor:
- Günlük Stok: "Henüz dosya yüklenmemiş" 
- Satış Sipariş: Boş sayfa

## ✅ ÇÖZÜM

### 1️⃣ Firebase Storage'ı Aktif Et

1. **Firebase Console'a git:**
   ```
   https://console.firebase.google.com/project/ecocell-5cf22
   ```

2. **Sol menüden Build > Storage'a tıkla**

3. **"Get started" butonuna tıkla**

4. **Rules seçeneğinde şunu seç:**
   - ✅ Start in production mode
   - Sonra kuralları aşağıdaki gibi güncelleyeceğiz

5. **Location seçimi:**
   - ✅ `europe-west1` (Belçika - En yakın)
   - Alternatif: `europe-west3` (Frankfurt)

6. **"Done" butonuna tıkla**

---

### 2️⃣ Storage Rules'u Güncelle

Firebase Console'da **Storage > Rules** sekmesine git ve aşağıdaki kuralları yapıştır:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Excel dosyaları için kurallar
    match /excel/{type}/{filename} {
      // Okuma: Giriş yapmış tüm kullanıcılar
      allow read: if request.auth != null;
      
      // Yazma: Sadece admin (berke.parlat27@gmail.com)
      allow write: if request.auth != null && 
                      request.auth.token.email == 'berke.parlat27@gmail.com';
    }
    
    // Diğer dosyalar için varsayılan: yok
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

**"Publish" butonuna tıkla!**

---

### 3️⃣ Admin Panel'den Excel Yükle

1. **Web sitesine admin olarak giriş yap:**
   - Email: `berke.parlat27@gmail.com`
   - Şifre: (Mevcut şifren)

2. **Admin Panel'e git:**
   - Sol menüden "Admin Panel" seçeneği

3. **"Excel Yönetimi" sekmesine tıkla**

4. **Günlük Stok Excel'i yükle:**
   - "Günlük Stok Excel Yükle" kartında "Dosya Seç"
   - Excel dosyasını seç (.xlsx veya .xls)
   - "Yükle" butonuna tıkla
   - ✅ Başarılı mesajını bekle

5. **Satış Sipariş Excel'i yükle:**
   - "Satış Sipariş Excel Yükle" kartında "Dosya Seç"
   - Excel dosyasını seç
   - "Yükle" butonuna tıkla
   - ✅ Başarılı mesajını bekle

---

### 4️⃣ Test Et

1. **Günlük Stok sayfasına git:**
   - Sol menüden "Günlük Stok"
   - ✅ Excel tablosunu görmelisin
   - "Yenile" butonu ile güncelleyebilirsin

2. **Satış Sipariş sayfasına git:**
   - Sol menüden "Satış Sipariş"
   - ✅ Excel tablosunu görmelisin
   - "Yenile" butonu ile güncelleyebilirsin

---

## 🔍 Sorun Çözme (Troubleshooting)

### Console Loglarını Kontrol Et

**Chrome'da:**
1. `F12` tuşuna bas (Developer Tools)
2. "Console" sekmesine git
3. Sayfayı yenile (F5)
4. Logları kontrol et:

**Başarılı durumda göreceğin loglar:**
```
📂 excelService: stock klasörü kontrol ediliyor...
📋 excelService: Bulunan dosya sayısı: 1
✅ excelService: En son dosya: stock_1234567890.xlsx
🌐 excelService: Excel dosyası indiriliyor: https://...
📥 excelService: Response alındı, blob oluşturuluyor...
📄 excelService: Blob boyutu: 15234 bytes
🔄 excelService: Excel parse ediliyor...
✅ excelService: Parse tamamlandı!
```

**Hatalı durumda:**
```
⚠️ excelService: stock klasöründe dosya yok!
```
→ **Çözüm:** Admin Panel'den Excel yükle

```
❌ excelService: Excel dosyası getirme hatası
Hata kodu: storage/unauthorized
```
→ **Çözüm:** Storage Rules'u güncelle (Adım 2)

```
❌ excelService: Excel dosyası getirme hatası
Hata kodu: storage/object-not-found
```
→ **Çözüm:** Storage'da `excel/stock` veya `excel/sales` klasörleri yok. Admin Panel'den dosya yükle.

---

## 📁 Storage Yapısı

Firebase Storage'da dosyalar şu yapıda olacak:

```
ecocell-5cf22.appspot.com/
└── excel/
    ├── stock/
    │   ├── stock_1730000000000.xlsx
    │   └── stock_1730100000000.xlsx (en yeni)
    └── sales/
        ├── sales_1730000000000.xlsx
        └── sales_1730200000000.xlsx (en yeni)
```

**Not:** Sistem her zaman EN YENİ dosyayı gösterir (timestamp'e göre)

---

## 📊 Excel Dosyası Formatı

Excel dosyalarınız şu şekilde olmalı:

**Günlük Stok:**
| Ürün Kodu | Ürün Adı | Miktar | Birim | Depo |
|-----------|----------|--------|-------|------|
| ECO-001   | Ürün 1   | 100    | Adet  | A1   |

**Satış Sipariş:**
| Sipariş No | Müşteri | Ürün | Miktar | Durum |
|------------|---------|------|--------|-------|
| SP-001     | Firma A | ...  | 50     | Hazır |

**Önemli:**
- ✅ İlk satır başlık olmalı
- ✅ `.xlsx` veya `.xls` formatı
- ✅ Maksimum 10 MB

---

## 🎯 Özet Kontrol Listesi

- [ ] Firebase Storage aktif edildi
- [ ] Storage Rules güncellendi
- [ ] Admin olarak giriş yapıldı
- [ ] Günlük Stok Excel yüklendi
- [ ] Satış Sipariş Excel yüklendi
- [ ] Günlük Stok sayfası testi ✅
- [ ] Satış Sipariş sayfası testi ✅
- [ ] Console logları kontrol edildi

---

## 📞 Destek

Sorun devam ederse:
1. Browser console'daki HATA mesajlarını kaydet
2. Ekran görüntüsü al
3. Firebase Console'da Storage sekmesini kontrol et

**Admin Email:** berke.parlat27@gmail.com
