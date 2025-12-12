import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const USERS_COLLECTION = 'users';

export const registerUser = async (email, password, displayName, department) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(userCredential.user, {
      displayName: displayName,
    });

    await setDoc(doc(db, USERS_COLLECTION, userCredential.user.uid), {
      uid: userCredential.user.uid,
      fullName: displayName,
      email,
      department,
      approved: false,
      createdAt: serverTimestamp(),
    });

    // Kayıttan hemen sonra çıkış yap - onay beklesin
    await signOut(auth);

    return {
      success: true,
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: displayName,
        fullName: displayName,
        department,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error.code),
    };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const fallbackName =
      userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'Kullanici';

    let profileData = null;
    try {
      profileData = await getUserProfile(userCredential.user.uid);
    } catch (profileError) {
      // Profile y�klenemezse varsay�lan de�erler kullan�lacak
    }

    // Kullanıcı silinmişse giriş yapmasına izin verme
    if (profileData?.deleted) {
      await signOut(auth);
      return {
        success: false,
        error: 'Bu hesap silinmiştir. Lütfen yönetici ile iletişime geçin.',
      };
    }

    // Kullanıcı onaylanmamışsa giriş yapmasına izin verme
    if (profileData?.approved === false) {
      await signOut(auth);
      return {
        success: false,
        error: 'Hesabınız henüz onaylanmamıştır. Lütfen yönetici onayını bekleyin.',
      };
    }

    const userData = {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: userCredential.user.displayName,
      fullName: profileData?.fullName || fallbackName,
      username: profileData?.fullName || fallbackName,
      department: profileData?.department || 'Genel',
      createdAt: profileData?.createdAt || null,
    };

    return {
      success: true,
      user: userData,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error.code),
    };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: 'Cikis yapilirken bir hata olustu',
    };
  }
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export const getUserProfile = async (uid) => {
  try {
    const snapshot = await getDoc(doc(db, USERS_COLLECTION, uid));
    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || null,
    };
  } catch (error) {
    throw error;
  }
};

export const listenToUserProfile = (uid, callback) => {
  const userDocRef = doc(db, USERS_COLLECTION, uid);
  return onSnapshot(
    userDocRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }

      const data = snapshot.data();
      callback({
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || null,
      });
    },
    () => {
      callback(null);
    }
  );
};

const getErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/email-already-in-use': 'Bu e-posta adresi zaten kullaniliyor',
    'auth/invalid-email': 'Gecersiz e-posta adresi',
    'auth/operation-not-allowed': 'Bu islem su anda kullanilamiyor',
    'auth/weak-password': 'Sifre cok zayif (en az 6 karakter olmali)',
    'auth/user-disabled': 'Bu kullanici hesabi devre disi birakilmis',
    'auth/user-not-found': 'Kullanici bulunamadi',
    'auth/wrong-password': 'Hatali sifre',
    'auth/invalid-credential': 'Gecersiz kullanici adi veya sifre',
    'auth/too-many-requests': 'Cok fazla deneme. Lutfen daha sonra tekrar deneyin',
  };

  return errorMessages[errorCode] || 'Bir hata olustu. Lutfen tekrar deneyin.';
};
