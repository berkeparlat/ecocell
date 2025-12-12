import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { logoutUser, onAuthChange, listenToUserProfile } from '../services/authService';
import {
  listenToTasks,
  addTask as addTaskToStore,
  updateTask as updateTaskInStore,
  deleteTask as deleteTaskFromStore,
} from '../services/taskService';
import {
  listenToDepartments as listenToDepartmentsFromStore,
  saveDepartments,
} from '../services/departmentService';
import {
  listenToWorkPermits,
  addWorkPermit as addWorkPermitToStore,
  updateWorkPermit as updateWorkPermitInStore,
  deleteWorkPermit as deleteWorkPermitFromStore,
} from '../services/workPermitService';
import {
  listenToAnnouncements,
  addAnnouncement as addAnnouncementToStore,
  updateAnnouncement as updateAnnouncementInStore,
  deleteAnnouncement as deleteAnnouncementFromStore,
  markAnnouncementAsRead,
  getUnreadAnnouncementsCount,
} from '../services/announcementService';
import {
  listenToNotifications,
  markAsRead as markNotificationAsRead,
  markAllAsRead as markAllNotificationsAsRead,
  deleteNotification as deleteNotificationFromStore,
  deleteAllNotifications as deleteAllNotificationsFromStore,
  getUnreadCount,
  createNotificationForDepartment,
} from '../services/notificationService';
import { subscribeToConversations } from '../services/messageService';
import {
  listenToReminders,
  addReminder as addReminderToStore,
  updateReminder as updateReminderInStore,
  deleteReminder as deleteReminderFromStore,
} from '../services/reminderService';
import { checkRemindersAndNotify } from '../services/reminderNotificationService';
import {
  requestNotificationPermission,
  getFCMToken,
  onMessageListener,
  enableNotifications,
  disableNotifications,
} from '../services/pushNotificationService';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [workPermits, setWorkPermits] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [viewMode, setViewMode] = useState('board');
  const [departments, setDepartments] = useState([]);
  const tasksListenerRef = useRef(null);
  const workPermitsListenerRef = useRef(null);
  const announcementsListenerRef = useRef(null);
  const notificationsListenerRef = useRef(null);
  const conversationsListenerRef = useRef(null);
  const remindersListenerRef = useRef(null);
  const departmentsListenerRef = useRef(null);
  const userProfileListenerRef = useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('karafiber_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('karafiber_user');
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
          department: profile?.department || '',
          role: profile?.role || 'user',
          createdAt: profile?.createdAt || null,
        };

        setUser(userData);
        localStorage.setItem('karafiber_user', JSON.stringify(userData));
        
        // Bildirim iznini iste (sadece bir kez, ilk giriş sonrası)
        setTimeout(() => {
          requestNotificationPermission(firebaseUser.uid).catch(() => {});
        }, 2000); // 2 saniye bekle ki kullanıcı arayüzü görsün
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
    if (!user?.uid) {
      if (workPermitsListenerRef.current) {
        workPermitsListenerRef.current();
        workPermitsListenerRef.current = null;
      }
      setWorkPermits([]);
      return;
    }

    const unsubscribe = listenToWorkPermits((fetchedPermits) => {
      setWorkPermits(fetchedPermits);
    });

    workPermitsListenerRef.current = unsubscribe;

    return () => {
      if (workPermitsListenerRef.current) {
        workPermitsListenerRef.current();
        workPermitsListenerRef.current = null;
      }
    };
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) {
      if (announcementsListenerRef.current) {
        announcementsListenerRef.current();
        announcementsListenerRef.current = null;
      }
      setAnnouncements([]);
      return;
    }

    const unsubscribe = listenToAnnouncements((fetchedAnnouncements) => {
      setAnnouncements(fetchedAnnouncements);
    });

    announcementsListenerRef.current = unsubscribe;

    return () => {
      if (announcementsListenerRef.current) {
        announcementsListenerRef.current();
        announcementsListenerRef.current = null;
      }
    };
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) {
      if (notificationsListenerRef.current) {
        notificationsListenerRef.current();
        notificationsListenerRef.current = null;
      }
      setNotifications([]);
      return;
    }

    const unsubscribe = listenToNotifications(user.uid, (fetchedNotifications) => {
      setNotifications(fetchedNotifications);
    });

    notificationsListenerRef.current = unsubscribe;

    return () => {
      if (notificationsListenerRef.current) {
        notificationsListenerRef.current();
        notificationsListenerRef.current = null;
      }
    };
  }, [user?.uid]);

  // Push Notifications setup
  useEffect(() => {
    if (!user?.uid) return;

    // Kullanıcı giriş yaptığında bildirim izni kontrolü
    const setupPushNotifications = async () => {
      try {
        // Service Worker'ı kaydet
        if ('serviceWorker' in navigator) {
          let registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
          
          if (!registration) {
            registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
              updateViaCache: 'none'
            });
          } else {
            await registration.update();
          }

          // Service Worker'ın aktif olmasını bekle
          if (registration.installing) {
            await new Promise((resolve) => {
              registration.installing.addEventListener('statechange', (e) => {
                if (e.target.state === 'activated') resolve();
              });
            });
          }
        }

        // Bildirim iznini kontrol et
        if (Notification.permission === 'granted') {
          await getFCMToken(user.uid);
        }

        const unsubscribeMessages = onMessageListener(() => {});

        return unsubscribeMessages;
      } catch (error) {
        console.error('[Push] Setup hatası:', error);
      }
    };

    setupPushNotifications();
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) {
      if (conversationsListenerRef.current) {
        conversationsListenerRef.current();
        conversationsListenerRef.current = null;
      }
      setConversations([]);
      return;
    }

    const unsubscribe = subscribeToConversations(user.uid, (fetchedConversations) => {
      setConversations(fetchedConversations);
    });

    conversationsListenerRef.current = unsubscribe;

    return () => {
      if (conversationsListenerRef.current) {
        conversationsListenerRef.current();
        conversationsListenerRef.current = null;
      }
    };
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) {
      if (remindersListenerRef.current) {
        remindersListenerRef.current();
        remindersListenerRef.current = null;
      }
      setReminders([]);
      return;
    }

    const unsubscribe = listenToReminders(user.uid, (fetchedReminders) => {
      setReminders(fetchedReminders);
    });

    remindersListenerRef.current = unsubscribe;

    return () => {
      if (remindersListenerRef.current) {
        remindersListenerRef.current();
        remindersListenerRef.current = null;
      }
    };
  }, [user?.uid]);

  // Hatırlatıcı kontrolü - Her 1 saatte bir
  useEffect(() => {
    if (!user?.uid) return;

    // İlk kontrol
    checkRemindersAndNotify();

    // Her 1 saatte bir kontrol
    const intervalId = setInterval(() => {
      checkRemindersAndNotify();
    }, 60 * 60 * 1000); // 1 saat

    return () => clearInterval(intervalId);
  }, [user?.uid]);

  // Birimler herkese açık - uygulama başlar başlamaz yükle (login gerektirmez)
  useEffect(() => {
    // Önce mevcut birimleri al, sonra dinlemeye başla
    const unsubscribe = listenToDepartmentsFromStore((remoteList) => {
      if (Array.isArray(remoteList)) {
        setDepartments(remoteList);
      }
    });

    departmentsListenerRef.current = unsubscribe;

    return () => {
      if (departmentsListenerRef.current) {
        departmentsListenerRef.current();
        departmentsListenerRef.current = null;
      }
    };
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('karafiber_user', JSON.stringify(userData));
  };

  const logout = async () => {
    const result = await logoutUser();
    setUser(null);
    setTasks([]);
    setDepartments([]);
    localStorage.removeItem('karafiber_user');
    localStorage.removeItem('karafiber_tasks');
    localStorage.removeItem('karafiber_departments');
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
      const result = await addTaskToStore(payload, user.uid, payload.createdBy);
      if (!result.success) {
        throw new Error(result.error || 'Is eklenemedi');
      }
      
      // İlgili birime bildirim gönder
      if (task.relatedDepartment) {
        try {
          await createNotificationForDepartment(task.relatedDepartment, {
            type: 'task',
            title: 'Yeni İş Eklendi',
            message: `${payload.createdBy} tarafından "${task.title}" işi eklendi.`,
            actionUrl: '/job-tracking',
            relatedId: result.task.id,
            createdBy: payload.createdBy
          });
        } catch (notificationError) {
          console.error('Bildirim gönderilemedi:', notificationError);
          // Bildirim hatası görev eklemeyi engellemez
        }
      }
      
      return result.task;
    } catch (error) {
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
      throw error;
    }
  };

  const moveTask = async (taskId, newStatus) => {
    await updateTask(taskId, { status: newStatus });
  };

  const addWorkPermit = async (permit) => {
    if (!user?.uid) {
      throw new Error('Oturum acilmamis');
    }

    const payload = {
      ...permit,
      createdBy: permit.createdBy || user.fullName || user.username || user.email || 'Bilinmeyen',
      createdByDepartment: permit.createdByDepartment || user.department || permit.relatedDepartment || '',
    };

    try {
      const result = await addWorkPermitToStore(payload, user.uid, payload.createdBy);
      if (!result.success) {
        throw new Error(result.error || 'Is izni eklenemedi');
      }
      return result.permit;
    } catch (error) {
      throw error;
    }
  };

  const updateWorkPermit = async (permitId, updates) => {
    try {
      const result = await updateWorkPermitInStore(permitId, updates);
      if (!result.success) {
        throw new Error(result.error || 'Is izni guncellenemedi');
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const deleteWorkPermit = async (permitId) => {
    try {
      const result = await deleteWorkPermitFromStore(permitId);
      if (!result.success) {
        throw new Error(result.error || 'Is izni silinemedi');
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const addAnnouncement = async (announcement) => {
    if (!user?.uid) {
      throw new Error('Oturum acilmamis');
    }

    const payload = {
      ...announcement,
      createdBy: announcement.createdBy || user.fullName || user.username || user.email || 'Bilinmeyen',
      department: announcement.department || user.department || '',
    };

    try {
      const result = await addAnnouncementToStore(payload, user.uid);
      if (!result.success) {
        throw new Error(result.error || 'Duyuru eklenemedi');
      }
      return result.announcement;
    } catch (error) {
      throw error;
    }
  };

  const updateAnnouncement = async (announcementId, updates) => {
    try {
      const result = await updateAnnouncementInStore(announcementId, updates);
      if (!result.success) {
        throw new Error(result.error || 'Duyuru guncellenemedi');
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const deleteAnnouncement = async (announcementId) => {
    try {
      const result = await deleteAnnouncementFromStore(announcementId);
      if (!result.success) {
        throw new Error(result.error || 'Duyuru silinemedi');
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const markNotificationAsReadHandler = async (notificationId) => {
    try {
      const result = await markNotificationAsRead(notificationId);
      if (!result.success) {
        throw new Error(result.error || 'Bildirim okundu işaretlenemedi');
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const markAllNotificationsAsReadHandler = async () => {
    if (!user?.uid) {
      throw new Error('Oturum açılmamış');
    }
    try {
      const result = await markAllNotificationsAsRead(user.uid);
      if (!result.success) {
        throw new Error(result.error || 'Bildirimler okundu işaretlenemedi');
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const result = await deleteNotificationFromStore(notificationId);
      if (!result.success) {
        throw new Error(result.error || 'Bildirim silinemedi');
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const deleteAllNotifications = async () => {
    if (!user?.uid) {
      throw new Error('Oturum açılmamış');
    }
    try {
      const result = await deleteAllNotificationsFromStore(user.uid);
      if (!result.success) {
        throw new Error(result.error || 'Bildirimler silinemedi');
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const addReminder = async (reminder) => {
    if (!user?.uid) {
      throw new Error('Oturum açılmamış');
    }

    try {
      const result = await addReminderToStore(reminder, user.uid);
      
      if (!result.success) {
        throw new Error(result.error || 'Hatırlatıcı eklenemedi');
      }
      return result.reminder;
    } catch (error) {
      console.error('Hatırlatıcı eklenirken hata:', error);
      throw error;
    }
  };

  const updateReminder = async (reminderId, updates) => {
    try {
      const result = await updateReminderInStore(reminderId, updates);
      if (!result.success) {
        throw new Error(result.error || 'Hatırlatıcı güncellenemedi');
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const deleteReminder = async (reminderId) => {
    try {
      const result = await deleteReminderFromStore(reminderId);
      if (!result.success) {
        throw new Error(result.error || 'Hatırlatıcı silinemedi');
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const unreadNotificationsCount = getUnreadCount(notifications);
  const unreadAnnouncementsCount = getUnreadAnnouncementsCount(announcements, user?.uid || '');

  // Push notification fonksiyonları
  const enablePushNotifications = async () => {
    if (!user?.uid) {
      throw new Error('Oturum açılmamış');
    }
    return await enableNotifications(user.uid);
  };

  const disablePushNotifications = async () => {
    if (!user?.uid) {
      throw new Error('Oturum açılmamış');
    }
    return await disableNotifications(user.uid);
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
    workPermits,
    addWorkPermit,
    updateWorkPermit,
    deleteWorkPermit,
    announcements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    markAnnouncementAsRead,
    unreadAnnouncementsCount,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead: markNotificationAsReadHandler,
    markAllNotificationsAsRead: markAllNotificationsAsReadHandler,
    deleteNotification,
    deleteAllNotifications,
    conversations,
    reminders,
    addReminder,
    updateReminder,
    deleteReminder,
    viewMode,
    setViewMode,
    departments,
    updateDepartments,
    enablePushNotifications,
    disablePushNotifications,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
