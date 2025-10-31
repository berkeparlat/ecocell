# 🔥 Firestore Güvenlik Kuralları Güncelleme

## ⚠️ Birimler Kaydedilememe Sorunu Çözümü

"Birimler Kaydet" butonu çalışmıyorsa, Firestore güvenlik kurallarını güncellemeniz gerekiyor.

---

## 📋 Güncellenmiş Firestore Rules

Firebase Console → Firestore Database → Rules sekmesine gidin ve aşağıdaki kuralları yapıştırın:

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
    
    // Birimler koleksiyonu (YENİ!)
    match /meta/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

## ✅ Değişiklikler:

### Eklenen Bölüm:
```javascript
// Birimler koleksiyonu (YENİ!)
match /meta/{document} {
  allow read: if request.auth != null;
  allow write: if request.auth != null;
  allow create: if request.auth != null;
}
```

Bu kural, giriş yapmış kullanıcıların `meta` koleksiyonundaki (örn: `meta/departments`) dokümanları okuyabilmesini, yazabilmesini ve oluşturabilmesini sağlar.

---

## 🚀 Adım Adım Güncelleme

### 1. Firebase Console'a Gidin
```
https://console.firebase.google.com/project/ecocell-5cf22/firestore/rules
```

### 2. Rules Sekmesini Açın
- Sol menüden: **Firestore Database**
- Üst menüden: **Rules** sekmesi

### 3. Yukarıdaki Kuralları Yapıştırın
- Mevcut kuralları silin
- Yukarıdaki güncellenmiş kuralları yapıştırın

### 4. Publish Butonuna Tıklayın
- Sağ üstteki **"Publish"** butonuna tıklayın
- Kurallar aktif olacak

---

## 🧪 Test Edin

### 1. Uygulamayı Yenileyin
```
F5 veya Ctrl+R
```

### 2. Admin Panel'e Gidin
```
Ana Menü → Admin Panel
```

### 3. Birim Ekleyin
```
1. "Yeni Birim Ekle" alanına birim adı yazın
2. "Ekle" butonuna tıklayın
3. "Kaydet" butonuna tıklayın
```

### 4. Kontrol Edin
```
✅ "Birimler başarıyla güncellendi!" mesajı görmelisiniz
✅ Firebase Console → Firestore Database'de "meta/departments" görünmeli
```

---

## 🔍 Sorun Devam Ederse

### Console'u Kontrol Edin:

1. **Tarayıcıda:** F12 tuşuna basın
2. **Console sekmesini** açın
3. **Kırmızı hata mesajları** var mı?

### Olası Hatalar:

#### "Missing or insufficient permissions"
- ✓ Firestore Rules güncellenmiş mi?
- ✓ "Publish" butonuna tıkladınız mı?
- ✓ Giriş yapmış mısınız?

#### "auth/operation-not-allowed"
- ✓ Firebase Authentication aktif mi?
- ✓ Email/Password provider enable mi?

#### "firestore/unavailable"
- ✓ İnternet bağlantınız var mı?
- ✓ Firebase Console'da Firestore aktif mi?

---

## 📊 Firebase Console'da Kontrol

### Manuel Oluşturma (Opsiyonel):

Eğer otomatik oluşmazsa, manuel olarak oluşturabilirsiniz:

```
1. Firebase Console → Firestore Database
2. "Start collection" butonuna tıklayın
3. Collection ID: "meta"
4. Document ID: "departments"
5. Field ekleyin:
   - Field: "list"
   - Type: "array"
   - Value: ["Elektrik", "Mekanik", "Yönetim"] (örnekler)
6. "Save" butonuna tıklayın
```

---

## ✅ Başarı Kriterleri

Güncelleme başarılı olduğunda:

- ✅ Birim ekleyebilirsiniz
- ✅ Birim silebilirsiniz
- ✅ "Kaydet" butonu çalışır
- ✅ Firebase Console'da `meta/departments` dokümanı görünür
- ✅ Kullanıcı kayıt sayfasında birimler dropdown'da görünür

---

## 🎯 Özet

```
Problem: Birimler kaydedilemiyor
Sebep: Firestore Rules'da "meta" koleksiyonu yok
Çözüm: Yukarıdaki kuralları ekleyin ve "Publish" edin
```

**İyi çalışmalar!** 🚀
