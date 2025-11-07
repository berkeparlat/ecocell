import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  getDoc
} from 'firebase/firestore';
import { updatePassword, updateEmail } from 'firebase/auth';
import { db, auth } from '../config/firebase';

// Admin email kontrolü
const ADMIN_EMAIL = 'berke.parlat27@gmail.com';

export const isAdmin = (user) => {
  return user?.email === ADMIN_EMAIL;
};

// Tüm kullanıcıları getir
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    const users = [];
    snapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return users;
  } catch (error) {
    
    throw error;
  }
};

// Kullanıcı güncelle
export const updateUser = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    // Password alanını Firestore'a kaydetme
    const { password, ...firestoreData } = userData;
    await updateDoc(userRef, firestoreData);
    return { success: true };
  } catch (error) {
    
    throw error;
  }
};

// Kullanıcı sil
export const deleteUser = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
    return { success: true };
  } catch (error) {
    
    throw error;
  }
};

// Tüm görevleri getir
export const getAllTasks = async () => {
  try {
    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const tasks = [];
    snapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    return tasks;
  } catch (error) {
    
    throw error;
  }
};

// Görev sil
export const deleteTask = async (taskId) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskRef);
    return { success: true };
  } catch (error) {
    
    throw error;
  }
};

// Tüm mesajları getir
export const getAllMessages = async () => {
  try {
    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const messages = [];
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    return messages;
  } catch (error) {
    
    throw error;
  }
};

// Mesaj sil
export const deleteMessage = async (messageId) => {
  try {
    const messageRef = doc(db, 'messages', messageId);
    await deleteDoc(messageRef);
    return { success: true };
  } catch (error) {
    
    throw error;
  }
};

// İstatistikler
export const getStatistics = async () => {
  try {
    const [users, tasks, messages] = await Promise.all([
      getAllUsers(),
      getAllTasks(),
      getAllMessages()
    ]);

    const stats = {
      totalUsers: users.length,
      totalTasks: tasks.length,
      totalMessages: messages.length,
      tasksByStatus: {
        new: tasks.filter(t => t.status === 'new').length,
        inProgress: tasks.filter(t => t.status === 'in-progress').length,
        done: tasks.filter(t => t.status === 'done').length
      },
      usersByDepartment: users.reduce((acc, user) => {
        const dept = user.department || 'Belirtilmemiş';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {}),
      recentUsers: users.slice(0, 5),
      recentTasks: tasks.slice(0, 5),
      recentMessages: messages.slice(0, 5)
    };

    return stats;
  } catch (error) {
    
    throw error;
  }
};
