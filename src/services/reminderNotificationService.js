import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { createNotification } from './notificationService';
import { calculateRemainingTime } from './reminderService';

/**
 * 24 saat içinde dolacak hatırlatıcıları kontrol et ve bildirim gönder
 */
export const checkRemindersAndNotify = async () => {
  try {
    const remindersRef = collection(db, 'reminders');
    const remindersSnapshot = await getDocs(remindersRef);
    
    const now = new Date();
    const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    for (const reminderDoc of remindersSnapshot.docs) {
      const reminder = reminderDoc.data();
      const remaining = calculateRemainingTime(reminder.createdAt, reminder.period);
      
      // 24 saat içinde dolacaksa ve daha önce bildirim gönderilmediyse
      if (remaining.days <= 1 && remaining.days >= 0) {
        const lastNotified = reminder.lastNotified ? new Date(reminder.lastNotified) : null;
        const shouldNotify = !lastNotified || (now - lastNotified) > 12 * 60 * 60 * 1000; // 12 saatte bir
        
        if (shouldNotify) {
          await createNotification({
            userId: reminder.userId,
            type: 'reminder',
            title: 'Hatırlatıcı: Yaklaşan İş',
            message: `"${reminder.title}" işi ${remaining.hours} saat içinde zamanı dolacak!`,
            actionUrl: '/reminders',
            relatedId: reminderDoc.id,
            createdBy: 'Sistem'
          });
          
          // Son bildirim zamanını güncelle
          await updateDoc(doc(db, 'reminders', reminderDoc.id), {
            lastNotified: serverTimestamp()
          });
        }
      }
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
