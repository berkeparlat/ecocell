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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const menuRef = useRef(null);
  
  // Okunmamış mesaj sayısını hesapla
  const unreadMessagesCount = conversations.filter(conv => conv.unreadCount > 0).length;

  // Dışarı tıklayınca menüyü kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

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
          <button 
            className="header-nav-icon-btn" 
            onClick={() => navigate('/announcements')}
            title="Duyurular"
          >
            <Megaphone size={22} />
            {unreadAnnouncementsCount > 0 && (
              <span className="header-badge">{unreadAnnouncementsCount}</span>
            )}
          </button>
          
          <button 
            className="header-nav-icon-btn" 
            onClick={() => navigate('/notifications')}
            title="Bildirimler"
          >
            <Bell size={22} />
            {unreadNotificationsCount > 0 && (
              <span className="header-badge">{unreadNotificationsCount}</span>
            )}
          </button>
          
          <button 
            className="header-nav-icon-btn" 
            onClick={() => navigate('/messages')}
            title="Mesajlar"
          >
            <MessageSquare size={22} />
            {unreadMessagesCount > 0 && (
              <span className="header-badge">{unreadMessagesCount}</span>
            )}
          </button>
          
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
