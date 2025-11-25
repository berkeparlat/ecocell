// Bu script'i bir kere çalıştırıp mevcut kullanıcılara approved: true ekleyeceksin
// Admin Panel'den veya console'dan çalıştır

import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const migrateExistingUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    let updated = 0;
    const promises = [];
    
    snapshot.forEach((userDoc) => {
      const userData = userDoc.data();
      
      // Approved alanı yoksa veya undefined ise true yap
      if (userData.approved === undefined) {
        const userRef = doc(db, 'users', userDoc.id);
        promises.push(
          updateDoc(userRef, { approved: true })
            .then(() => updated++)
        );
      }
    });
    
    await Promise.all(promises);
    
    console.log(`✅ ${updated} kullanıcı güncellendi`);
    return { success: true, updated };
  } catch (error) {
    console.error('❌ Migration hatası:', error);
    return { success: false, error: error.message };
  }
};
