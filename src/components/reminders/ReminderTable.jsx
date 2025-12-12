import { useState, useMemo, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Edit2, Trash2, ArrowUpDown, Search, Clock, AlertCircle, User, Users } from 'lucide-react';
import ReminderForm from './ReminderForm';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { calculateRemainingTime, getPeriodText } from '../../services/reminderService';
import './ReminderTable.css';

const ReminderTable = () => {
  const { reminders, deleteReminder } = useApp();
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const filteredReminders = useMemo(() => {
    return reminders.filter(reminder => {
      const matchesSearch = reminder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (reminder.description && reminder.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesSearch;
    });
  }, [reminders, searchTerm]);

  const handleSort = useCallback((key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }, [sortConfig]);

  const sortedReminders = useMemo(() => {
    return [...filteredReminders].sort((a, b) => {
      if (!sortConfig.key) return 0;

      if (sortConfig.key === 'remaining') {
        const aRemaining = calculateRemainingTime(a.createdAt, a.period);
        const bRemaining = calculateRemainingTime(b.createdAt, b.period);
        return sortConfig.direction === 'asc' 
          ? aRemaining.days - bRemaining.days 
          : bRemaining.days - aRemaining.days;
      }

      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

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
  }, [filteredReminders, sortConfig]);

  const handleEdit = useCallback((reminder) => {
    setEditingReminder(reminder);
    setShowReminderForm(true);
  }, []);

  const handleDelete = useCallback(async (reminderId) => {
    if (window.confirm('Bu hatırlatıcıyı silmek istediğinize emin misiniz?')) {
      try {
        await deleteReminder(reminderId);
      } catch (error) {
        alert('Hatırlatıcı silinirken bir hata oluştu!');
      }
    }
  }, [deleteReminder]);

  const handleCloseForm = useCallback(() => {
    setShowReminderForm(false);
    setEditingReminder(null);
  }, []);

  const getRemainingTimeColor = (status) => {
    const colorMap = {
      'urgent': '#f44336',
      'warning': '#FF9800',
      'safe': '#4caf50'
    };
    return colorMap[status] || '#757575';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="reminder-table-container">
      <div className="reminder-table-header">
        <div className="reminder-table-title">
          <Clock size={24} />
          <h2>Hatırlatıcılarım</h2>
          <span className="reminder-count">{reminders.length}</span>
        </div>
        <button 
          className="reminder-add-btn"
          onClick={() => setShowReminderForm(true)}
        >
          <Plus size={18} />
          Yeni Hatırlatıcı
        </button>
      </div>

      <div className="reminder-table-filters">
        <div className="reminder-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Hatırlatıcı ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {sortedReminders.length === 0 ? (
        <div className="reminder-empty-state">
          <Clock size={48} />
          <h3>Henüz hatırlatıcınız yok</h3>
          <p>Periyodik işleriniz için hatırlatıcı oluşturun</p>
        </div>
      ) : (
        <div className="reminder-table-wrapper">
          <table className="reminder-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('title')} className="sortable">
                  <span>İş Adı</span>
                  <ArrowUpDown size={14} />
                </th>
                <th>İş Tanımı</th>
                <th onClick={() => handleSort('isShared')} className="sortable">
                  <span>Tür</span>
                  <ArrowUpDown size={14} />
                </th>
                <th onClick={() => handleSort('period')} className="sortable">
                  <span>Periyot</span>
                  <ArrowUpDown size={14} />
                </th>
                <th onClick={() => handleSort('createdAt')} className="sortable">
                  <span>Eklenme Tarihi</span>
                  <ArrowUpDown size={14} />
                </th>
                <th onClick={() => handleSort('remaining')} className="sortable">
                  <span>Kalan Süre</span>
                  <ArrowUpDown size={14} />
                </th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {sortedReminders.map((reminder) => {
                const remainingTime = calculateRemainingTime(reminder.createdAt, reminder.period, reminder.specificDate);
                return (
                  <tr key={reminder.id}>
                    <td className="reminder-title-cell">
                      <strong>{reminder.title}</strong>
                    </td>
                    <td className="reminder-desc-cell">
                      <div className="reminder-description">
                        {reminder.description}
                      </div>
                    </td>
                    <td>
                      <span className={`reminder-type-badge ${reminder.isShared ? 'shared' : 'personal'}`}>
                        {reminder.isShared ? (
                          <>
                            <Users size={14} />
                            <span>Ortak</span>
                          </>
                        ) : (
                          <>
                            <User size={14} />
                            <span>Şahsi</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td>
                      <span className="reminder-period-badge">
                        {getPeriodText(reminder.period)}
                      </span>
                    </td>
                    <td>{formatDate(reminder.createdAt)}</td>
                    <td>
                      <div 
                        className="reminder-remaining-time"
                        style={{ color: getRemainingTimeColor(remainingTime.status) }}
                      >
                        {remainingTime.status === 'urgent' && <AlertCircle size={16} />}
                        <span>{remainingTime.text}</span>
                      </div>
                    </td>
                    <td>
                      <div className="reminder-actions">
                        <button
                          className="reminder-action-btn edit"
                          onClick={() => handleEdit(reminder)}
                          title="Düzenle"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="reminder-action-btn delete"
                          onClick={() => handleDelete(reminder.id)}
                          title="Sil"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showReminderForm} onClose={handleCloseForm}>
        <ReminderForm reminder={editingReminder} onClose={handleCloseForm} />
      </Modal>
    </div>
  );
};

export default ReminderTable;
