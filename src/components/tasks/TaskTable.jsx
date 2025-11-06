import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit2, Trash2, Calendar, User, Building2, FileText, ArrowUpDown, MessageSquare } from 'lucide-react';
import TaskForm from './TaskForm';
import TaskEditForm from './TaskEditForm';
import QuickMessageModal from './QuickMessageModal';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import './TaskTable.css';

const TaskTable = () => {
  const { tasks, deleteTask, user } = useApp();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [messageTask, setMessageTask] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const statusOptions = [
    { id: 'all', label: 'Tümü', color: '#757575' },
    { id: 'new', label: 'Yeni', color: '#FFD700' },
    { id: 'in-progress', label: 'Devam Ediyor', color: '#FF6B35' },
    { id: 'done', label: 'Tamamlandı', color: '#4caf50' },
  ];

  // Kullanıcı kendi birimindeki işleri görsün (admin hariç - admin hepsini görür)
  const userDepartmentTasks = user?.email === 'berke.parlat27@gmail.com' 
    ? tasks 
    : tasks.filter(t => t.department === user?.department);

  const filteredTasks = selectedStatus === 'all' 
    ? userDepartmentTasks 
    : userDepartmentTasks.filter(t => t.status === selectedStatus);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (!sortConfig.key) return 0;

    // No (index) sıralaması için
    if (sortConfig.key === 'index') {
      const aIndex = filteredTasks.indexOf(a);
      const bIndex = filteredTasks.indexOf(b);
      return sortConfig.direction === 'asc' ? aIndex - bIndex : bIndex - aIndex;
    }

    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    // Tarih sıralaması için (createdAt ve dueDate)
    if (sortConfig.key === 'createdAt' || sortConfig.key === 'dueDate') {
      // Boş tarihleri en sona koy
      if (!aValue && !bValue) return 0;
      if (!aValue) return sortConfig.direction === 'asc' ? 1 : -1;
      if (!bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    // String sıralaması için
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const getStatusLabel = (status) => {
    const statusMap = {
      'new': 'Yeni',
      'in-progress': 'Devam Ediyor',
      'done': 'Tamamlandı'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'new': '#FFD700',
      'in-progress': '#FF6B35',
      'done': '#4caf50'
    };
    return colorMap[status] || '#757575';
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleMessage = (task) => {
    setMessageTask(task);
  };

  const handleDelete = (taskId) => {
    if (window.confirm('Bu işi silmek istediğinizden emin misiniz?')) {
      deleteTask(taskId);
    }
  };

  const handleCloseForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="task-table-container">
      <div className="table-header">
        <div className="table-title">
          <h2>İş Takibi</h2>
          <span className="task-count">{sortedTasks.length} iş</span>
        </div>
        
        <div className="table-actions">
          <div className="status-filter">
            {statusOptions.map(status => (
              <button
                key={status.id}
                className={`filter-btn ${selectedStatus === status.id ? 'active' : ''}`}
                onClick={() => setSelectedStatus(status.id)}
                style={{
                  '--status-color': status.color,
                }}
              >
                {status.label}
              </button>
            ))}
          </div>
          
          <Button 
            variant="primary" 
            onClick={() => setShowTaskForm(true)}
            className="add-task-btn"
          >
            <Plus size={18} />
            Yeni İş
          </Button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="task-table">
          <thead>
            <tr>
              <th style={{ width: '5%' }} onClick={() => handleSort('index')} className="sortable-header">
                <span>No</span>
                <ArrowUpDown size={14} />
              </th>
              <th style={{ width: '20%' }} onClick={() => handleSort('title')} className="sortable-header">
                <span>İş Adı</span>
                <ArrowUpDown size={14} />
              </th>
              <th style={{ width: '12%' }} onClick={() => handleSort('status')} className="sortable-header">
                <span>Durum</span>
                <ArrowUpDown size={14} />
              </th>
              <th style={{ width: '12%' }} onClick={() => handleSort('relatedDepartment')} className="sortable-header">
                <span>İlgili Birim</span>
                <ArrowUpDown size={14} />
              </th>
              <th style={{ width: '12%' }} onClick={() => handleSort('createdBy')} className="sortable-header">
                <span>Ekleyen</span>
                <ArrowUpDown size={14} />
              </th>
              <th style={{ width: '10%' }} onClick={() => handleSort('dueDate')} className="sortable-header">
                <span>Teslim Tarihi</span>
                <ArrowUpDown size={14} />
              </th>
              <th style={{ width: '11%' }}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {sortedTasks.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-state">
                  <FileText size={48} />
                  <p>Henüz iş eklenmemiş</p>
                  <button 
                    className="empty-add-btn"
                    onClick={() => setShowTaskForm(true)}
                  >
                    İlk işi ekle
                  </button>
                </td>
              </tr>
            ) : (
              sortedTasks.map((task, index) => (
                <tr key={task.id} className="task-row">
                  <td className="task-number">{index + 1}</td>
                  <td className="task-name">
                    <div className="task-name-content">
                      <span className="name-text">{task.title}</span>
                      {task.description && (
                        <span className="task-description-preview">{task.description}</span>
                      )}
                    </div>
                  </td>
                  <td className="task-status-cell">
                    <span 
                      className="status-badge"
                      style={{
                        backgroundColor: getStatusColor(task.status),
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        display: 'inline-block'
                      }}
                    >
                      {getStatusLabel(task.status)}
                    </span>
                  </td>
                  <td className="task-department">
                    <div className="department-badge">
                      {task.relatedDepartment || 'Belirtilmemiş'}
                    </div>
                  </td>
                  <td className="task-creator">
                    <div className="creator-info">
                      <User size={14} />
                      {task.createdBy}
                    </div>
                  </td>
                  <td className="task-date">
                    <div className="date-info">
                      <Calendar size={14} />
                      {task.dueDate ? formatDate(task.dueDate) : '-'}
                    </div>
                  </td>
                  <td className="task-actions">
                    <button
                      className="action-btn message-btn"
                      onClick={() => handleMessage(task)}
                      title="Mesaj Gönder"
                    >
                      <MessageSquare size={16} />
                    </button>
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEdit(task)}
                      title="Düzenle"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(task.id)}
                      title="Sil"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showTaskForm && (
        <Modal onClose={handleCloseForm} size="large">
          {editingTask ? (
            <TaskEditForm 
              task={editingTask} 
              onClose={handleCloseForm}
            />
          ) : (
            <TaskForm 
              onClose={handleCloseForm}
              initialStatus="new"
            />
          )}
        </Modal>
      )}

      {messageTask && (
        <QuickMessageModal 
          task={messageTask} 
          onClose={() => setMessageTask(null)}
        />
      )}
    </div>
  );
};

export default TaskTable;
