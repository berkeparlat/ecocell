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
    (error) => {
      console.error('Birimler dinlenirken hata:', error);
    }
  );
};

export const saveDepartments = async (departments) => {
  await setDoc(
    departmentsDocRef,
    {
      list: departments,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};
