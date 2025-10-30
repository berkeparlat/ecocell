import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { logoutUser, onAuthChange, listenToUserProfile } from '../services/authService';
import {
  listenToTasks,
  addTask as addTaskToStore,
  updateTask as updateTaskInStore,
  deleteTask as deleteTaskFromStore,
} from '../services/taskService';
import {
  ensureDepartmentsDocument,
  listenToDepartments as listenToDepartmentsFromStore,
  saveDepartments,
} from '../services/departmentService';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const DEPARTMENTS = [
  'Uretim',
  'Kalite Kontrol',
  'Ar-Ge',
  'Satis',
  'Pazarlama',
  'Lojistik',
  'Insan Kaynaklari',
  'Finans',
  'Bilgi Islem',
  'Bakim-Onarim',
];

const readDepartmentsFromStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem('karafiber_departments');
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : null;
  } catch (error) {
    console.error('Stored departments verisi okunamadi:', error);
    return null;
  }
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [viewMode, setViewMode] = useState('board');
  const [departments, setDepartments] = useState(() => readDepartmentsFromStorage() || DEPARTMENTS);
  const tasksListenerRef = useRef(null);
  const departmentsListenerRef = useRef(null);
  const userProfileListenerRef = useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('karafiber_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Stored user verisi okunamadi:', error);
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      if (userProfileListenerRef.current) {
        userProfileListenerRef.current();
        userProfileListenerRef.current = null;
      }

      if (!firebaseUser) {
        setUser(null);
        setTasks([]);
        localStorage.removeItem('karafiber_user');
        return;
      }

      const fallbackName =
        firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Kullanici';

      userProfileListenerRef.current = listenToUserProfile(firebaseUser.uid, (profile) => {
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          username: profile?.fullName || fallbackName,
          fullName: profile?.fullName || fallbackName,
          department: profile?.department || 'Genel',
          createdAt: profile?.createdAt || null,
        };

        setUser(userData);
        localStorage.setItem('karafiber_user', JSON.stringify(userData));
      });
    });

    return () => {
      if (tasksListenerRef.current) {
        tasksListenerRef.current();
        tasksListenerRef.current = null;
      }
      if (userProfileListenerRef.current) {
        userProfileListenerRef.current();
        userProfileListenerRef.current = null;
      }
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      if (tasksListenerRef.current) {
        tasksListenerRef.current();
        tasksListenerRef.current = null;
      }
      setTasks([]);
      return;
    }

    const unsubscribe = listenToTasks((fetchedTasks) => {
      setTasks(fetchedTasks);
    });

    tasksListenerRef.current = unsubscribe;

    return () => {
      if (tasksListenerRef.current) {
        tasksListenerRef.current();
        tasksListenerRef.current = null;
      }
    };
  }, [user?.uid]);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe;

    const initialiseDepartments = async () => {
      try {
        const ensured = await ensureDepartmentsDocument(DEPARTMENTS);
        if (isMounted && Array.isArray(ensured) && ensured.length > 0) {
          setDepartments(ensured);
        }
      } catch (error) {
        console.error('Birimler yuklenirken hata:', error);
      }

      unsubscribe = listenToDepartmentsFromStore((remoteList) => {
        if (!isMounted) {
          return;
        }

        if (Array.isArray(remoteList) && remoteList.length > 0) {
          setDepartments(remoteList);
        } else {
          setDepartments(DEPARTMENTS);
        }
      });

      departmentsListenerRef.current = unsubscribe;
    };

    initialiseDepartments();

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
      departmentsListenerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem('karafiber_departments', JSON.stringify(departments));
    } catch (error) {
      console.error('Birimler kaydedilirken hata:', error);
    }
  }, [departments]);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('karafiber_user', JSON.stringify(userData));
  };

  const logout = async () => {
    const result = await logoutUser();
    if (result?.success === false) {
      console.error('Cikis yapilirken hata:', result.error);
    }
    setUser(null);
    setTasks([]);
    localStorage.removeItem('karafiber_user');
    localStorage.removeItem('karafiber_tasks');
  };

  const normaliseDepartments = (list) => {
    const cleaned = Array.from(
      new Set(
        list
          .map((dept) => (dept || '').trim())
          .filter((dept) => dept.length > 0)
      )
    );

    return cleaned.sort((a, b) =>
      a.localeCompare(b, 'tr', { sensitivity: 'base' })
    );
  };

  const updateDepartments = async (newDepartments) => {
    const cleaned = normaliseDepartments(newDepartments);

    if (cleaned.length === 0) {
      throw new Error('En az bir birim olmalidir');
    }

    const previous = departments;
    setDepartments(cleaned);

    try {
      await saveDepartments(cleaned);
    } catch (error) {
      console.error('Birimler guncellenirken hata:', error);
      setDepartments(previous);
      throw error;
    }
  };

  const addTask = async (task) => {
    if (!user?.uid) {
      throw new Error('Oturum acilmamis');
    }

    const payload = {
      ...task,
      status: task.status || 'new',
      createdBy: task.createdBy || user.fullName || user.username || user.email || 'Bilinmeyen',
      createdByDepartment:
        task.createdByDepartment || user.department || task.relatedDepartment || '',
    };

    try {
      const result = await addTaskToStore(payload, user.uid);
      if (!result.success) {
        throw new Error(result.error || 'Is eklenemedi');
      }
      return result.task;
    } catch (error) {
      console.error('Is eklenirken hata:', error);
      throw error;
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      const result = await updateTaskInStore(taskId, updates);
      if (!result.success) {
        throw new Error(result.error || 'Is guncellenemedi');
      }
      return result;
    } catch (error) {
      console.error('Is guncellenirken hata:', error);
      throw error;
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const result = await deleteTaskFromStore(taskId);
      if (!result.success) {
        throw new Error(result.error || 'Is silinemedi');
      }
      return result;
    } catch (error) {
      console.error('Is silinirken hata:', error);
      throw error;
    }
  };

  const moveTask = async (taskId, newStatus) => {
    await updateTask(taskId, { status: newStatus });
  };

  const value = {
    user,
    login,
    logout,
    tasks,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    viewMode,
    setViewMode,
    departments,
    updateDepartments,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
