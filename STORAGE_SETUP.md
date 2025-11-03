# Firebase Storage Kurulum Rehberi

## 🆓 ÖNEMLİ: Firebase Storage TAMAMEN ÜCRETSİZ!

Firebase'in **Spark Plan** (ücretsiz) ile Storage kullanabilirsiniz:

### Ücretsiz Limitler:
- 📦 **5 GB** depolama
- 📥 **1 GB/gün** indirme
- ⬆️ **20,000** yükleme/gün
- ⬇️ **50,000** indirme/gün

**Excel dosyalarınız için bu limitler fazlasıyla yeterli!**

---

## Önemli: Firebase Storage'ı Etkinleştirme

Excel dosyalarının yüklenebilmesi için Firebase Storage'ın aktif edilmesi gerekiyor.

### 1. Firebase Console'a Giriş

1. [Firebase Console](https://console.firebase.google.com/) adresine gidin
2. Projenizi seçin: **ecocell-8d794**

### 2. Storage'ı Etkinleştirme

1. Sol menüden **Build** > **Storage** sekmesine tıklayın
2. **Get Started** butonuna tıklayın
3. ⚠️ **"Upgrade Plan" mesajı çıkarsa:** **TIKLAMAYIN!** Aşağı kaydırın
4. **"Start in test mode"** veya **"Start in production mode"** seçin (ikisi de ücretsiz)
5. **Next** butonuna tıklayın
6. Lokasyon seçin (Varsayılan: europe-west)
7. **Done** butonuna tıklayın

### ⚠️ ÖNEMLI NOT:
- **"Upgrade to Blaze Plan"** mesajı çıkabilir - **BUNU ATLAYINIZ**
- **"Get Started"** butonuna tıklayın, ücretsiz plan ile devam edin
- Kredi kartı bilgisi **GEREKMEZ**

### 3. Güvenlik Kurallarını Güncelleme

Storage etkinleştirildikten sonra, güvenlik kurallarını aşağıdaki gibi güncelleyin:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Excel dosyaları için yetkilendirme
    match /excel/{type}/{fileName} {
      // Sadece giriş yapmış kullanıcılar okuyabilir
      allow read: if request.auth != null;
      
      // Sadece giriş yapmış kullanıcılar yazabilir
      allow write: if request.auth != null;
      
      // Dosya boyutu sınırı: 10MB
      allow create: if request.auth != null 
                    && request.resource.size < 10 * 1024 * 1024;
    }
  }
}
```

### 4. Kuralları Uygulama

1. Firebase Console'da **Storage** > **Rules** sekmesine gidin
2. Yukarıdaki kuralları yapıştırın
3. **Publish** butonuna tıklayın

## Özellikler

### Günlük Stok Takibi
- **URL:** `/daily-stock`
- **Dosya Tipi:** `stock`
- **Klasör:** `excel/stock/`

### Satış Sipariş Takibi
- **URL:** `/sales-order`
- **Dosya Tipi:** `sales`
- **Klasör:** `excel/sales/`

## Kullanım

1. Sayfaya gidin
2. **"Dosya Seç"** butonuna tıklayın
3. Excel dosyasını seçin (.xlsx veya .xls)
4. **"Yükle"** butonuna tıklayın
5. Dosya yüklendikten sonra otomatik olarak tablo şeklinde görüntülenecek

## Özellikler

✅ Excel dosyası yükleme (.xlsx, .xls)
✅ Yüklenen dosyayı tablo olarak görüntüleme
✅ Dosya geçmişi
✅ Dosya indirme
✅ Dosya silme
✅ Otomatik güncelleme
✅ Responsive tasarım

## Güvenlik

- Sadece giriş yapmış kullanıcılar dosya yükleyebilir/görüntüleyebilir
- Maksimum dosya boyutu: 10MB
- Dosyalar Firebase Storage'da güvenli şekilde saklanır

## Sorun Giderme

Eğer dosya yüklenirken hata alırsanız:

1. Firebase Console'dan Storage'ın etkin olduğunu kontrol edin
2. Güvenlik kurallarının doğru ayarlandığından emin olun
3. Kullanıcının giriş yapmış olduğunu kontrol edin
4. İnternet bağlantınızı kontrol edin
5. Dosya boyutunun 10MB'den küçük olduğunu kontrol edin

## Not

Firebase'in ücretsiz planında **5GB storage** ve **1GB/gün indirme** limiti vardır. Bu normal kullanım için yeterlidir.
