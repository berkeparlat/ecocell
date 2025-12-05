import { doc, setDoc, getDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const departmentsDocRef = doc(db, 'meta', 'departments');

export const ensureDepartmentsDocument = async (defaultList = []) => {
  const snapshot = await getDoc(departmentsDocRef);

  if (!snapshot.exists()) {
    await setDoc(departmentsDocRef, {
      list: defaultList,
      updatedAt: serverTimestamp(),
    });
    return defaultList;
  }

  const data = snapshot.data();
  const list = Array.isArray(data?.list) ? data.list : [];

  if (!list.length && defaultList.length) {
    await setDoc(
      departmentsDocRef,
      {
        list: defaultList,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return defaultList;
  }

  return list;
};

// Birimler herkese açık (public) - login gerektirmez
export const listenToDepartments = (callback) => {
  return onSnapshot(
    departmentsDocRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }

      const data = snapshot.data();
      const list = Array.isArray(data?.list) ? data.list : [];
      callback(list);
    },
    () => {
      callback([]);
    }
  );
};

export const saveDepartments = async (departments) => {
  try {
    await setDoc(
      departmentsDocRef,
      {
        list: departments,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    throw error;
  }
};
