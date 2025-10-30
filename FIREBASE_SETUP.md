# Firebase Kurulum Rehberi

## 1. Firebase Projesi Oluşturma

1. [Firebase Console](https://console.firebase.google.com/) adresine gidin
2. "Add project" veya "Proje ekle" butonuna tıklayın
3. Proje adını girin (örn: "ecocell-task-manager")
4. Google Analytics'i isteğe bağlı olarak etkinleştirin
5. Projeyi oluşturun

## 2. Firebase Authentication Ayarları

1. Sol menüden **Authentication** seçeneğine tıklayın
2. **Get Started** butonuna tıklayın
3. **Sign-in method** sekmesine gidin
4. **Email/Password** seçeneğini etkinleştirin
5. Kaydet

## 3. Firestore Database Ayarları

1. Sol menüden **Firestore Database** seçeneğine tıklayın
2. **Create database** butonuna tıklayın
3. **Start in test mode** seçin (geliştirme için)
4. Lokasyon seçin (Europe-west veya sizin bölgeniz)
5. Enable

### Firestore Güvenlik Kuralları (Production için)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Tasks koleksiyonu
    match /tasks/{taskId} {
      // Herkes okuyabilir, sadece giriş yapmış kullanıcılar yazabilir
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }
    
    // Diğer tüm koleksiyonları engelle
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 4. Web App Yapılandırması

1. Firebase Console'da proje ayarlarına gidin (⚙️ ikonu)
2. "Your apps" bölümünde **Web** ikonuna (</>)  tıklayın
3. App nickname girin (örn: "Ecocell Web App")
4. **Register app** butonuna tıklayın
5. Firebase configuration bilgilerini kopyalayın

## 5. Environment Variables Ayarlama

1. Projenizde `.env.local` dosyasını açın
2. Firebase Console'dan aldığınız bilgileri yapıştırın:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

3. `src/config/firebase.js` dosyasını güncelleyin:

```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

## 6. Test Kullanıcısı Oluşturma

1. Firebase Console'da **Authentication** > **Users** sekmesine gidin
2. **Add user** butonuna tıklayın
3. Email ve şifre girin
4. Test için giriş yapın

## 7. Uygulamayı Başlatma

```bash
npm run dev
```

## Önemli Notlar

⚠️ **GÜVENLİK:**
- `.env.local` dosyasını asla Git'e eklemeyin
- Production'da Firestore güvenlik kurallarını mutlaka güncelleyin
- API anahtarlarınızı kimseyle paylaşmayın

📝 **YAPILACAKLAR:**
- [ ] Firebase Console'dan proje oluştur
- [ ] Authentication'ı etkinleştir
- [ ] Firestore Database oluştur
- [ ] Web app kaydı yap
- [ ] `.env.local` dosyasını doldur
- [ ] `firebase.js` dosyasını güncelle
- [ ] Test kullanıcısı oluştur
- [ ] Uygulamayı test et

## Firestore Veri Yapısı

### Tasks Koleksiyonu

```javascript
{
  id: "auto-generated",
  title: "İş adı",
  createdBy: "kullanıcı adı",
  relatedDepartment: "Üretim",
  requiredDepartments: ["Kalite Kontrol", "Ar-Ge"],
  description: "İş açıklaması",
  status: "new" | "in-progress" | "done",
  progress: "İlerleme açıklaması",
  notes: "Notlar",
  priority: "low" | "medium" | "high",
  dueDate: "2025-10-26",
  userId: "firebase-user-id",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Destek

Sorun yaşarsanız:
1. Firebase Console'da logları kontrol edin
2. Tarayıcı console'unu kontrol edin
3. Firestore kurallarını kontrol edin
4. `.env.local` dosyasının doğru doldurulduğundan emin olun
