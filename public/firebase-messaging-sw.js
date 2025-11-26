// Firebase Cloud Messaging Service Worker v2.0
// Bu dosya background'da çalışır ve push notifications'ı yönetir
// Version: 2.0 - Fixed duplicate notifications

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

// Firebase'i başlat
firebase.initializeApp(firebaseConfig);

// Messaging instance'ı al
const messaging = firebase.messaging();

// Background mesajları dinle (uygulama kapalı veya arka planda)
// NOT: Firebase otomatik olarak notification gösteriyor
// Manuel showNotification çağrısı yapmaya gerek yok, çift bildirim olur
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background mesaj alındı:', payload);
  
  // Firebase otomatik olarak bildirimi gösteriyor
  // Burada sadece log tutuyoruz veya özel işlemler yapabiliriz
  // Örnek: localStorage'a kaydetme, badge sayısını güncelleme vb.
});

// Bildirime tıklanınca
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Bildirime tıklandı:', event.notification);
  
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Zaten açık bir sekme varsa onu kullan
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Yoksa yeni sekme aç
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
