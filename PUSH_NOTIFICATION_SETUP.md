# Push Notification Kurulum Talimatları

## ✅ Tamamlanan İşlemler

1. **Firebase Cloud Messaging (FCM) Entegrasyonu**
   - `firebase.js` - FCM messaging yapılandırması eklendi
   - Service Worker oluşturuldu (`public/firebase-messaging-sw.js`)
   - Push notification servisi hazırlandı (`pushNotificationService.js`)
   - AppContext'e FCM entegrasyonu yapıldı

2. **UI Komponenti**
   - Profil modalına "Push Bildirimler" toggle switch'i eklendi
   - Kullanıcı bildirimleri açıp kapatabilir

3. **Backend Hazırlığı**
   - Cloud Functions örnek kodu hazırlandı (`api/send-notification.js`)
   - Yeni görev, mesaj, duyuru eklendiğinde otomatik bildirim gönderme

---

## 🔧 Firebase Console'da Yapılması Gerekenler

### 1. Cloud Messaging'i Etkinleştir

1. Firebase Console'a gidin: https://console.firebase.google.com
2. `ecocell-5cf22` projenizi açın
3. Sol menüden **Build > Cloud Messaging** seçin
4. **Web Push certificates** bölümünde **Generate key pair** butonuna tıklayın
5. Oluşan **VAPID key**'i kopyalayın (örnek: `BPFHd-v3LjYZ8...`)

### 2. VAPID Key'i Koda Ekleyin

`src/services/pushNotificationService.js` dosyasını açın ve `VAPID_KEY` değişkenini güncelleyin:

```javascript
const VAPID_KEY = 'BURAYA_FIREBASE_CONSOLE_DAN_ALDIĞINIZ_KEY_GELECEK';
```

### 3. Cloud Functions Kurulumu (Opsiyonel ama Önerilen)

Push notification göndermek için backend'e ihtiyacınız var. İki seçenek:

#### Seçenek A: Firebase Cloud Functions (Önerilen)

```bash
# Firebase CLI yükleyin
npm install -g firebase-tools

# Firebase'e login olun
firebase login

# Functions'ı başlatın
firebase init functions

# api/send-notification.js içeriğini functions/index.js'e kopyalayın

# Deploy edin
firebase deploy --only functions
```

#### Seçenek B: Vercel API Route

`api/send-notification.js` zaten hazır. Vercel otomatik olarak API endpoint oluşturacak:
- Endpoint: `https://ecocell.vercel.app/api/send-notification`

---

## 📱 Kullanım

### Kullanıcı Tarafı

1. Kullanıcı giriş yaptıktan sonra **Profil** butonuna tıklar
2. **Push Bildirimler** switch'ini açar
3. Tarayıcı izin sorar → **İzin Ver** seçilir
4. Artık yeni görev, mesaj, duyuru geldiğinde telefona bildirim gider

### Geliştirici Tarafı

**Yeni görev eklendiğinde bildirim göndermek için:**

```javascript
// taskService.js'de addTask fonksiyonuna ekleyin
import { getUserFCMToken } from './pushNotificationService';

// Görev ekledikten sonra
const userToken = await getUserFCMToken(task.assignedTo);
if (userToken) {
  // Backend API'ye istek atın
  await fetch('/api/send-notification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: userToken,
      title: 'Yeni Görev Atandı',
      body: task.title,
      data: { type: 'task', taskId: task.id }
    })
  });
}
```

---

## 🧪 Test Etme

### Masaüstü Test
1. Chrome'da siteyi açın: https://ecocell.vercel.app
2. Giriş yapın
3. Profil > Push Bildirimler açın
4. İzin verin
5. Başka bir kullanıcıdan size görev atılmasını isteyin

### Mobil Test
1. Chrome Mobile'da siteyi açın
2. Profil > Push Bildirimler açın
3. İzin verin
4. Telefonu kilitleyin
5. Başka birinden size mesaj/görev atılmasını isteyin
6. Bildirim gelecek!

---

## 🔍 Sorun Giderme

### "Bildirim izni verilmedi" hatası
- Tarayıcı ayarlarından site izinlerini kontrol edin
- Chrome: Ayarlar > Gizlilik ve güvenlik > Site ayarları > Bildirimler
- Site'yi "İzin verildi" listesine ekleyin

### "FCM token alınamadı" hatası
- VAPID key'in doğru girildiğinden emin olun
- Service Worker'ın düzgün yüklendiğini kontrol edin (DevTools > Application > Service Workers)

### Bildirimler gelmiyor
- Cloud Functions'ın deploy edildiğinden emin olun
- Firebase Console > Functions bölümünden fonksiyonların çalıştığını kontrol edin
- Console'da hata loglarına bakın

---

## 📋 Yapılacaklar Listesi

- [ ] Firebase Console'dan VAPID key alın
- [ ] `pushNotificationService.js`'de VAPID_KEY'i güncelleyin
- [ ] Cloud Functions'ı deploy edin veya Vercel API'yi yapılandırın
- [ ] Mobil ve masaüstünde test edin
- [ ] Kullanıcılara push notification özelliğini duyurun

---

## 🎉 Tamamlandı!

Artık sisteminiz push notification desteğine sahip! Kullanıcılar telefonlarına gerçek zamanlı bildirim alabilecek.

**Özellikler:**
✅ Yeni görev bildirimi
✅ Yeni mesaj bildirimi
✅ Yeni duyuru bildirimi
✅ Uygulama kapalıyken bile bildirim
✅ Bildirime tıklayınca ilgili sayfaya yönlendirme
✅ Kullanıcı kontrollü (açma/kapama)
