import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import SimpleHeader from '../../components/layout/SimpleHeader';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  Filter,
  Briefcase,
  MessageSquare,
  FileText,
  AlertCircle,
  Users
} from 'lucide-react';
import './Notifications.css';

const Notifications = () => {
  const { 
    notifications, 
    unreadNotificationsCount,
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    deleteNotification,
    deleteAllNotifications 
  } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // all, unread
  const [loading, setLoading] = useState(false);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task':
        return <Briefcase size={20} />;
      case 'message':
        return <MessageSquare size={20} />;
      case 'announcement':
        return <Bell size={20} />;
      case 'workPermit':
        return <FileText size={20} />;
      default:
        return <AlertCircle size={20} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'task':
        return '#00BCD4';
      case 'message':
        return '#673AB7';
      case 'announcement':
        return '#FF6B35';
      case 'workPermit':
        return '#3F51B5';
      default:
        return '#757575';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') {
      return !notification.read;
    }
    return true;
  });

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadNotificationsCount === 0) return;
    
    setLoading(true);
    try {
      await markAllNotificationsAsRead();
    } catch (error) {
      alert('Bildirimler okundu işaretlenemedi!');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Tüm bildirimleri silmek istediğinize emin misiniz?')) {
      return;
    }
    
    setLoading(true);
    try {
      await deleteAllNotifications();
    } catch (error) {
      alert('Bildirimler silinemedi!');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    
    setLoading(true);
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      alert('Bildirim silinemedi!');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <div className="notifications-page">
      <SimpleHeader />
      
      <div className="notifications-container">
        <div className="notifications-header">
          <div className="header-title">
            <Bell size={24} />
            <h1>Bildirimler</h1>
            {unreadNotificationsCount > 0 && (
              <span className="unread-badge">{unreadNotificationsCount}</span>
            )}
          </div>
          
          <div className="header-actions">
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                Tümü ({notifications.length})
              </button>
              <button 
                className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                onClick={() => setFilter('unread')}
              >
                Okunmamış ({unreadNotificationsCount})
              </button>
            </div>
            
            <div className="action-buttons">
              <button 
                className="action-btn"
                onClick={handleMarkAllAsRead}
                disabled={loading || unreadNotificationsCount === 0}
                title="Tümünü okundu işaretle"
              >
                <CheckCheck size={20} />
                Tümünü Okundu İşaretle
              </button>
              <button 
                className="action-btn delete-btn"
                onClick={handleDeleteAll}
                disabled={loading || notifications.length === 0}
                title="Tümünü sil"
              >
                <Trash2 size={20} />
                Tümünü Sil
              </button>
            </div>
          </div>
        </div>

        <div className="notifications-list">
          {filteredNotifications.length === 0 ? (
            <div className="empty-state">
              <Bell size={48} />
              <h3>Bildirim yok</h3>
              <p>
                {filter === 'unread' 
                  ? 'Okunmamış bildiriminiz bulunmuyor.' 
                  : 'Henüz bildiriminiz yok.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div 
                  className="notification-icon"
                  style={{ backgroundColor: getNotificationColor(notification.type) }}
                >
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="notification-content">
                  <div className="notification-header">
                    <h3>{notification.title}</h3>
                    {!notification.read && <span className="unread-dot"></span>}
                  </div>
                  <p className="notification-message">{notification.message}</p>
                  <span className="notification-time">{formatDate(notification.createdAt)}</span>
                </div>

                <button
                  className="delete-notification-btn"
                  onClick={(e) => handleDeleteNotification(e, notification.id)}
                  title="Bildirimi sil"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
