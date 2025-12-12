import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';

const NOTIFICATIONS_COLLECTION = 'notifications';

/**
 * Bildirim oluştur
 * @param {Object} notificationData - Bildirim verisi
 * @param {string} notificationData.userId - Bildirimi alacak kullanıcı ID
 * @param {string} notificationData.type - Bildirim tipi: 'task', 'message', 'announcement', 'workPermit'
 * @param {string} notificationData.title - Bildirim başlığı
 * @param {string} notificationData.message - Bildirim mesajı
 * @param {string} notificationData.actionUrl - Tıklandığında gidilecek URL (opsiyonel)
 * @param {string} notificationData.relatedId - İlişkili kayıt ID (task, message id vs.)
 * @param {string} notificationData.createdBy - Bildirimi oluşturan kullanıcı adı
 */
export const createNotification = async (notificationData) => {
  try {
    const notification = {
      ...notificationData,
      read: false,
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), notification);
    return { success: true, notificationId: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Birime özel bildirim gönder
 * Belirtilen departmandaki tüm kullanıcılara bildirim oluşturur
 */
export const createNotificationForDepartment = async (department, notificationData) => {
  try {
    // Departmandaki tüm kullanıcıları al
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('department', '==', department));
    const snapshot = await getDocs(q);
    
    // Her kullanıcı için bildirim oluştur
    const batch = writeBatch(db);
    const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
    
    snapshot.forEach((userDoc) => {
      const userData = userDoc.data();
      
      // Silinen kullanıcılara bildirim gönderme
      if (userData.deleted) return;
      
      const notificationRef = doc(notificationsRef);
      batch.set(notificationRef, {
        userId: userDoc.id,
        ...notificationData,
        read: false,
        createdAt: serverTimestamp()
      });
    });
    
    await batch.commit();
    return { success: true, count: snapshot.size };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Kullanıcının bildirimlerini dinle (real-time)
 */
export const listenToNotifications = (userId, callback) => {
  const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const notifications = [];
    snapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
      });
    });
    callback(notifications);
  }, () => {
    callback([]);
  });
};

/**
 * Bildirimi okundu olarak işaretle
 */
export const markAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Tüm bildirimleri okundu olarak işaretle
 */
export const markAllAsRead = async (userId) => {
  try {
    const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    snapshot.forEach((document) => {
      batch.update(document.ref, {
        read: true,
        readAt: serverTimestamp()
      });
    });
    
    await batch.commit();
    return { success: true, count: snapshot.size };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Bildirimi sil
 */
export const deleteNotification = async (notificationId) => {
  try {
    await deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Tüm bildirimleri sil
 */
export const deleteAllNotifications = async (userId) => {
  try {
    const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
    const q = query(notificationsRef, where('userId', '==', userId));
    
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    snapshot.forEach((document) => {
      batch.delete(document.ref);
    });
    
    await batch.commit();
    return { success: true, count: snapshot.size };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Okunmamış bildirim sayısını al
 */
export const getUnreadCount = (notifications) => {
  return notifications.filter(n => !n.read).length;
};
