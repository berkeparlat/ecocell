import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  query,
  orderBy,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

const TASKS_COLLECTION = 'tasks';

// Tüm görevleri getir
export const getTasks = async (userId) => {
  try {
    const tasksRef = collection(db, TASKS_COLLECTION);
    const q = query(tasksRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const tasks = [];
    querySnapshot.forEach((doc) => {
      tasks.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString(),
        dueDate: doc.data().dueDate || ''
      });
    });
    
    return { success: true, tasks };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Görevleri gerçek zamanlı dinle
export const listenToTasks = (callback) => {
  const tasksRef = collection(db, TASKS_COLLECTION);
  const q = query(tasksRef, orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (querySnapshot) => {
    const tasks = [];
    querySnapshot.forEach((doc) => {
      tasks.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString(),
        dueDate: doc.data().dueDate || ''
      });
    });
    callback(tasks);
  }, () => {
    callback([]);
  });
};

// Yeni görev ekle
export const addTask = async (taskData, userId, userName) => {
  try {
    const docRef = await addDoc(collection(db, TASKS_COLLECTION), {
      ...taskData,
      userId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Birime bildirim gönder
    if (taskData.assignedDepartment) {
      await createNotificationForDepartment(taskData.assignedDepartment, {
        type: 'task',
        title: 'Yeni İş Eklendi',
        message: `${userName} tarafından "${taskData.title}" başlıklı yeni bir iş eklendi.`,
        actionUrl: '/job-tracking',
        relatedId: docRef.id,
        createdBy: userName
      });
    }
    
    return { 
      success: true, 
      taskId: docRef.id,
      task: {
        id: docRef.id,
        ...taskData,
        createdAt: new Date().toISOString()
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Görevi güncelle
export const updateTask = async (taskId, updates) => {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Görevi sil
export const deleteTask = async (taskId) => {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    await deleteDoc(taskRef);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Departmana göre görevleri filtrele
export const getTasksByDepartment = async (department) => {
  try {
    const tasksRef = collection(db, TASKS_COLLECTION);
    const q = query(
      tasksRef, 
      where('relatedDepartment', '==', department),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const tasks = [];
    querySnapshot.forEach((doc) => {
      tasks.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
      });
    });
    
    return { success: true, tasks };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
