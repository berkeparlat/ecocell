import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  updateDoc,
  doc,
  getDocs,
  or,
  deleteDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';

const MESSAGES_COLLECTION = 'messages';

// Yeni mesaj gönder
export const sendMessage = async (messageData) => {
  try {
    const message = {
      ...messageData,
      createdAt: Timestamp.now(),
      read: false,
      status: 'sent'
    };
    
    const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), message);
    return docRef.id;
  } catch (error) {
    console.error('Mesaj gönderme hatası:', error);
    throw error;
  }
};

// Kullanıcının tüm konuşmalarını dinle (gelen ve giden)
export const subscribeToConversations = (userId, callback) => {
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const allMessages = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Sadece bu kullanıcının dahil olduğu mesajlar
      if (data.recipientId === userId || data.senderId === userId) {
        allMessages.push({ id: doc.id, ...data });
      }
    });
    
    // Konuşmaları grupla (her kullanıcı için son mesaj)
    const conversationsMap = new Map();
    
    allMessages.forEach(msg => {
      const otherUserId = msg.senderId === userId ? msg.recipientId : msg.senderId;
      const otherUserName = msg.senderId === userId ? msg.recipientName : msg.senderName;
      const otherUserDept = msg.senderId === userId ? msg.recipientDepartment : msg.senderDepartment;
      
      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          userId: otherUserId,
          userName: otherUserName,
          userDepartment: otherUserDept,
          lastMessage: msg,
          unreadCount: 0
        });
      }
      
      // Okunmamış mesaj sayısı (sadece alınan mesajlar)
      if (msg.recipientId === userId && !msg.read) {
        conversationsMap.get(otherUserId).unreadCount++;
      }
    });
    
    callback(Array.from(conversationsMap.values()));
  });
};

// Belirli bir kullanıcı ile olan tüm mesajları dinle
export const subscribeToChat = (userId, otherUserId, callback) => {
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // İki kullanıcı arasındaki mesajlar
      if (
        (data.senderId === userId && data.recipientId === otherUserId) ||
        (data.senderId === otherUserId && data.recipientId === userId)
      ) {
        messages.push({ id: doc.id, ...data });
      }
    });
    callback(messages);
  });
};

// Tüm kullanıcıları getir (mesaj göndermek için)
export const getUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    const users = [];
    snapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return users;
  } catch (error) {
    console.error('Kullanıcılar alınırken hata:', error);
    return [];
  }
};

// Dosya yükle (mesaj için)
export const uploadMessageFile = async (file, senderId) => {
  try {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `messages/${senderId}/${fileName}`);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    return {
      url: downloadURL,
      name: file.name,
      size: file.size,
      type: file.type
    };
  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    throw error;
  }
};

// Mesajı görüldü olarak işaretle
export const markMessageAsDelivered = async (messageId) => {
  try {
    await updateDoc(doc(db, MESSAGES_COLLECTION, messageId), {
      status: 'delivered',
      deliveredAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Mesaj iletildi güncelleme hatası:', error);
  }
};

// Konuşmadaki tüm mesajları okundu olarak işaretle
export const markConversationAsRead = async (userId, otherUserId) => {
  try {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('senderId', '==', otherUserId),
      where('recipientId', '==', userId),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    const updatePromises = [];
    
    snapshot.forEach((document) => {
      updatePromises.push(
        updateDoc(doc(db, MESSAGES_COLLECTION, document.id), {
          read: true,
          readAt: Timestamp.now(),
          status: 'read'
        })
      );
    });
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Mesajlar okundu işaretleme hatası:', error);
    throw error;
  }
};

// Tek bir mesajı sil
export const deleteMessage = async (messageId) => {
  try {
    await deleteDoc(doc(db, MESSAGES_COLLECTION, messageId));
  } catch (error) {
    console.error('Mesaj silme hatası:', error);
    throw error;
  }
};

// İki kullanıcı arasındaki tüm konuşmayı sil
export const deleteConversation = async (userId1, userId2) => {
  try {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      or(
        where('senderId', '==', userId1),
        where('recipientId', '==', userId1)
      )
    );

    const snapshot = await getDocs(q);
    const deletePromises = [];

    snapshot.forEach((document) => {
      const data = document.data();
      // İki kullanıcı arasındaki mesajları bul
      if (
        (data.senderId === userId1 && data.recipientId === userId2) ||
        (data.senderId === userId2 && data.recipientId === userId1)
      ) {
        deletePromises.push(deleteDoc(doc(db, MESSAGES_COLLECTION, document.id)));
      }
    });

    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Konuşma silme hatası:', error);
    throw error;
  }
};
