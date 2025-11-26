import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { LogOut, User, ChevronDown, Shield, ArrowLeft, Home, Bell, MessageSquare, Megaphone } from 'lucide-react';
import { isAdmin } from '../../services/adminService';
import Modal from '../ui/Modal';
import ProfileModal from '../profile/ProfileModal';
import logo from '../../assets/logo.png';
import './SimpleHeader.css';

const SimpleHeader = () => {
  const navigate = useNavigate();
  const { user, logout, unreadNotificationsCount, unreadAnnouncementsCount, conversations = [] } = useApp();
  const [showMenu, setShowMenu] = useState(false);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const menuRef = useRef(null);
  const notificationsMenuRef = useRef(null);
  
  // Okunmamış mesaj sayısını hesapla
  const unreadMessagesCount = conversations.filter(conv => conv.unreadCount > 0).length;
  
  // Toplam bildirim sayısı
  const totalNotifications = unreadAnnouncementsCount + unreadNotificationsCount + unreadMessagesCount;

  // Dışarı tıklayınca menüyü kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
      if (notificationsMenuRef.current && !notificationsMenuRef.current.contains(event.target)) {
        setShowNotificationsMenu(false);
      }
    };

    if (showMenu || showNotificationsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu, showNotificationsMenu]);

  const handleLogout = () => {
    if (window.confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
      logout();
    }
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleProfileClick = () => {
    setShowMenu(false);
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
            
            <button 
              className="header-action-btn" 
              onClick={handleProfileClick}
              title="Profil"
            >
              <User size={24} />
            </button>
          </div>
          
          <div className="header-user" ref={menuRef}>
            <button className="user-menu-trigger" onClick={toggleMenu}>
              <div className="user-info">
                <span className="user-name">{user?.fullName || user?.username}</span>
                <span className="user-department">{user?.department}</span>
              </div>
              <ChevronDown size={18} className={`chevron ${showMenu ? 'open' : ''}`} />
            </button>
            
            {showMenu && (
              <div className="user-dropdown">
                <button className="dropdown-item" onClick={handleProfileClick}>
                  <User size={16} />
                  <span>Profil</span>
                </button>
                {isAdmin(user) && (
                  <>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item admin" onClick={() => { setShowMenu(false); navigate('/admin'); }}>
                      <Shield size={16} />
                      <span>Admin Panel</span>
                    </button>
                  </>
                )}
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Çıkış Yap</span>
                </button>
              </div>
            )}
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
