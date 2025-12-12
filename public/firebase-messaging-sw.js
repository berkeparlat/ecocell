// Firebase Cloud Messaging Service Worker v3.0
// Bu dosya background'da çalışır ve push notifications'ı yönetir
// Version: 3.0 - Mobile click support, better background handling

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAhMj0ljztXyusfVKLu8R8I7Kp_u8mMdlM",
  authDomain: "ecocell-5cf22.firebaseapp.com",
  projectId: "ecocell-5cf22",
  storageBucket: "ecocell-5cf22.firebasestorage.app",
  messagingSenderId: "357513489226",
  appId: "1:357513489226:web:d915b52699b588b4436fb3"
};

// App origin - bildirime tıklandığında açılacak base URL
const APP_URL = self.location.origin;

// Firebase'i başlat
firebase.initializeApp(firebaseConfig);

// Messaging instance'ı al
const messaging = firebase.messaging();

// Background mesajları dinle (uygulama kapalı veya arka planda)
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background mesaj:', payload);
  
  // Bildirim verilerini al
  const notificationTitle = payload.notification?.title || payload.data?.title || 'Ecocell Bildirim';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || '',
    icon: '/assets/app.png',
    tag: payload.data?.tag || 'ecocell-notification-' + Date.now(),
    requireInteraction: true, // Kullanıcı etkileşimine kadar bildirim kalır
    renotify: true,
    vibrate: [200, 100, 200], // Titreşim paterni
    data: {
      url: payload.data?.url || '/notifications',
      type: payload.data?.type || 'general',
      ...payload.data
    },
    actions: [
      { action: 'open', title: 'Aç' },
      { action: 'close', title: 'Kapat' }
    ]
  };

  // Bildirimi göster
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Bildirime tıklanınca - Mobile ve Desktop için optimize edildi
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Bildirime tıklandı:', event);
  
  // Bildirimi kapat
  event.notification.close();

  // Kapatma action'ına tıklandıysa hiçbir şey yapma
  if (event.action === 'close') {
    return;
  }

  // Açılacak URL'i belirle
  const notificationData = event.notification.data || {};
  const targetPath = notificationData.url || '/notifications';
  const urlToOpen = new URL(targetPath, APP_URL).href;

  event.waitUntil(
    clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    }).then((windowClients) => {
      console.log('[SW] Açık pencereler:', windowClients.length);
      
      // Uygulama zaten açıksa, o pencereyi kullan
      for (const client of windowClients) {
        const clientUrl = new URL(client.url);
        // Aynı origin'deki herhangi bir pencereyi bul
        if (clientUrl.origin === APP_URL) {
          console.log('[SW] Mevcut pencere bulundu, focus yapılıyor');
          // Sayfayı doğru URL'e yönlendir
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            url: targetPath
          });
          return client.focus();
        }
      }
      
      // Uygulama açık değilse yeni pencere aç
      console.log('[SW] Yeni pencere açılıyor:', urlToOpen);
      return clients.openWindow(urlToOpen);
    }).catch((error) => {
      console.error('[SW] Pencere açma hatası:', error);
      // Hata durumunda da yeni pencere açmayı dene
      return clients.openWindow(urlToOpen);
    })
  );
});

// Service Worker aktif olduğunda
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker aktif');
  event.waitUntil(clients.claim());
});

// Service Worker yüklendiğinde
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker yüklendi');
  self.skipWaiting();
});

// Push event - FCM dışındaki push bildirimleri için
self.addEventListener('push', (event) => {
  console.log('[SW] Push event:', event);
  
  if (event.data) {
    try {
      const data = event.data.json();
      console.log('[SW] Push data:', data);
    } catch (e) {
      console.log('[SW] Push text:', event.data.text());
    }
  }
});
