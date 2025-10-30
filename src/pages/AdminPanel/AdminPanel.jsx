import { useState, useEffect } from 'react';
import { useApp, DEPARTMENTS } from '../../context/AppContext';
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
  deleteMessage as deleteMessageService
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
  Calendar,
  Plus,
  X
} from 'lucide-react';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user, updateDepartments, departments = DEPARTMENTS } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  
  // Departments management state
  const [localDepartments, setLocalDepartments] = useState([...DEPARTMENTS]);
  const [newDepartment, setNewDepartment] = useState('');
  const [departmentError, setDepartmentError] = useState('');
  const [savingDepartments, setSavingDepartments] = useState(false);
  useEffect(() => {
    if (!user || !isAdmin(user)) {
      navigate('/dashboard');
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
      const [statsData, usersData, tasksData, messagesData] = await Promise.all([
        getStatistics(),
        getAllUsers(),
        getAllTasks(),
        getAllMessages()
      ]);
      setStats(statsData);
      setUsers(usersData);
      setTasks(tasksData);
      setMessages(messagesData);
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
      alert('Veriler yüklenemedi!');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return;
    
    try {
      await deleteUserService(userId);
      alert('Kullanıcı silindi!');
      loadData();
    } catch (error) {
      alert('Kullanıcı silinemedi!');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Bu işi silmek istediğinizden emin misiniz?')) return;
    
    try {
      await deleteTaskService(taskId);
      alert('İş silindi!');
      loadData();
    } catch (error) {
      alert('İş silinemedi!');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Bu mesajı silmek istediğinizden emin misiniz?')) return;
    
    try {
      await deleteMessageService(messageId);
      alert('Mesaj silindi!');
      loadData();
    } catch (error) {
      alert('Mesaj silinemedi!');
    }
  };
  const handleUpdateUser = async (userId, updates) => {
    try {
      await updateUser(userId, updates);
      alert('Kullanıcı güncellendi!');
      setEditingUser(null);
      loadData();
    } catch (error) {
      alert('Kullanıcı güncellenemedi!');
    }
  };

  // Department management functions
  const handleAddDepartment = () => {
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
  };

  const handleDeleteDepartment = (dept) => {
    if (window.confirm(`"${dept}" birimini silmek istediğinizden emin misiniz?`)) {
      setLocalDepartments((prev) => prev.filter((d) => d !== dept));
    }
  };

  const handleSaveDepartments = async () => {
    if (localDepartments.length === 0) {
      setDepartmentError('En az bir birim olmalıdır');
      return;
    }

    setSavingDepartments(true);
    setDepartmentError('');

    try {
      await updateDepartments(localDepartments);
      alert('Birimler başarıyla güncellendi!');
      loadData();
    } catch (err) {
      console.error('Birimler kaydedilirken hata oluştu:', err);
      setDepartmentError('Birimler kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSavingDepartments(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddDepartment();
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('tr-TR') + ' ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const filteredUsers = users.filter(u => 
    (u.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.department || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTasks = tasks.filter(t =>
    (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMessages = messages.filter(m =>
    (m.content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.senderName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <div>
              <h1>Admin Panel</h1>
              <p>Sistem Yönetimi</p>
            </div>
          </div>
          <button className="refresh-btn" onClick={loadData}>
            <RefreshCw size={18} />
            Yenile
          </button>
        </div>        <div className="admin-tabs">
          <button 
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <BarChart3 size={18} />
            Dashboard
          </button>
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} />
            Kullanıcılar ({users.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            <Briefcase size={18} />
            İşler ({tasks.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            <MessageSquare size={18} />
            Mesajlar ({messages.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'departments' ? 'active' : ''}`}
            onClick={() => setActiveTab('departments')}
          >
            <Building2 size={18} />
            Birimleri Yönet
          </button>
        </div>

        {/* Dashboard Tab */}
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
              <Search size={18} />
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
                    <th>Oluşturulma</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td>{u.fullName || u.displayName || '-'}</td>
                      <td>{u.email}</td>
                      <td><span className="badge">{u.department || 'Belirtilmemiş'}</span></td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-delete" onClick={() => handleDeleteUser(u.id)}>
                            <Trash2 size={16} />
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
              <Search size={18} />
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
                            <Trash2 size={16} />
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
              <Search size={18} />
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
                            <Trash2 size={16} />
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

        {/* Departments Tab */}
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
                    <Plus size={18} />
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
                    <Plus size={18} />
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
                    <Users size={18} />
                    <span>Mevcut Birimler ({localDepartments.length})</span>
                  </div>
                  
                  <div className="departments-list">
                    {localDepartments.map((dept, index) => (
                      <div key={index} className="department-item">
                        <div className="department-info">
                          <Building2 size={16} />
                          <span>{dept}</span>
                        </div>
                        <button
                          className="delete-dept-btn"
                          onClick={() => handleDeleteDepartment(dept)}
                          title="Sil"
                        >
                          <Trash2 size={16} />
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
      </div>
    </div>
  );
};

export default AdminPanel;
