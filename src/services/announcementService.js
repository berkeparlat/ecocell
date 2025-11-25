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
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { createNotification } from './notificationService';

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

export const addAnnouncement = async (announcementData, userId, userName) => {
  try {
    const announcementWithTimestamp = {
      ...announcementData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      userId,
    };

    const docRef = await addDoc(collection(db, ANNOUNCEMENTS_COLLECTION), announcementWithTimestamp);

    // Tüm kullanıcılara bildirim gönder
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const batch = writeBatch(db);
    const notificationsRef = collection(db, 'notifications');

    usersSnapshot.forEach((userDoc) => {
      const userData = userDoc.data();
      if (!userData.deleted && userDoc.id !== userId) {
        const notificationRef = doc(notificationsRef);
        batch.set(notificationRef, {
          userId: userDoc.id,
          type: 'announcement',
          title: 'Yeni Duyuru',
          message: `${userName} tarafından yeni bir duyuru yayınlandı: "${announcementData.title}"`,
          actionUrl: '/announcements',
          relatedId: docRef.id,
          createdBy: userName,
          read: false,
          createdAt: serverTimestamp()
        });
      }
    });

    await batch.commit();

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
