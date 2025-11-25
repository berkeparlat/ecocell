import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { X } from 'lucide-react';
import './ReminderForm.css';

const ReminderForm = ({ reminder = null, onClose }) => {
  const { addReminder, updateReminder, user } = useApp();

  const [formData, setFormData] = useState({
    title: reminder?.title || '',
    description: reminder?.description || '',
    period: reminder?.period || 'monthly',
    specificDate: reminder?.specificDate || '',
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
    const { name, value } = e.target;
    
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
    
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Form verisi gönderiliyor:', formData);
      console.log('Kullanıcı:', user);
      
      if (reminder) {
        const result = await updateReminder(reminder.id, formData);
        console.log('Güncelleme sonucu:', result);
      } else {
        const result = await addReminder(formData);
        console.log('Ekleme sonucu:', result);
      }
      console.log('Hatırlatıcı başarıyla kaydedildi');
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
