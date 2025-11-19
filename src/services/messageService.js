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
import { db } from '../config/firebase';

const MESSAGES_COLLECTION = 'messages';

// Yeni mesaj gönder
export const sendMessage = async (messageData) => {
  const message = {
    ...messageData,
    createdAt: Timestamp.now(),
    read: false,
    status: 'sent'
  };
  
  const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), message);
  return docRef.id;
};

export const subscribeToConversations = (userId, callback) => {
  const receivedQuery = query(
    collection(db, MESSAGES_COLLECTION),
    where('recipientId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(100)
  );

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
      
      if (msg.recipientId === userId && !msg.read) {
        const conv = conversationsMap.get(otherUserId);
        if (conv) {
          conv.unreadCount++;
        }
      }
    });
    
    const conversations = Array.from(conversationsMap.values()).sort(
      (a, b) => b.lastMessage.createdAt.seconds - a.lastMessage.createdAt.seconds
    );
    
    callback(conversations);
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

export const subscribeToChat = (userId, otherUserId, callback) => {
  const receivedQuery = query(
    collection(db, MESSAGES_COLLECTION),
    where('senderId', '==', otherUserId),
    where('recipientId', '==', userId),
    orderBy('createdAt', 'asc'),
    limit(50) // Son 50 mesaj
  );

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
    
    if (!forceRefresh && usersCache && (now - usersCacheTime) < CACHE_DURATION) {
      return usersCache;
    }
    
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    usersCache = users;
    usersCacheTime = now;
    
    return users;
  } catch (error) {
    return usersCache || [];
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
    // Silent fail
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
    // Silent fail
  }
};

// Tek bir mesajı sil
export const deleteMessage = async (messageId) => {
  try {
    await deleteDoc(doc(db, MESSAGES_COLLECTION, messageId));
  } catch (error) {
    throw error;
  }
};

export const deleteConversation = async (userId1, userId2) => {
  try {
    const receivedQuery = query(
      collection(db, MESSAGES_COLLECTION),
      where('senderId', '==', userId2),
      where('recipientId', '==', userId1)
    );

    const sentQuery = query(
      collection(db, MESSAGES_COLLECTION),
      where('senderId', '==', userId1),
      where('recipientId', '==', userId2)
    );

    const [receivedSnapshot, sentSnapshot] = await Promise.all([
      getDocs(receivedQuery),
      getDocs(sentQuery)
    ]);

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
    throw error;
  }
};
