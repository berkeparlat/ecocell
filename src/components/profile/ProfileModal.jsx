import { useApp } from '../../context/AppContext';
import { User, Mail, Building2, X } from 'lucide-react';
import './ProfileModal.css';

const ProfileModal = ({ onClose }) => {
  const { user } = useApp();

  return (
    <div className="profile-modal">
      <div className="profile-header">
        <div className="profile-header-top">
          <div className="profile-avatar">
            <User size={40} />
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <h2>Profil Bilgileri</h2>
      </div>

      <div className="profile-content">
        <div className="profile-field">
          <div className="field-label">
            <User size={16} />
            <span>Ad Soyad</span>
          </div>
          <div className="field-value">{user?.fullName || user?.username || 'Belirtilmemiş'}</div>
        </div>

        <div className="profile-field">
          <div className="field-label">
            <Mail size={16} />
            <span>E-posta</span>
          </div>
          <div className="field-value">{user?.email || 'Belirtilmemiş'}</div>
        </div>

        <div className="profile-field">
          <div className="field-label">
            <Building2 size={16} />
            <span>Birim</span>
          </div>
          <div className="field-value">
            <span className="department-badge">{user?.department || 'Belirtilmemiş'}</span>
          </div>
        </div>

      </div>

      <div className="profile-footer">
        <button className="btn-secondary" onClick={onClose}>
          Kapat
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;
