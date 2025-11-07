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
} from 'firebase/firestore';

const ANNOUNCEMENTS_COLLECTION = 'announcements';

export const listenToAnnouncements = (callback) => {
  const q = query(collection(db, ANNOUNCEMENTS_COLLECTION), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const announcements = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      }));
      callback(announcements);
    },
    (error) => {
      callback([]);
    }
  );
};

export const addAnnouncement = async (announcementData, userId) => {
  try {
    const announcementWithTimestamp = {
      ...announcementData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      userId,
    };

    const docRef = await addDoc(collection(db, ANNOUNCEMENTS_COLLECTION), announcementWithTimestamp);

    return {
      success: true,
      announcement: {
        id: docRef.id,
        ...announcementData,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const updateAnnouncement = async (announcementId, updates) => {
  try {
    const announcementRef = doc(db, ANNOUNCEMENTS_COLLECTION, announcementId);
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(announcementRef, updateData);

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

export const deleteAnnouncement = async (announcementId) => {
  try {
    const announcementRef = doc(db, ANNOUNCEMENTS_COLLECTION, announcementId);
    await deleteDoc(announcementRef);

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
