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
    return permission === 'granted';
  } catch (error) {
    return false;
  }
};

/**
 * FCM token al ve Firestore'a kaydet
 */
export const getFCMToken = async (userId) => {
  try {
    if (!messaging) return null;

    const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
    
    if (currentToken) {
      await setDoc(doc(db, 'users', userId), {
        fcmToken: currentToken,
        notificationsEnabled: true,
        lastTokenUpdate: new Date()
      }, { merge: true });

      return currentToken;
    }
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Foreground mesajları dinle (uygulama açıkken)
 * NOT: Service Worker zaten bildirim gösteriyor, burada tekrar göstermeye gerek yok
 */
export const onMessageListener = (callback) => {
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    if (callback) callback(payload);
  });
};

/**
 * Kullanıcının FCM token'ını al
 */
export const getUserFCMToken = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data().fcmToken || null;
    }
    return null;
  } catch (error) {
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
    return false;
  }
};

