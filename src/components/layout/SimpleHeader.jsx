import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { LogOut, User, ChevronDown, Shield } from 'lucide-react';
import { isAdmin } from '../../services/adminService';
import Modal from '../ui/Modal';
import ProfileModal from '../profile/ProfileModal';
import logo from '../../assets/logo.png';
import './SimpleHeader.css';

const SimpleHeader = () => {
  const navigate = useNavigate();
  const { user, logout } = useApp();
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const menuRef = useRef(null);

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
        <div className="header-brand" onClick={handleLogoClick}>
          <img src={logo} alt="Ecocell Logo" className="header-logo" />
          <div className="header-brand-text">
            <h1>Karafiber Elyaf</h1>
            <span>Genel Takip Sistemi</span>
          </div>
        </div>

        <div className="header-actions">
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
        <Modal onClose={() => setShowProfileModal(false)} size="small">
          <ProfileModal onClose={() => setShowProfileModal(false)} />
        </Modal>
      )}
    </header>
  );
};

export default SimpleHeader;
