import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { LogOut, User, Shield, ArrowLeft, Home, Bell, MessageSquare, Megaphone } from 'lucide-react';
import { isAdmin } from '../../services/adminService';
import Modal from '../ui/Modal';
import ProfileModal from '../profile/ProfileModal';
import logo from '../../assets/logo.png';
import './SimpleHeader.css';

const SimpleHeader = () => {
  const navigate = useNavigate();
  const { user, logout, unreadNotificationsCount, unreadAnnouncementsCount, conversations = [] } = useApp();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const profileMenuRef = useRef(null);
  const notificationsMenuRef = useRef(null);
  
  // Okunmamış mesaj sayısını hesapla (toplam mesaj sayısı)
  const unreadMessagesCount = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
  
  // Toplam bildirim sayısı
  const totalNotifications = unreadAnnouncementsCount + unreadNotificationsCount + unreadMessagesCount;

  // Dışarı tıklayınca menüyü kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notificationsMenuRef.current && !notificationsMenuRef.current.contains(event.target)) {
        setShowNotificationsMenu(false);
      }
    };

    if (showProfileMenu || showNotificationsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu, showNotificationsMenu]);

  const handleLogout = () => {
    if (window.confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
      logout();
    }
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleProfileModalOpen = () => {
    setShowProfileMenu(false);
    setShowProfileModal(true);
  };

  const handleLogoClick = () => {
    navigate('/main-menu');
  };

  const toggleNotificationsMenu = () => {
    setShowNotificationsMenu(!showNotificationsMenu);
  };

  const handleNotificationClick = (path) => {
    setShowNotificationsMenu(false);
    navigate(path);
  };

  return (
    <header className="simple-header">
      <div className="header-container">
        <div className="header-nav-buttons">
          <button className="header-back-btn" onClick={() => navigate(-1)} title="Geri">
            <ArrowLeft size={24} />
          </button>
          <button className="header-home-btn" onClick={handleLogoClick} title="Ana Menü">
            <Home size={24} />
          </button>
        </div>
        <div className="header-brand" onClick={handleLogoClick}>
          <img src={logo} alt="Ecocell Logo" className="header-logo" />
        </div>

        <div className="header-actions">
          <div className="header-actions-buttons">
            <div className="header-notifications-wrapper" ref={notificationsMenuRef}>
              <button 
                className="header-action-btn" 
                onClick={toggleNotificationsMenu}
                title="Bildirimler"
              >
                <Bell size={24} />
                {totalNotifications > 0 && (
                  <span className="header-badge">{totalNotifications}</span>
                )}
              </button>

              {showNotificationsMenu && (
                <div className="notifications-dropdown">
                <button 
                  className="notifications-dropdown-item" 
                  onClick={() => handleNotificationClick('/announcements')}
                >
                  <Megaphone size={18} />
                  <span>Duyurular</span>
                  {unreadAnnouncementsCount > 0 && (
                    <span className="dropdown-badge">{unreadAnnouncementsCount}</span>
                  )}
                </button>
                
                <button 
                  className="notifications-dropdown-item" 
                  onClick={() => handleNotificationClick('/notifications')}
                >
                  <Bell size={18} />
                  <span>Bildirimler</span>
                  {unreadNotificationsCount > 0 && (
                    <span className="dropdown-badge">{unreadNotificationsCount}</span>
                  )}
                </button>
                
                <button 
                  className="notifications-dropdown-item" 
                  onClick={() => handleNotificationClick('/messages')}
                >
                  <MessageSquare size={18} />
                  <span>Mesajlar</span>
                  {unreadMessagesCount > 0 && (
                    <span className="dropdown-badge">{unreadMessagesCount}</span>
                  )}
                </button>
              </div>
            )}
            </div>
            
            <div className="header-profile-wrapper" ref={profileMenuRef}>
              <button 
                className="header-action-btn" 
                onClick={toggleProfileMenu}
                title="Profil"
              >
                <User size={24} />
              </button>

              {showProfileMenu && (
                <div className="notifications-dropdown">
                  <button className="notifications-dropdown-item" onClick={handleProfileModalOpen}>
                    <User size={18} />
                    <span>Profil</span>
                  </button>
                  {isAdmin(user) && (
                    <button className="notifications-dropdown-item" onClick={() => { setShowProfileMenu(false); navigate('/admin'); }}>
                      <Shield size={18} />
                      <span>Admin Panel</span>
                    </button>
                  )}
                  <button className="notifications-dropdown-item logout" onClick={handleLogout}>
                    <LogOut size={18} />
                    <span>Çıkış Yap</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showProfileModal && (
        <Modal isOpen={true} onClose={() => setShowProfileModal(false)} size="small">
          <ProfileModal onClose={() => setShowProfileModal(false)} />
        </Modal>
      )}
    </header>
  );
};

export default SimpleHeader;
