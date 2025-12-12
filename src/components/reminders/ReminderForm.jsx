import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { X, Users, User } from 'lucide-react';
import './ReminderForm.css';

const ReminderForm = ({ reminder = null, onClose }) => {
  const { addReminder, updateReminder, user, departments } = useApp();

  const [formData, setFormData] = useState({
    title: reminder?.title || '',
    description: reminder?.description || '',
    period: reminder?.period || 'monthly',
    specificDate: reminder?.specificDate || '',
    isShared: reminder?.isShared || false,
    sharedDepartments: reminder?.sharedDepartments || [],
  });

  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(reminder?.period === 'once' || false);

  const periodOptions = [
    { value: 'daily', label: 'Günlük' },
    { value: 'weekly', label: 'Haftalık' },
    { value: 'monthly', label: 'Aylık' },
    { value: 'quarterly', label: '3 Aylık' },
    { value: 'semi-annual', label: '6 Aylık' },
    { value: '9-months', label: '9 Aylık' },
    { value: 'annual', label: 'Yıllık' },
    { value: 'once', label: 'Tarih Seçiniz (Tek Seferlik)' },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'period') {
      setShowDatePicker(value === 'once');
      if (value !== 'once') {
        setFormData({
          ...formData,
          period: value,
          specificDate: '',
        });
        return;
      }
    }

    if (name === 'isShared') {
      setFormData({
        ...formData,
        isShared: checked,
        sharedDepartments: checked ? formData.sharedDepartments : [],
      });
      return;
    }
    
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDepartmentToggle = (deptName) => {
    const currentDepts = formData.sharedDepartments || [];
    const isSelected = currentDepts.includes(deptName);
    
    if (isSelected) {
      setFormData({
        ...formData,
        sharedDepartments: currentDepts.filter(d => d !== deptName),
      });
    } else {
      setFormData({
        ...formData,
        sharedDepartments: [...currentDepts, deptName],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ortak seçildiğinde birim kontrolü
    if (formData.isShared && (!formData.sharedDepartments || formData.sharedDepartments.length === 0)) {
      alert('Ortak hatırlatıcı için en az bir birim seçmelisiniz.');
      return;
    }

    setLoading(true);

    try {
      if (reminder) {
        await updateReminder(reminder.id, formData);
      } else {
        await addReminder(formData);
      }
      onClose?.();
    } catch (error) {
      console.error('Hatırlatıcı kaydedilirken hata:', error);
      alert(error.message || 'Hatırlatıcı kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="reminder-form">
      <div className="reminder-form-header">
        <h2>{reminder ? 'Hatırlatıcıyı Düzenle' : 'Yeni Hatırlatıcı Oluştur'}</h2>
        <button type="button" className="reminder-form-close" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      
      {/* İş Adı */}
      <Input
        label="İş Adı"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Hatırlatıcı adını girin"
        required
      />

      {/* İş Tanımı */}
      <div className="reminder-form-group">
        <label className="reminder-form-label">İş Tanımı</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Hatırlatıcının detaylı açıklamasını girin"
          className="reminder-form-textarea"
          rows="4"
          required
        />
      </div>

      {/* Periyot */}
      <div className="reminder-form-group">
        <label className="reminder-form-label">Periyot</label>
        <Select
          name="period"
          value={formData.period}
          onChange={handleChange}
          options={periodOptions}
          required
        />
        {!showDatePicker && (
          <p className="reminder-form-hint">
            Hatırlatıcı seçilen periyotta tekrarlanacaktır.
          </p>
        )}
      </div>

      {/* Tarih Seçimi (Tek Seferlik) */}
      {showDatePicker && (
        <div className="reminder-form-group">
          <label className="reminder-form-label">Hatırlatma Tarihi</label>
          <Input
            type="date"
            name="specificDate"
            value={formData.specificDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            required
          />
          <p className="reminder-form-hint">
            Bu hatırlatıcı sadece seçilen tarihte gösterilecektir.
          </p>
        </div>
      )}

      {/* Şahsi/Ortak Seçimi */}
      <div className="reminder-form-group">
        <label className="reminder-form-label">Hatırlatıcı Türü</label>
        <div className="reminder-type-toggle">
          <label className={`reminder-type-option ${!formData.isShared ? 'active' : ''}`}>
            <input
              type="radio"
              name="reminderType"
              checked={!formData.isShared}
              onChange={() => handleChange({ target: { name: 'isShared', checked: false } })}
            />
            <User size={18} />
            <span>Şahsi</span>
          </label>
          <label className={`reminder-type-option ${formData.isShared ? 'active' : ''}`}>
            <input
              type="radio"
              name="reminderType"
              checked={formData.isShared}
              onChange={() => handleChange({ target: { name: 'isShared', checked: true } })}
            />
            <Users size={18} />
            <span>Ortak</span>
          </label>
        </div>
        <p className="reminder-form-hint">
          {formData.isShared 
            ? 'Seçilen birimlerdeki tüm kullanıcılara bildirim gönderilecektir.' 
            : 'Sadece size bildirim gönderilecektir.'}
        </p>
      </div>

      {/* Birim Seçimi (Ortak ise) */}
      {formData.isShared && (
        <div className="reminder-form-group">
          <label className="reminder-form-label">Birimler</label>
          <div className="reminder-departments-grid">
            {departments && departments.length > 0 ? (
              departments.map((dept) => (
                <label 
                  key={dept} 
                  className={`reminder-department-chip ${formData.sharedDepartments?.includes(dept) ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={formData.sharedDepartments?.includes(dept) || false}
                    onChange={() => handleDepartmentToggle(dept)}
                  />
                  <span>{dept}</span>
                </label>
              ))
            ) : (
              <p className="reminder-form-hint">Birim bulunamadı</p>
            )}
          </div>
          {formData.isShared && formData.sharedDepartments?.length === 0 && (
            <p className="reminder-form-error">En az bir birim seçmelisiniz.</p>
          )}
        </div>
      )}

      <div className="reminder-form-actions">
        <Button type="button" variant="secondary" onClick={onClose}>
          İptal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Kaydediliyor...' : reminder ? 'Güncelle' : 'Oluştur'}
        </Button>
      </div>
    </form>
  );
};

export default ReminderForm;
