# Mesajlaşma Özelliği - Firebase Kurulum Adımları

## 🔥 Firestore Kurallarını Güncelleme

Mesajlaşma özelliğinin çalışması için Firestore güvenlik kurallarını güncellemeniz gerekmektedir.

### Adımlar:

1. **Firebase Console'a gidin**: https://console.firebase.google.com/
2. Projenizi seçin
3. Sol menüden **Firestore Database** seçeneğine tıklayın
4. **Rules** (Kurallar) sekmesine geçin
5. Aşağıdaki kuralları kopyalayıp yapıştırın:

```plaintext
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Tasks koleksiyonu
    match /tasks/{taskId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null 
                    && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null 
                            && resource.data.userId == request.auth.uid;
    }
    
    // Users koleksiyonu
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Messages koleksiyonu
    match /messages/{messageId} {
      allow create: if request.auth != null 
                    && request.resource.data.senderId == request.auth.uid;
      allow read: if request.auth != null 
                  && (resource.data.recipientId == request.auth.uid 
                      || resource.data.senderId == request.auth.uid);
      allow update: if request.auth != null 
                    && resource.data.recipientId == request.auth.uid;
      allow delete: if request.auth != null 
                    && resource.data.recipientId == request.auth.uid;
    }
    
    // Diğer tüm koleksiyonları engelle
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

6. **Publish** (Yayınla) butonuna tıklayın

## 📝 Mesajlaşma Özellikleri

### Yapabilecekleriniz:
- ✅ Kullanıcılara mesaj gönderme
- ✅ Gelen mesajları görüntüleme
- ✅ Okundu/Okunmadı durumu
- ✅ Mesaj konusu ve içeriği
- ✅ Gerçek zamanlı mesaj bildirimleri
- ✅ Tarih ve saat bilgisi

### Güvenlik:
- Kullanıcılar sadece kendilerine gelen mesajları görebilir
- Mesaj gönderen kişi olarak sadece kendi kullanıcı ID'niz kaydedilir
- Mesajlar şifrelenmiş ve güvenli şekilde saklanır

## 🎯 Kullanım

1. Ana menüden **Mesajlar** kutucuğuna tıklayın
2. **Yeni Mesaj** butonuna tıklayın
3. Alıcıyı seçin, konu ve mesajı yazın
4. **Gönder** butonuna tıklayın
5. Gelen mesajlar otomatik olarak görünecektir

## ⚠️ Önemli Not

Firestore kurallarını güncellemezseniz mesajlaşma özelliği çalışmayacaktır!
