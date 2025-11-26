import { messaging } from '../config/firebase';
import { getToken } from 'firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// VAPID key - Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
const VAPID_KEY = 'BKxF8vR_wF9LYvlO3dN_4vQzqBJlH8pYzN9wE7Kf3xMjYbQ8vH9sL2aR5nT6wC4pD1fG3hJ7kN8mV9xZ2bA5cE6';

/**
 * Push notification izni iste ve token al
 * @param {string} userId - Kullanıcı ID'si
 * @returns {Promise<string|null>} FCM token veya null
 */
export const requestNotificationPermission = async (userId) => {
  try {
    // Service Worker desteği kontrolü
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker desteklenmiyor');
      return null;
    }

    // Notification API desteği kontrolü
    if (!('Notification' in window)) {
      console.log('Notification API desteklenmiyor');
      return null;
    }

    // Messaging desteği kontrolü
    if (!messaging) {
      console.log('Firebase Messaging desteklenmiyor');
      return null;
    }

    // Bildirim izni durumunu kontrol et
    let permission = Notification.permission;

    // İzin verilmemişse iste
    if (permission === 'default') {
      console.log('Bildirim izni isteniyor...');
      permission = await Notification.requestPermission();
    }

    // İzin reddedildiyse
    if (permission === 'denied') {
      console.log('Bildirim izni reddedildi');
      return null;
    }

    // İzin verildiyse token al
    if (permission === 'granted') {
      console.log('Bildirim izni verildi, token alınıyor...');
      
      try {
        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY
        });

        if (token) {
          console.log('FCM Token alındı:', token);
          
          // Token'ı Firestore'a kaydet
          await saveFCMToken(userId, token);
          
          return token;
        } else {
          console.log('Token alınamadı');
          return null;
        }
      } catch (tokenError) {
        console.error('Token alma hatası:', tokenError);
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error('Bildirim izni hatası:', error);
    return null;
  }
};

/**
 * FCM Token'ı Firestore'a kaydet
 * @param {string} userId - Kullanıcı ID'si
 * @param {string} token - FCM token
 */
const saveFCMToken = async (userId, token) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      fcmToken: token,
      fcmTokenUpdatedAt: new Date().toISOString()
    }, { merge: true });
    
    console.log('FCM Token Firestore\'a kaydedildi');
  } catch (error) {
    console.error('FCM Token kaydetme hatası:', error);
  }
};

/**
 * Bildirim izninin verilip verilmediğini kontrol et
 * @returns {boolean}
 */
export const hasNotificationPermission = () => {
  return 'Notification' in window && Notification.permission === 'granted';
};

/**
 * PWA olarak yüklenip yüklenmediğini kontrol et
 * @returns {boolean}
 */
export const isPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone === true;
};
