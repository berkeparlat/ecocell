import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { X } from 'lucide-react';
import './AnnouncementForm.css';

const AnnouncementForm = ({ announcement = null, onClose }) => {
  const { addAnnouncement, updateAnnouncement, user } = useApp();

  const [formData, setFormData] = useState({
    title: announcement?.title || '',
    content: announcement?.content || '',
    priority: announcement?.priority || 'low',
    createdBy: announcement?.createdBy || user?.fullName || user?.username || '',
    department: announcement?.department || user?.department || '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const announcementData = {
      ...formData,
      createdAt: announcement?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (announcement) {
        await updateAnnouncement(announcement.id, announcementData);
      } else {
        await addAnnouncement(announcementData);
      }
      onClose?.();
    } catch (error) {
      alert('Duyuru kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="announcement-form">
      <div className="announcement-form-header">
        <h2>{announcement ? 'Duyuruyu Düzenle' : 'Yeni Duyuru Oluştur'}</h2>
        <button type="button" className="announcement-form-close" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="announcement-form-body">
        <Input
          label="Duyuru Başlığı"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Duyuru başlığını girin"
          required
        />

        <div className="announcement-form-group">
          <label className="announcement-form-label">Duyuru İçeriği</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Duyuru içeriğini girin..."
            className="announcement-form-textarea"
            rows="6"
            required
          />
        </div>

        <Select
          label="Öncelik Seviyesi"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          options={[
            { value: 'low', label: 'Bilgilendirme' },
            { value: 'high', label: 'Önemli' },
          ]}
          required
        />

        <div className="announcement-form-group">
          <label className="announcement-form-label">Duyuruyu Yapan</label>
          <div className="announcement-form-readonly">
            <strong>{user?.fullName || user?.username}</strong>
            {user?.department && <span> • {user?.department}</span>}
          </div>
        </div>
      </div>

      <div className="announcement-form-actions">
        <Button type="button" variant="secondary" onClick={onClose}>
          İptal
        </Button>
        <Button type="submit" variant="primary">
          {announcement ? 'Duyuruyu Güncelle' : 'Duyuru Yayınla'}
        </Button>
      </div>
    </form>
  );
};

export default AnnouncementForm;
