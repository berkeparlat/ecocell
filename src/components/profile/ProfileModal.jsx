import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Mail, Building2, X, Bell, BellOff } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import './ProfileModal.css';

const ProfileModal = ({ onClose }) => {
  const { user, enablePushNotifications, disablePushNotifications } = useApp();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  // Kullanıcının bildirim durumunu kontrol et
  useEffect(() => {
    const checkNotificationStatus = async () => {
      if (!user?.uid) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setNotificationsEnabled(userData.notificationsEnabled || false);
        }
      } catch (error) {
        console.error('Bildirim durumu kontrol hatası:', error);
      }
    };

    checkNotificationStatus();
  }, [user?.uid]);

  const handleToggleNotifications = async () => {
    if (loading) return;

    setLoading(true);
    try {
      if (notificationsEnabled) {
        // Bildirimleri kapat
        const success = await disablePushNotifications();
        if (success) {
          setNotificationsEnabled(false);
          alert('Push bildirimler kapatıldı');
        }
      } else {
        // Bildirimleri aç
        const success = await enablePushNotifications();
        if (success) {
          setNotificationsEnabled(true);
          alert('Push bildirimler açıldı! Artık yeni görev, mesaj ve duyurular telefonunuza gelecek.');
        } else {
          alert('Bildirim izni verilmedi. Lütfen tarayıcı ayarlarından bildirimlere izin verin.');
        }
      }
    } catch (error) {
      console.error('Bildirim toggle hatası:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

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

        <div className="profile-divider"></div>

        <div className="profile-field profile-notifications">
          <div className="field-label">
            {notificationsEnabled ? <Bell size={16} /> : <BellOff size={16} />}
            <span>Push Bildirimler</span>
          </div>
          <div className="field-value">
            <label className="notification-toggle">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={handleToggleNotifications}
                disabled={loading}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {notificationsEnabled && (
          <div className="notification-info">
            <p>✓ Yeni görev, mesaj ve duyurular telefonunuza bildirim olarak gelecek</p>
          </div>
        )}

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
