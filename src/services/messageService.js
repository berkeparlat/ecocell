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
  limit,
  deleteDoc,
  writeBatch
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
    console.error('Error sending message:', error);
    throw error;
  }
};

// OPTIMIZE: Kullanıcının konuşmalarını dinle (sadece ilgili mesajlar)
export const subscribeToConversations = (userId, callback) => {
  // Alınan mesajlar için query
  const receivedQuery = query(
    collection(db, MESSAGES_COLLECTION),
    where('recipientId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(100) // Son 100 mesaj
  );

  // Gönderilen mesajlar için query
  const sentQuery = query(
    collection(db, MESSAGES_COLLECTION),
    where('senderId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(100)
  );

  let receivedMessages = [];
  let sentMessages = [];

  const processMessages = () => {
    const allMessages = [...receivedMessages, ...sentMessages];
    
    // Konuşmaları grupla (her kullanıcı için son mesaj)
    const conversationsMap = new Map();
    
    allMessages.forEach(msg => {
      const otherUserId = msg.senderId === userId ? msg.recipientId : msg.senderId;
      const otherUserName = msg.senderId === userId ? msg.recipientName : msg.senderName;
      const otherUserDept = msg.senderId === userId ? msg.recipientDepartment : msg.senderDepartment;
      
      const existing = conversationsMap.get(otherUserId);
      
      if (!existing || msg.createdAt.seconds > existing.lastMessage.createdAt.seconds) {
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
        const conv = conversationsMap.get(otherUserId);
        if (conv) {
          conv.unreadCount++;
        }
      }
    });
    
    // En son mesaja göre sırala
    const conversations = Array.from(conversationsMap.values()).sort(
      (a, b) => b.lastMessage.createdAt.seconds - a.lastMessage.createdAt.seconds
    );
    
    callback(conversations);
  };

  // Alınan mesajları dinle
  const unsubscribeReceived = onSnapshot(receivedQuery, (snapshot) => {
    receivedMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    processMessages();
  });

  // Gönderilen mesajları dinle
  const unsubscribeSent = onSnapshot(sentQuery, (snapshot) => {
    sentMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    processMessages();
  });

  // Her iki listener'ı da temizle
  return () => {
    unsubscribeReceived();
    unsubscribeSent();
  };
};

// OPTIMIZE: Belirli bir kullanıcı ile olan mesajları dinle
export const subscribeToChat = (userId, otherUserId, callback) => {
  // Alınan mesajlar
  const receivedQuery = query(
    collection(db, MESSAGES_COLLECTION),
    where('senderId', '==', otherUserId),
    where('recipientId', '==', userId),
    orderBy('createdAt', 'asc'),
    limit(50) // Son 50 mesaj
  );

  // Gönderilen mesajlar
  const sentQuery = query(
    collection(db, MESSAGES_COLLECTION),
    where('senderId', '==', userId),
    where('recipientId', '==', otherUserId),
    orderBy('createdAt', 'asc'),
    limit(50)
  );

  let receivedMessages = [];
  let sentMessages = [];

  const processMessages = () => {
    const allMessages = [...receivedMessages, ...sentMessages];
    allMessages.sort((a, b) => a.createdAt.seconds - b.createdAt.seconds);
    callback(allMessages);
  };

  const unsubscribeReceived = onSnapshot(receivedQuery, (snapshot) => {
    receivedMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    processMessages();
  });

  const unsubscribeSent = onSnapshot(sentQuery, (snapshot) => {
    sentMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    processMessages();
  });

  return () => {
    unsubscribeReceived();
    unsubscribeSent();
  };
};

// Tüm kullanıcıları getir (mesaj göndermek için) - Cache ile optimize
let usersCache = null;
let usersCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika

export const getUsers = async (forceRefresh = false) => {
  try {
    const now = Date.now();
    
    // Cache varsa ve güncel ise kullan
    if (!forceRefresh && usersCache && (now - usersCacheTime) < CACHE_DURATION) {
      return usersCache;
    }
    
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Cache güncelle
    usersCache = users;
    usersCacheTime = now;
    
    return users;
  } catch (error) {
    console.error('Error getting users:', error);
    return usersCache || []; // Hata durumunda eski cache'i döndür
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
    console.error('Error uploading file:', error);
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
    console.error('Error marking as delivered:', error);
  }
};

// OPTIMIZE: Konuşmadaki tüm mesajları okundu olarak işaretle (batch ile)
export const markConversationAsRead = async (userId, otherUserId) => {
  try {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('senderId', '==', otherUserId),
      where('recipientId', '==', userId),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return;
    
    // Batch işlem ile toplu güncelleme (daha hızlı)
    const batch = writeBatch(db);
    const readTime = Timestamp.now();
    
    snapshot.docs.forEach((document) => {
      batch.update(doc(db, MESSAGES_COLLECTION, document.id), {
        read: true,
        readAt: readTime,
        status: 'read'
      });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error marking conversation as read:', error);
  }
};

// Tek bir mesajı sil
export const deleteMessage = async (messageId) => {
  try {
    await deleteDoc(doc(db, MESSAGES_COLLECTION, messageId));
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

// OPTIMIZE: İki kullanıcı arasındaki tüm konuşmayı sil (batch ile)
export const deleteConversation = async (userId1, userId2) => {
  try {
    // Alınan mesajlar
    const receivedQuery = query(
      collection(db, MESSAGES_COLLECTION),
      where('senderId', '==', userId2),
      where('recipientId', '==', userId1)
    );

    // Gönderilen mesajlar
    const sentQuery = query(
      collection(db, MESSAGES_COLLECTION),
      where('senderId', '==', userId1),
      where('recipientId', '==', userId2)
    );

    const [receivedSnapshot, sentSnapshot] = await Promise.all([
      getDocs(receivedQuery),
      getDocs(sentQuery)
    ]);

    // Batch işlem ile toplu silme
    const batch = writeBatch(db);
    
    receivedSnapshot.docs.forEach((document) => {
      batch.delete(doc(db, MESSAGES_COLLECTION, document.id));
    });
    
    sentSnapshot.docs.forEach((document) => {
      batch.delete(doc(db, MESSAGES_COLLECTION, document.id));
    });

    if (receivedSnapshot.size > 0 || sentSnapshot.size > 0) {
      await batch.commit();
    }
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
};
