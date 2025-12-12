import { db } from '../config/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

/**
 * File-watcher'ı manuel olarak tetikler
 * File-watcher Firebase'de meta/fileWatcherTrigger dokümanını dinler
 */
export const triggerFileWatcher = async () => {
  try {
    const triggerRef = doc(db, 'meta', 'fileWatcherTrigger');
    await updateDoc(triggerRef, {
      trigger: true,
      triggeredAt: serverTimestamp(),
      triggeredBy: 'manual'
    });
    return { success: true };
  } catch (error) {
    
    return { success: false, error: error.message };
  }
};
