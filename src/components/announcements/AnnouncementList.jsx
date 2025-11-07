import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Bell, MoreVertical, Edit2, Trash2, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import AnnouncementForm from './AnnouncementForm';
import './AnnouncementList.css';

const AnnouncementList = () => {
  const { user, announcements, deleteAnnouncement } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setShowForm(true);
    setActiveMenu(null);
  };

  const handleDelete = async (announcementId) => {
    if (window.confirm('Bu duyuruyu silmek istediğinizden emin misiniz?')) {
      await deleteAnnouncement(announcementId);
      setActiveMenu(null);
    }
  };

  const handleAddNew = () => {
    setEditingAnnouncement(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAnnouncement(null);
  };

  const handleViewDetails = (announcement) => {
    setSelectedAnnouncement(announcement);
    setActiveMenu(null);
  };

  const getPriorityClass = (priority) => {
    const priorityMap = {
      'low': 'priority-low',
      'medium': 'priority-medium',
      'high': 'priority-high',
      'urgent': 'priority-urgent'
    };
    return priorityMap[priority] || 'priority-medium';
  };

  const getPriorityLabel = (priority) => {
    const priorityMap = {
      'low': 'Bilgilendirme',
      'medium': 'Normal',
      'high': 'Önemli',
      'urgent': 'Acil'
    };
    return priorityMap[priority] || 'Normal';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="announcement-list-container">
      <div className="announcement-header">
        <div className="announcement-header-left">
          <Bell size={24} />
          <div>
            <h1>Duyurular</h1>
            <p>Genel duyuruları görüntüleyin ve yönetin</p>
          </div>
        </div>
        {user?.role === 'admin' && (
          <Button onClick={handleAddNew} className="add-announcement-btn">
            <Plus size={20} />
            Yeni Duyuru Ekle
          </Button>
        )}
      </div>

      <div className="announcements-grid">
        {announcements.length === 0 ? (
          <div className="no-announcements">
            <AlertCircle size={48} />
            <p>Henüz duyuru bulunmamaktadır.</p>
            {user?.role === 'admin' && (
              <Button onClick={handleAddNew}>Yeni Duyuru Ekle</Button>
            )}
          </div>
        ) : (
          announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`announcement-card ${getPriorityClass(announcement.priority)}`}
            >
              <div className="announcement-card-header">
                <div className="announcement-priority-badge">
                  {getPriorityLabel(announcement.priority)}
                </div>
                {user?.role === 'admin' && (
                  <div className="announcement-actions">
                    <button
                      className="action-btn"
                      onClick={() => setActiveMenu(activeMenu === announcement.id ? null : announcement.id)}
                    >
                      <MoreVertical size={18} />
                    </button>
                    {activeMenu === announcement.id && (
                      <div className="action-dropdown">
                        <button onClick={() => handleEdit(announcement)}>
                          <Edit2 size={16} />
                          Düzenle
                        </button>
                        <button onClick={() => handleDelete(announcement.id)} className="delete-action">
                          <Trash2 size={16} />
                          Sil
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <h3 className="announcement-title">{announcement.title}</h3>
              
              <p className="announcement-preview">
                {announcement.content.length > 150
                  ? `${announcement.content.substring(0, 150)}...`
                  : announcement.content}
              </p>

              {announcement.content.length > 150 && (
                <button
                  className="read-more-btn"
                  onClick={() => handleViewDetails(announcement)}
                >
                  Devamını Oku
                </button>
              )}

              <div className="announcement-footer">
                <div className="announcement-author">
                  <strong>{announcement.createdBy}</strong>
                  {announcement.department && (
                    <span className="author-dept"> • {announcement.department}</span>
                  )}
                </div>
                <div className="announcement-date">
                  {formatDate(announcement.createdAt)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={showForm} onClose={handleCloseForm}>
        <AnnouncementForm announcement={editingAnnouncement} onClose={handleCloseForm} />
      </Modal>

      <Modal isOpen={!!selectedAnnouncement} onClose={() => setSelectedAnnouncement(null)}>
        {selectedAnnouncement && (
          <div className="announcement-detail">
            <div className="announcement-detail-header">
              <h2>{selectedAnnouncement.title}</h2>
              <div className={`priority-badge ${getPriorityClass(selectedAnnouncement.priority)}`}>
                {getPriorityLabel(selectedAnnouncement.priority)}
              </div>
            </div>
            <div className="announcement-detail-content">
              <p>{selectedAnnouncement.content}</p>
            </div>
            <div className="announcement-detail-footer">
              <div className="announcement-author">
                <strong>{selectedAnnouncement.createdBy}</strong>
                {selectedAnnouncement.department && (
                  <span> • {selectedAnnouncement.department}</span>
                )}
              </div>
              <div className="announcement-date">
                {formatDate(selectedAnnouncement.createdAt)}
              </div>
            </div>
            <div className="announcement-detail-actions">
              <Button onClick={() => setSelectedAnnouncement(null)}>Kapat</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AnnouncementList;
