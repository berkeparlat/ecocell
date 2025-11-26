import { getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, messaging } from '../config/firebase';

// VAPID Key - Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
// Bu key'i Firebase Console'dan almanız gerekiyor
const VAPID_KEY = 'BGMWU6MmuQK54T602e6eyylHOrxJJ_3keIb5orXBStscExnhvjaYHJMJ4FS5W2wGMIGme84163cRz_t7mjYjDE4'; // TODO: Firebase Console'dan alınacak

/**
 * Kullanıcıdan push notification izni iste
 */
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    console.log('Bildirim izni:', permission);
    return permission === 'granted';
  } catch (error) {
    console.error('Bildirim izni hatası:', error);
    return false;
  }
};

/**
 * FCM token al ve Firestore'a kaydet
 */
export const getFCMToken = async (userId) => {
  try {
    if (!messaging) {
      console.log('Messaging desteklenmiyor');
      return null;
    }

    const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
    
    if (currentToken) {
      console.log('FCM Token alındı:', currentToken);
      
      // Token'ı Firestore'da kullanıcı dokümanına kaydet
      await setDoc(doc(db, 'users', userId), {
        fcmToken: currentToken,
        notificationsEnabled: true,
        lastTokenUpdate: new Date()
      }, { merge: true });

      return currentToken;
    } else {
      console.log('FCM token alınamadı. İzin verilmemiş olabilir.');
      return null;
    }
  } catch (error) {
    console.error('FCM token alma hatası:', error);
    return null;
  }
};

/**
 * Foreground mesajları dinle (uygulama açıkken)
 */
export const onMessageListener = (callback) => {
  if (!messaging) {
    console.log('Messaging desteklenmiyor');
    return () => {};
  }

  return onMessage(messaging, (payload) => {
    console.log('Foreground mesaj alındı:', payload);
    
    // Callback'e mesajı gönder
    if (callback) {
      callback(payload);
    }

    // Tarayıcı bildirimi göster
    if (Notification.permission === 'granted') {
      new Notification(payload.notification?.title || 'Yeni Bildirim', {
        body: payload.notification?.body || '',
        icon: '/logo.png',
        badge: '/logo.png',
        tag: payload.data?.type || 'default',
        data: payload.data || {}
      });
    }
  });
};

/**
 * Kullanıcının FCM token'ını al
 */
export const getUserFCMToken = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.fcmToken || null;
    }
    return null;
  } catch (error) {
    console.error('FCM token okuma hatası:', error);
    return null;
  }
};

/**
 * Bildirimleri devre dışı bırak
 */
export const disableNotifications = async (userId) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      notificationsEnabled: false,
      fcmToken: null
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('Bildirim kapatma hatası:', error);
    return false;
  }
};

/**
 * Bildirimleri aktif et
 */
export const enableNotifications = async (userId) => {
  try {
    const hasPermission = await requestNotificationPermission();
    
    if (hasPermission) {
      const token = await getFCMToken(userId);
      return token !== null;
    }
    
    return false;
  } catch (error) {
    console.error('Bildirim açma hatası:', error);
    return false;
  }
};

/**
 * Push notification gönder (Backend'den çağrılacak - örnek kod)
 * NOT: Bu fonksiyon client-side'dan çalışmaz, Firebase Admin SDK ile backend'de çalıştırılmalı
 */
export const sendPushNotification = async (userToken, title, body, data = {}) => {
  // Bu fonksiyon örnek amaçlı - gerçekte Firebase Cloud Functions veya backend'de çalışmalı
  console.log('Push notification göndermek için backend API kullanın');
  console.log('Token:', userToken);
  console.log('Title:', title);
  console.log('Body:', body);
  console.log('Data:', data);
  
  // Firebase Cloud Functions veya backend API'ye istek atılacak
  // Örnek:
  // const response = await fetch('/api/send-notification', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ token: userToken, title, body, data })
  // });
};
