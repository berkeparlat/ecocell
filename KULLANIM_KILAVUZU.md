# 📊 Excel Dosya Yönetimi - Kullanım Kılavuzu

## ⚠️ ÖNEMLİ: Sadece Admin Yükleme Yapabilir

**Dosya Yükleme Yetkisi:** Sadece admin kullanıcısı (`elektrik.bakim@karafiber.com`) Excel dosyalarını yükleyebilir.

**Diğer Kullanıcılar:** Güncel Excel verilerini görüntüleyebilir ve indirebilir.

---

## 🔐 Yetki Seviyeleri

### Admin Kullanıcı
- ✅ Dosya yükleme
- ✅ Dosya görüntüleme
- ✅ Dosya indirme
- ✅ Dosya silme

### Normal Kullanıcılar
- ❌ Dosya yükleme (Yetkisiz)
- ✅ Dosya görüntüleme
- ✅ Dosya indirme
- ❌ Dosya silme

---

## 📝 Admin için Kullanım Talimatı

### ✅ Çok Basit 3 Adım:

#### 1️⃣ Şirket Bilgisayarında
- Excel dosyasını açın
- Güncellemeleri yapın
- **"Farklı Kaydet"** ile masaüstüne kaydedin (örn: `Stok_Guncel.xlsx`)

#### 2️⃣ Web Sitesinde
- Günlük Stok veya Satış Sipariş sayfasına gidin
- **"📁 Excel Dosyası Seç"** butonuna tıklayın
- Masaüstüne kaydettiğiniz dosyayı seçin
- **"🚀 Yükle ve Güncelle"** butonuna tıklayın

#### 3️⃣ Tamamlandı!
- Dosya otomatik olarak yüklendi
- Herkes en güncel veriyi görebilir
- Dosya geçmişi saklanır

---

## 👥 Normal Kullanıcılar İçin

### Dosyaları Görüntüleme

1. **Web sitesine giriş yapın**
   - Normal kullanıcı hesabınızla giriş yapın

2. **Sayfaya gidin**
   - Günlük Stok veya Satış Sipariş sayfasını açın

3. **Verileri görün**
   - Otomatik olarak en güncel Excel verileri tablo formatında gösterilir
   - Hiçbir işlem yapmanıza gerek yok

4. **İndirme (Opsiyonel)**
   - İsterseniz dosyayı indirebilirsiniz

### ⚠️ Yükleme Yetkisi Yok

Normal kullanıcılar sayfayı açtıklarında şu mesajı görürler:

```
🔒 Dosya Yükleme Yetkisi
Yeni dosya yüklemek için admin yetkisine ihtiyacınız var.
Güncel verileri aşağıda görüntüleyebilirsiniz.
```

Bu normaldir ve bir sorun değildir. Admin kullanıcı dosyaları güncellediğinde, siz otomatik olarak en güncel verileri göreceksiniz.

---

## 📱 Detaylı Adımlar (Admin İçin)

### Günlük Stok Dosyası Güncelleme

1. **Şirket bilgisayarındaki Excel'i açın**
   ```
   - Stok.xlsx dosyasını açın
   - Güncellemelerinizi yapın
   - Kaydedin
   ```

2. **Masaüstüne kopyalayın**
   ```
   - Dosya → Farklı Kaydet
   - Konum: Masaüstü
   - Kaydet
   ```

3. **Web sitesine yükleyin**
   ```
   - https://your-site.web.app/daily-stock
   - "Excel Dosyası Seç" butonuna tıklayın
   - Masaüstündeki dosyayı seçin
   - "Yükle" butonuna tıklayın
   ```

4. **✓ Tamamlandı!**
   - Dosya yüklendi
   - Tablo otomatik güncellendi
   - Herkes görebilir

---

## 🎯 Özellikler

### ✅ Avantajlar
- **Kolay kullanım** - Sadece 3 tıklama
- **Güvenli** - Firebase'de saklanır
- **Otomatik güncelleme** - Herkes son veriyi görür
- **Dosya geçmişi** - Eski versiyonlara erişim
- **İndirme** - Dosyayı geri indirebilirsiniz

### 📋 Yetkiler
- **Herkes** → Dosyaları görüntüleyebilir
- **Giriş yapmış kullanıcılar** → Dosya yükleyebilir
- **Admin** → Dosyaları silebilir

---

## ⏰ Ne Sıklıkta Güncellenmeli?

### Önerilen Güncelleme Zamanları:

**Günlük Stok:**
- Her gün saat 09:00'da (mesai başı)
- Önemli değişikliklerde

**Satış Sipariş:**
- Her gün saat 16:00'da (mesai sonu)
- Yeni sipariş geldiğinde

---

## 🔄 Hızlı Kılavuz (Checklist)

```
☐ 1. Excel dosyasını güncelle
☐ 2. Masaüstüne kaydet
☐ 3. Web sitesine giriş yap
☐ 4. Günlük Stok/Satış Sipariş sayfasına git
☐ 5. Dosyayı seç ve yükle
☐ 6. Başarı mesajını gör ✓
```

---

## 💡 İpuçları

### Dosya İsimlendirme
- ✅ `Stok_2024_10_31.xlsx` (iyi)
- ✅ `Satis_Siparis_Guncel.xlsx` (iyi)
- ❌ `yeni yeni stok.xlsx` (kötü)

### Dosya Boyutu
- Maksimum: 10 MB
- Önerilen: 1-2 MB
- Çok büyükse: Gereksiz sayfaları silin

### Güvenlik
- Her zaman giriş yapın
- Şifrenizi kimseyle paylaşmayın
- Hassas verileri kontrol edin

---

## 🆘 Sorun Giderme

### "Dosya yüklenemiyor" hatası
- ✓ Giriş yaptınız mı?
- ✓ Dosya .xlsx veya .xls mi?
- ✓ Dosya boyutu 10MB'den küçük mü?
- ✓ İnternet bağlantınız var mı?

### "Firebase hatası" mesajı
- Firebase Storage etkin mi kontrol edin
- Tarayıcıyı yenileyin
- Tekrar giriş yapın

### Dosya görünmüyor
- Sayfayı yenileyin (F5)
- "Yenile" butonuna tıklayın
- Çıkış yapıp tekrar giriş yapın

---

## 📞 Yardım

Sorun yaşıyorsanız:
1. Bu kılavuzu tekrar okuyun
2. IT departmanına başvurun
3. Admin'e bildirin

---

## ✨ Özet

```
Şirket PC'de Excel → Masaüstüne Kaydet → Web'e Yükle → Herkes Görür!
```

**Bu kadar basit!** 🎉
