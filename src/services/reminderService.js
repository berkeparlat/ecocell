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
  getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';

const REMINDERS_COLLECTION = 'reminders';

/**
 * Hatırlatıcıları gerçek zamanlı dinle
 */
export const listenToReminders = (userId, callback) => {
  const remindersRef = collection(db, REMINDERS_COLLECTION);
  const q = query(
    remindersRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const reminders = [];
    querySnapshot.forEach((doc) => {
      reminders.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString(),
        lastNotified: doc.data().lastNotified?.toDate().toISOString() || null
      });
    });
    callback(reminders);
  }, () => {
    callback([]);
  });
};

/**
 * Yeni hatırlatıcı ekle
 */
export const addReminder = async (reminderData, userId) => {
  try {
    const docRef = await addDoc(collection(db, REMINDERS_COLLECTION), {
      ...reminderData,
      userId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastNotified: null
    });
    
    return { 
      success: true, 
      reminderId: docRef.id,
      reminder: {
        id: docRef.id,
        ...reminderData,
        createdAt: new Date().toISOString()
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Hatırlatıcıyı güncelle
 */
export const updateReminder = async (reminderId, updates) => {
  try {
    const reminderRef = doc(db, REMINDERS_COLLECTION, reminderId);
    await updateDoc(reminderRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Hatırlatıcıyı sil
 */
export const deleteReminder = async (reminderId) => {
  try {
    await deleteDoc(doc(db, REMINDERS_COLLECTION, reminderId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Hatırlatıcının bir sonraki tarihini hesapla
 */
export const calculateNextDate = (createdDate, period, specificDate = null) => {
  // Tek seferlik hatırlatıcı için
  if (period === 'once' && specificDate) {
    return new Date(specificDate);
  }
  
  const created = new Date(createdDate);
  const now = new Date();
  
  let nextDate = new Date(created);
  
  const addPeriod = (date, periodType) => {
    const result = new Date(date);
    switch (periodType) {
      case 'daily':
        result.setDate(result.getDate() + 1);
        break;
      case 'weekly':
        result.setDate(result.getDate() + 7);
        break;
      case 'monthly':
        result.setMonth(result.getMonth() + 1);
        break;
      case 'quarterly':
        result.setMonth(result.getMonth() + 3);
        break;
      case 'semi-annual':
        result.setMonth(result.getMonth() + 6);
        break;
      case '9-months':
        result.setMonth(result.getMonth() + 9);
        break;
      case 'annual':
        result.setFullYear(result.getFullYear() + 1);
        break;
      default:
        result.setDate(result.getDate() + 1);
    }
    return result;
  };
  
  // Şu anki tarihten sonraki bir sonraki hatırlatma tarihini bul
  while (nextDate <= now) {
    nextDate = addPeriod(nextDate, period);
  }
  
  return nextDate;
};

/**
 * Kalan süreyi hesapla ve formatla
 */
export const calculateRemainingTime = (createdDate, period, specificDate = null) => {
  const nextDate = calculateNextDate(createdDate, period, specificDate);
  const now = new Date();
  const diff = nextDate - now;
  
  if (diff <= 0) {
    return { text: 'Şimdi!', status: 'urgent', days: 0 };
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  let text = '';
  let status = 'safe';
  
  if (days > 0) {
    text = `${days} gün`;
    if (hours > 0) text += ` ${hours} saat`;
    status = days <= 3 ? 'warning' : 'safe';
  } else if (hours > 0) {
    text = `${hours} saat`;
    if (minutes > 0) text += ` ${minutes} dakika`;
    status = 'warning';
  } else {
    text = `${minutes} dakika`;
    status = 'urgent';
  }
  
  return { text, status, days };
};

/**
 * Periyot gösterim metni
 */
export const getPeriodText = (period) => {
  const periodMap = {
    'daily': 'Günlük',
    'weekly': 'Haftalık',
    'monthly': 'Aylık',
    'quarterly': '3 Aylık',
    'semi-annual': '6 Aylık',
    '9-months': '9 Aylık',
    'annual': 'Yıllık',
    'once': 'Tek Seferlik'
  };
  return periodMap[period] || period;
};
