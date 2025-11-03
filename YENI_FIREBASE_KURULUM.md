# 🔥 Yeni Firebase Projesi Kurulum Rehberi

## ✅ Firebase Config Güncellendi!

**Yeni Proje ID:** `ecocell-5cf22` (Blaze Plan - Ücretli)

---

## 📋 ŞİMDİ YAPMANIZ GEREKENLER

### 1️⃣ Firebase Authentication'ı Etkinleştirin

```
1. https://console.firebase.google.com/project/ecocell-5cf22
2. Sol menü → Build → Authentication
3. "Get Started" butonuna tıklayın
4. Sign-in method → Email/Password
5. "Enable" aktif edin
6. "Save" butonuna tıklayın
```

✅ **Tamamlandı mı?** → Bir sonraki adıma geçin

---

### 2️⃣ Firestore Database'i Etkinleştirin

```
1. Sol menü → Build → Firestore Database
2. "Create database" butonuna tıklayın
3. "Start in production mode" seçin
4. Location: "eur3 (europe-west)" seçin
5. "Enable" butonuna tıklayın
```

#### Güvenlik Kurallarını Ayarlayın

Firestore → Rules sekmesine gidin ve aşağıdaki kuralları yapıştırın:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Kullanıcılar koleksiyonu
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
    }
    
    // Görevler koleksiyonu
    match /tasks/{taskId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
      allow create: if request.auth != null;
      allow delete: if request.auth != null;
    }
    
    // Mesajlar koleksiyonu
    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    // Birimler koleksiyonu
    match /departments/{departmentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

**"Publish" butonuna tıklayın!**

✅ **Tamamlandı mı?** → Bir sonraki adıma geçin

---

### 3️⃣ Firebase Storage'ı Etkinleştirin

```
1. Sol menü → Build → Storage
2. "Get Started" butonuna tıklayın
3. "Start in production mode" seçin
4. Location: "eur3 (europe-west)" seçin
5. "Done" butonuna tıklayın
```

#### Güvenlik Kurallarını Ayarlayın

Storage → Rules sekmesine gidin ve aşağıdaki kuralları yapıştırın:

```javascript
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

**"Publish" butonuna tıklayın!**

✅ **Tamamlandı mı?** → Bir sonraki adıma geçin

---

### 4️⃣ Admin Kullanıcı Oluşturun

#### Yerel Ortamda Test Edin:

```powershell
cd c:\Users\Otomasyon\Desktop\ecocell
npm run dev

```

#### Tarayıcıda Kayıt Olun:

```
1. http://localhost:5173 adresine gidin
2. "Kayıt Ol" butonuna tıklayın
3. Admin hesabı oluşturun:
   - İsim: Admin
   - Email: berke.parlat27@gmail.com
   - Şifre: (güçlü bir şifre)
   - Birim: Yönetim
4. "Kayıt Ol" butonuna tıklayın
```

✅ **Tamamlandı mı?** → Bir sonraki adıma geçin

---

### 5️⃣ Test Edin

#### a) Dashboard Testi
```
1. Giriş yapın: berke.parlat27@gmail.com
2. Dashboard sayfasını kontrol edin
3. İstatistiklerin görüntülendiğini onaylayın
```

#### b) Admin Panel Testi
```
1. Ana Menü → Admin Panel
2. Kullanıcıları görebildiğinizi onaylayın
3. Birim ekleyebildiğinizi test edin
```

#### c) Excel Yönetimi Testi
```
1. Ana Menü → Günlük Stok
2. Excel dosyası yükleyin
3. Tablonun görüntülendiğini onaylayın
4. İndirme özelliğini test edin
```

✅ **Tamamlandı mı?** → Deploy aşamasına geçin

---

## 🚀 Vercel'e Deploy

### Değişiklikleri Yükleyin:

```powershell
cd c:\Users\Otomasyon\Desktop\ecocell
git add src/config/firebase.js
git commit -m "Yeni Firebase projesi yapılandırması (ecocell-5cf22)"
git push origin main
```

**Vercel otomatik olarak yeni kodu deploy edecek!**

---

## 📊 Eski Firebase'den Veri Taşıma (Opsiyonel)

### Kullanıcıları Taşıma

Eğer eski Firebase'deki kullanıcıları taşımak isterseniz:

```
1. Eski Proje (ecocell-8d794):
   - Authentication → Users → Export Users (CSV veya JSON)

2. Yeni Proje (ecocell-5cf22):
   - Authentication → Users → Import Users
   - Dosyayı yükleyin
```

### Firestore Verilerini Taşıma

```
1. Eski Proje:
   - Firestore Database → Import/Export
   - Export Data

2. Yeni Proje:
   - Firestore Database → Import/Export
   - Import Data
```

### Excel Dosyalarını Taşıma

Eski dosyaları indirip yeni projeye manuel olarak yükleyin.

---

## ✅ Kurulum Tamamlandı mı?

### Kontrol Listesi:

- ✅ Authentication aktif
- ✅ Firestore Database aktif (güvenlik kuralları ayarlı)
- ✅ Storage aktif (güvenlik kuralları ayarlı)
- ✅ Admin kullanıcı oluşturuldu
- ✅ Yerel ortamda test edildi
- ✅ Vercel'e deploy edildi

---

## 🎉 TEBRİKLER!

Sisteminiz yeni Firebase projesiyle çalışıyor!

**Yeni Proje Bilgileri:**
- Project ID: `ecocell-5cf22`
- Plan: Blaze (Ücretli)
- Location: europe-west
- Admin: berke.parlat27@gmail.com

---

## 🆘 Sorun mu Yaşıyorsunuz?

### Hata: "Firebase: Error (auth/...)"
- Authentication servisinin aktif olduğunu kontrol edin
- Email/Password provider'ın enable olduğunu kontrol edin

### Hata: "Missing or insufficient permissions"
- Firestore güvenlik kurallarını kontrol edin
- Rules'u yukarıdaki gibi güncelleyin

### Hata: "Storage: unauthorized"
- Storage güvenlik kurallarını kontrol edin
- Rules'u yukarıdaki gibi güncelleyin

---

## 📞 Destek

Herhangi bir sorun için:
- Firebase Console: https://console.firebase.google.com/project/ecocell-5cf22
- Vercel Dashboard: https://vercel.com/

**İyi çalışmalar!** 🚀
