import { db } from '../config/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';

const WORK_PERMITS_COLLECTION = 'workPermits';

export const listenToWorkPermits = (callback) => {
  const q = query(collection(db, WORK_PERMITS_COLLECTION), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const permits = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(permits);
    },
    (error) => {
      callback([]);
    }
  );
};

export const addWorkPermit = async (permitData, userId, userName) => {
  try {
    const permitWithTimestamp = {
      ...permitData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      userId,
    };

    const docRef = await addDoc(collection(db, WORK_PERMITS_COLLECTION), permitWithTimestamp);

    // Bildirim Firebase Functions tarafindan gonderiliyor (sendNotificationOnWorkPermitCreate)

    return {
      success: true,
      permit: {
        id: docRef.id,
        ...permitData,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const updateWorkPermit = async (permitId, updates) => {
  try {
    const permitRef = doc(db, WORK_PERMITS_COLLECTION, permitId);
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(permitRef, updateData);

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const deleteWorkPermit = async (permitId) => {
  try {
    const permitRef = doc(db, WORK_PERMITS_COLLECTION, permitId);
    await deleteDoc(permitRef);

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};
