import { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import SimpleHeader from '../../components/layout/SimpleHeader';
import { 
  isAdmin, 
  getAllUsers, 
  getAllTasks, 
  getAllMessages, 
  getStatistics,
  updateUser,
  deleteUser as deleteUserService,
  deleteTask as deleteTaskService,
  deleteMessage as deleteMessageService,
  approveUser,
  getAllWorkPermits,
  deleteWorkPermit as deleteWorkPermitService,
  getAllNotifications,
  deleteNotification as deleteNotificationService,
  getAllReminders,
  deleteReminder as deleteReminderService
} from '../../services/adminService';
import { 
  Users, 
  Briefcase, 
  MessageSquare, 
  BarChart3, 
  Shield, 
  Edit2, 
  Trash2,
  Search,
  RefreshCw,
  Building2,
  Plus,
  X,
  FileSpreadsheet,
  Check,
  ClipboardCheck,
  Bell,
  Clock
} from 'lucide-react';
import { triggerFileWatcher } from '../../services/fileWatcherService';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user, updateDepartments, departments = [] } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [workPermits, setWorkPermits] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    department: '',
    password: ''
  });
  const [localDepartments, setLocalDepartments] = useState([]);
  const [newDepartment, setNewDepartment] = useState('');
  const [departmentError, setDepartmentError] = useState('');
  const [savingDepartments, setSavingDepartments] = useState(false);
  const [refreshingExcel, setRefreshingExcel] = useState(false);

  useEffect(() => {
    if (!user || !isAdmin(user)) {
      navigate('/main-menu');
      return;
    }
    loadData();
  }, [user, navigate]);

  useEffect(() => {
    setLocalDepartments(Array.isArray(departments) ? [...departments] : []);
  }, [departments]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, tasksData, messagesData, permitsData, notificationsData, remindersData] = await Promise.all([
        getStatistics(),
        getAllUsers(),
        getAllTasks(),
        getAllMessages(),
        getAllWorkPermits(),
        getAllNotifications(),
        getAllReminders()
      ]);
      setStats(statsData);
      setUsers(usersData);
      setTasks(tasksData);
      setMessages(messagesData);
      setWorkPermits(permitsData);
      setNotifications(notificationsData);
      setReminders(remindersData);
    } catch (error) {
      alert('Veriler yüklenemedi!');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = useCallback(async (userId) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return;
    
    try {
      await deleteUserService(userId);
      alert('Kullanıcı silindi!');
      loadData();
    } catch (error) {
      alert('Kullanıcı silinemedi!');
    }
  }, []);

  const handleApproveUser = useCallback(async (userId) => {
    if (!window.confirm('Bu kullanıcıyı onaylamak istediğinize emin misiniz?')) return;
    
    try {
      const result = await approveUser(userId);
      if (result.success) {
        alert('Kullanıcı onaylandı!');
        loadData();
      } else {
        alert('Kullanıcı onaylanamadı: ' + (result.error || 'Bilinmeyen hata'));
      }
    } catch (error) {
      alert('Kullanıcı onaylanamadı!');
    }
  }, []);

  const handleDeleteTask = useCallback(async (taskId) => {
    if (!window.confirm('Bu işi silmek istediğinizden emin misiniz?')) return;
    
    try {
      await deleteTaskService(taskId);
      alert('İş silindi!');
      loadData();
    } catch (error) {
      alert('İş silinemedi!');
    }
  }, []);

  const handleDeleteMessage = useCallback(async (messageId) => {
    if (!window.confirm('Bu mesajı silmek istediğinizden emin misiniz?')) return;
    
    try {
      await deleteMessageService(messageId);
      alert('Mesaj silindi!');
      loadData();
    } catch (error) {
      alert('Mesaj silinemedi!');
    }
  }, []);

  const handleDeleteWorkPermit = useCallback(async (permitId) => {
    if (!window.confirm('Bu iş iznini silmek istediğinizden emin misiniz?')) return;
    
    try {
      await deleteWorkPermitService(permitId);
      alert('İş izni silindi!');
      loadData();
    } catch (error) {
      alert('İş izni silinemedi!');
    }
  }, []);

  const handleDeleteNotification = useCallback(async (notificationId) => {
    if (!window.confirm('Bu bildirimi silmek istediğinizden emin misiniz?')) return;
    
    try {
      await deleteNotificationService(notificationId);
      alert('Bildirim silindi!');
      loadData();
    } catch (error) {
      alert('Bildirim silinemedi!');
    }
  }, []);

  const handleDeleteReminder = useCallback(async (reminderId) => {
    if (!window.confirm('Bu hatırlatıcıyı silmek istediğinizden emin misiniz?')) return;
    
    try {
      await deleteReminderService(reminderId);
      alert('Hatırlatıcı silindi!');
      loadData();
    } catch (error) {
      alert('Hatırlatıcı silinemedi!');
    }
  }, []);

  const handleUpdateUser = useCallback(async (userId, updates) => {
    try {
      await updateUser(userId, updates);
      alert('Kullanıcı güncellendi!');
      setEditingUser(null);
      setEditForm({ fullName: '', email: '', department: '', password: '' });
      loadData();
    } catch (error) {
      alert('Kullanıcı güncellenemedi!');
    }
  }, []);

  const handleEditUser = useCallback((user) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName || user.displayName || '',
      email: user.email || '',
      department: user.department || '',
      password: ''
    });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingUser(null);
    setEditForm({ fullName: '', email: '', department: '', password: '' });
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editForm.fullName.trim()) {
      alert('Ad Soyad alanı boş olamaz!');
      return;
    }

    const updates = {
      fullName: editForm.fullName.trim(),
      department: editForm.department,
      updatedAt: new Date()
    };

    if (editForm.password.trim()) {
      alert('Not: Şifre değiştirmek için kullanıcıya şifre sıfırlama linki gönderilmesi önerilir.');
    }

    handleUpdateUser(editingUser.id, updates);
  }, [editForm, editingUser, handleUpdateUser]);

  const handleAddDepartment = useCallback(() => {
    const trimmed = newDepartment.trim();
    if (!trimmed) {
      setDepartmentError('Birim adı boş olamaz');
      return;
    }

    const exists = localDepartments.some(
      (dept) => dept.toLowerCase() === trimmed.toLowerCase()
    );

    if (exists) {
      setDepartmentError('Bu birim zaten mevcut');
      return;
    }

    setLocalDepartments((prev) =>
      [...prev, trimmed].sort((a, b) => a.localeCompare(b, 'tr', { sensitivity: 'base' }))
    );
    setNewDepartment('');
    setDepartmentError('');
  }, [localDepartments, newDepartment]);

  const handleDeleteDepartment = useCallback((dept) => {
    if (window.confirm(`"${dept}" birimini silmek istediğinizden emin misiniz?`)) {
      setLocalDepartments((prev) => prev.filter((d) => d !== dept));
    }
  }, []);

  const handleSaveDepartments = useCallback(async () => {
    if (localDepartments.length === 0) {
      setDepartmentError('En az bir birim olmalıdır');
      return;
    }

    setSavingDepartments(true);
    setDepartmentError('');

    try {
      await updateDepartments(localDepartments);
      alert('Birimler güncellendi!');
      loadData();
    } catch (err) {
      const errorMessage = err.message || 'Birimler kaydedilemedi';
      setDepartmentError(errorMessage);
      alert(errorMessage);
    } finally {
      setSavingDepartments(false);
    }
  }, [localDepartments, updateDepartments]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddDepartment();
    }
  }, [handleAddDepartment]);

  const handleRefreshExcel = useCallback(async () => {
    setRefreshingExcel(true);
    try {
      await triggerFileWatcher();
      alert('Excel yenileme başlatıldı!');
    } catch (error) {
      alert('Excel yenilenemedi');
    } finally {
      setTimeout(() => setRefreshingExcel(false), 3000);
    }
  }, []);

  const formatDate = useCallback((timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('tr-TR') + ' ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  }, []);

  const filteredUsers = useMemo(() => users
    .filter(u => !u.deleted)
    .filter(u => 
      (u.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.department || '').toLowerCase().includes(searchQuery.toLowerCase())
    ), [users, searchQuery]);

  const filteredTasks = useMemo(() => tasks.filter(t =>
    (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  ), [tasks, searchQuery]);

  const filteredMessages = useMemo(() => messages.filter(m =>
    (m.content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.senderName || '').toLowerCase().includes(searchQuery.toLowerCase())
  ), [messages, searchQuery]);

  if (loading) {
    return (
      <div className="admin-panel">
        <SimpleHeader />
        <div className="admin-loading">
          <RefreshCw className="spin" size={48} />
          <p>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <SimpleHeader />
      
      <div className="admin-container">
        <div className="admin-header">
          <div className="admin-title">
            <Shield size={32} />
            <h1>Admin Panel</h1>
          </div>
          <button className="refresh-btn" onClick={loadData}>
            <RefreshCw size={20} />
            Yenile
          </button>
        </div>

        <div className="admin-tabs">
          <button 
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <BarChart3 size={20} />
            Dashboard
          </button>
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={20} />
            Kullanıcılar ({users.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'departments' ? 'active' : ''}`}
            onClick={() => setActiveTab('departments')}
          >
            <Building2 size={20} />
            Birimler ({localDepartments.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'excel' ? 'active' : ''}`}
            onClick={() => setActiveTab('excel')}
          >
            <FileSpreadsheet size={20} />
            Excel Yenile
          </button>
        </div>

        {activeTab === 'dashboard' && stats && (
          <div className="admin-content">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon users">
                  <Users size={24} />
                </div>
                <div className="stat-info">
                  <h3>{stats.totalUsers}</h3>
                  <p>Toplam Kullanıcı</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon tasks">
                  <Briefcase size={24} />
                </div>
                <div className="stat-info">
                  <h3>{stats.totalTasks}</h3>
                  <p>Toplam İş</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon messages">
                  <MessageSquare size={24} />
                </div>
                <div className="stat-info">
                  <h3>{stats.totalMessages}</h3>
                  <p>Toplam Mesaj</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon departments">
                  <Building2 size={24} />
                </div>
                <div className="stat-info">
                  <h3>{Object.keys(stats.usersByDepartment).length}</h3>
                  <p>Aktif Departman</p>
                </div>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>İş Durumları</h3>
                <div className="status-list">
                  <div className="status-item">
                    <span className="status-badge new">Yeni</span>
                    <span className="status-count">{stats.tasksByStatus.new}</span>
                  </div>
                  <div className="status-item">
                    <span className="status-badge in-progress">Devam Ediyor</span>
                    <span className="status-count">{stats.tasksByStatus.inProgress}</span>
                  </div>
                  <div className="status-item">
                    <span className="status-badge done">Tamamlandı</span>
                    <span className="status-count">{stats.tasksByStatus.done}</span>
                  </div>
                </div>
              </div>

              <div className="dashboard-card">
                <h3>Departmanlara Göre Kullanıcılar</h3>
                <div className="department-list">
                  {Object.entries(stats.usersByDepartment).map(([dept, count]) => (
                    <div key={dept} className="department-item">
                      <span>{dept}</span>
                      <span className="dept-count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="admin-content">
            <div className="search-bar">
              <Search size={20} />
              <input
                type="text"
                placeholder="Kullanıcı ara (isim, email, departman)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Ad Soyad</th>
                    <th>Email</th>
                    <th>Departman</th>
                    <th>Durum</th>
                    <th>Oluşturulma</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td>{u.fullName || u.displayName || '-'}</td>
                      <td>{u.email}</td>
                      <td><span className="badge">{u.department || 'Belirtilmemiş'}</span></td>
                      <td>
                        <span className="badge" style={{
                          backgroundColor: u.approved === false ? '#fff3cd' : '#d4edda',
                          color: u.approved === false ? '#856404' : '#155724'
                        }}>
                          {u.approved === false ? 'Onay Bekliyor' : 'Onaylandı'}
                        </span>
                      </td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td>
                        <div className="action-buttons">
                          {u.approved === false && (
                            <button 
                              className="btn-approve" 
                              onClick={() => handleApproveUser(u.id)} 
                              title="Onayla"
                            >
                              <Check size={20} />
                            </button>
                          )}
                          <button className="btn-edit" onClick={() => handleEditUser(u)} title="Düzenle">
                            <Edit2 size={20} />
                          </button>
                          <button className="btn-delete" onClick={() => handleDeleteUser(u.id)} title="Sil">
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="admin-content">
            <div className="search-bar">
              <Search size={20} />
              <input
                type="text"
                placeholder="İş ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>İş Adı</th>
                    <th>Durum</th>
                    <th>Departman</th>
                    <th>Oluşturan</th>
                    <th>Tarih</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map(t => (
                    <tr key={t.id}>
                      <td>{t.title}</td>
                      <td>
                        <span className={`status-badge ${t.status}`}>
                          {t.status === 'new' && 'Yeni'}
                          {t.status === 'in-progress' && 'Devam Ediyor'}
                          {t.status === 'done' && 'Tamamlandı'}
                        </span>
                      </td>
                      <td><span className="badge">{t.relatedDepartment || '-'}</span></td>
                      <td>{t.createdBy}</td>
                      <td>{formatDate(t.createdAt)}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-delete" onClick={() => handleDeleteTask(t.id)}>
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="admin-content">
            <div className="search-bar">
              <Search size={20} />
              <input
                type="text"
                placeholder="Mesaj ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Gönderen</th>
                    <th>Alıcı</th>
                    <th>Mesaj</th>
                    <th>Tarih</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMessages.map(m => (
                    <tr key={m.id}>
                      <td>{m.senderName} ({m.senderDepartment})</td>
                      <td>{m.recipientName} ({m.recipientDepartment})</td>
                      <td className="message-preview">{m.content}</td>
                      <td>{formatDate(m.createdAt)}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-delete" onClick={() => handleDeleteMessage(m.id)}>
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Work Permits Tab */}
        {activeTab === 'workPermits' && (
          <div className="admin-content">
            <div className="search-bar">
              <Search size={20} />
              <input
                type="text"
                placeholder="İş izni ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>İş Adı</th>
                    <th>Durum</th>
                    <th>Ekleyen</th>
                    <th>İlgili Birim</th>
                    <th>Bakım Türü</th>
                    <th>Tarih</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {workPermits.filter(p => 
                    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map(p => (
                    <tr key={p.id}>
                      <td>{p.title}</td>
                      <td>
                        <span className="badge" style={{
                          backgroundColor: p.status === 'approved' ? '#4caf50' : '#ff9800'
                        }}>
                          {p.status === 'approved' ? 'Onaylandı' : 'Onay Bekliyor'}
                        </span>
                      </td>
                      <td>{p.createdBy}</td>
                      <td><span className="badge">{p.relatedDepartment}</span></td>
                      <td><span className="badge">{p.maintenanceType}</span></td>
                      <td>{formatDate(p.createdAt)}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-delete" onClick={() => handleDeleteWorkPermit(p.id)} title="Sil">
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="admin-content">
            <div className="search-bar">
              <Search size={20} />
              <input
                type="text"
                placeholder="Bildirim ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Başlık</th>
                    <th>Mesaj</th>
                    <th>Tür</th>
                    <th>Hedef Birim</th>
                    <th>Oluşturan</th>
                    <th>Tarih</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.filter(n => 
                    n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    n.message?.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map(n => (
                    <tr key={n.id}>
                      <td>{n.title}</td>
                      <td className="message-preview">{n.message}</td>
                      <td><span className="badge">{n.type}</span></td>
                      <td><span className="badge">{n.targetDepartment || 'Tümü'}</span></td>
                      <td>{n.createdBy}</td>
                      <td>{formatDate(n.createdAt)}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-delete" onClick={() => handleDeleteNotification(n.id)} title="Sil">
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reminders Tab */}
        {activeTab === 'reminders' && (
          <div className="admin-content">
            <div className="search-bar">
              <Search size={20} />
              <input
                type="text"
                placeholder="Hatırlatıcı ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Başlık</th>
                    <th>Açıklama</th>
                    <th>Tarih</th>
                    <th>Tekrar</th>
                    <th>Kullanıcı</th>
                    <th>Oluşturulma</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {reminders.filter(r => 
                    r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    r.description?.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map(r => (
                    <tr key={r.id}>
                      <td>{r.title}</td>
                      <td className="message-preview">{r.description}</td>
                      <td>{formatDate(r.date)}</td>
                      <td><span className="badge">{r.repeat || 'Yok'}</span></td>
                      <td>{r.createdBy}</td>
                      <td>{formatDate(r.createdAt)}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-delete" onClick={() => handleDeleteReminder(r.id)} title="Sil">
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Departments Management Tab */}
        {activeTab === 'departments' && (
          <div className="admin-content">
            <div className="departments-management">
              <div className="departments-header-section">
                <div className="header-icon-dept">
                  <Building2 size={32} />
                </div>
                <div className="header-text">
                  <h2>Birimleri Yönet</h2>
                  <p>Şirketinizdeki birimleri ekleyin veya kaldırın</p>
                </div>
              </div>

              <div className="departments-form">
                <div className="add-department-section">
                  <div className="add-department-input">
                    <Plus size={20} />
                    <input
                      type="text"
                      value={newDepartment}
                      onChange={(e) => {
                        setNewDepartment(e.target.value);
                        setDepartmentError('');
                      }}
                      onKeyPress={handleKeyPress}
                      placeholder="Yeni birim adı girin"
                    />
                  </div>
                  <button 
                    className="add-dept-btn" 
                    onClick={handleAddDepartment}
                  >
                    <Plus size={20} />
                    Ekle
                  </button>
                </div>

                {departmentError && (
                  <div className="error-message">
                    {departmentError}
                  </div>
                )}

                <div className="departments-list-section">
                  <div className="list-header">
                    <Users size={20} />
                    <span>Mevcut Birimler ({localDepartments.length})</span>
                  </div>
                  
                  <div className="departments-list">
                    {localDepartments.map((dept, index) => (
                      <div key={index} className="department-item">
                        <div className="department-info">
                          <Building2 size={20} />
                          <span>{dept}</span>
                        </div>
                        <button
                          className="delete-dept-btn"
                          onClick={() => handleDeleteDepartment(dept)}
                          title="Sil"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="departments-actions">
                  <button 
                    className="save-dept-btn" 
                    onClick={handleSaveDepartments}
                    disabled={savingDepartments}
                  >
                    {savingDepartments ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Excel Refresh Tab */}
        {activeTab === 'excel' && (
          <div className="admin-content">
            <div className="departments-management">
              <div className="departments-header-section">
                <div className="header-icon-dept">
                  <FileSpreadsheet size={32} />
                </div>
                <div className="header-text">
                  <h2>Excel Dosyalarını Yenile</h2>
                  <p>Excel dosyalarını manuel olarak yenileyin</p>
                </div>
              </div>

              <div className="excel-refresh-content">
                <div className="excel-refresh-action">
                  <button 
                    className="refresh-excel-btn"
                    onClick={handleRefreshExcel}
                    disabled={refreshingExcel}
                  >
                    <RefreshCw size={24} className={refreshingExcel ? 'spinning' : ''} />
                    <div>
                      <h3>{refreshingExcel ? 'Yenileniyor...' : 'Excel Dosyalarını Yenile'}</h3>
                      <p>Dosyaları güncelle</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Edit Modal */}
      {editingUser && (
        <div className="modal-overlay" onClick={handleCancelEdit}>
          <div className="modal-content edit-user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Kullanıcı Düzenle</h2>
              <button className="modal-close" onClick={handleCancelEdit}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Ad Soyad *</label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  placeholder="Ad Soyad"
                />
              </div>
              
              <div className="form-group">
                <label>Email (Değiştirilemez)</label>
                <input
                  type="email"
                  value={editForm.email}
                  disabled
                  className="disabled-input"
                />
                <small className="form-hint">Email adresi güvenlik nedeniyle değiştirilemez</small>
              </div>
              
              <div className="form-group">
                <label>Birim</label>
                <select
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                >
                  <option value="">Birim Seçin</option>
                  {(departments || DEPARTMENTS).map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Yeni Şifre (İsteğe bağlı)</label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="Boş bırakılırsa değiştirilmez"
                />
                <small className="form-hint">Şifre değiştirme özelliği şu anda Firebase güvenlik kısıtlamaları nedeniyle kullanılamıyor. Kullanıcıya şifre sıfırlama linki gönderilmesi önerilir.</small>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={handleCancelEdit}>
                İptal
              </button>
              <button className="btn-primary" onClick={handleSaveEdit}>
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
