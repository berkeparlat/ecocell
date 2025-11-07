import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { X } from 'lucide-react';
import './TaskForm.css';

const TaskForm = ({ task = null, initialStatus = 'new', onClose }) => {
  const { addTask, updateTask, user, departments } = useApp();
  const departmentOptions = Array.isArray(departments) ? departments : [];
  const initialRelatedDepartment =
    task?.relatedDepartment ||
    user?.department ||
    departmentOptions[0] ||
    'Genel';

  const [formData, setFormData] = useState({
    title: task?.title || '', // 1. İş Adı
    createdBy: task?.createdBy || user?.username || '', // 2. Ekleyen Kişi (otomatik)
    relatedDepartment: initialRelatedDepartment, // 3. İlgili Birim (otomatik)
    description: task?.description || '', // 4. İş Tanımı
    status: task?.status || initialStatus, // 5. İlerleme Durumu
    progress: task?.progress || '', // 5. Son Durum Açıklaması
    notes: task?.notes || '', // 6. Notlar/Açıklama
    priority: task?.priority || 'medium',
    dueDate: task?.dueDate || '',
  });

  useEffect(() => {
    if (departmentOptions.length === 0) {
      return;
    }

    setFormData((prev) => {
      if (prev.relatedDepartment && departmentOptions.includes(prev.relatedDepartment)) {
        return prev;
      }

      return {
        ...prev,
        relatedDepartment: departmentOptions[0],
      };
    });
  }, [departmentOptions]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const creatorName =
      task?.createdBy ||
      user?.fullName ||
      user?.username ||
      user?.email ||
      'Bilinmeyen';
    const creatorDepartment =
      task?.createdByDepartment ||
      user?.department ||
      formData.relatedDepartment ||
      '';

    const taskData = {
      ...formData,
      createdBy: creatorName,
      createdByDepartment: creatorDepartment,
    };

    try {
      if (task) {
        await updateTask(task.id, taskData);
      } else {
        await addTask(taskData);
      }
      onClose?.();
    } catch (error) {
      alert('İş kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <div className="task-form-header">
        <h2>{task ? 'İşi Düzenle' : 'Yeni İş Oluştur'}</h2>
        <button type="button" className="task-form-close" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      
      {/* 1. İş Adı */}
      <Input
        label="1. İş Adı"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="İşin adını girin"
        required
      />

      {/* 2. Ekleyen Kişi (Otomatik) */}
      <div className="task-form-group">
        <label className="task-form-label">2. İşi Ekleyen Kişi</label>
        <div className="task-form-readonly">
          <strong>{user?.fullName || user?.username}</strong> - {user?.department}
        </div>
      </div>

      {/* 3. İlgili Birim */}
      <div className="task-form-group">
        <label className="task-form-label">3. İlgili Birim</label>
        <Select
          name="relatedDepartment"
          value={formData.relatedDepartment}
          onChange={handleChange}
          placeholder="Ana sorumlu birimi seçin"
          options={departmentOptions.map(dept => ({ value: dept, label: dept }))}
          required
        />
      </div>

      {/* 4. İş Tanımı */}
      <div className="task-form-group">
        <label className="task-form-label">4. İş Tanımı</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="İşin detaylı açıklamasını girin"
          className="task-form-textarea"
          rows="4"
          required
        />
      </div>

      {/* 5. İlerleme ve Son Durum */}
      <div className="task-form-group">
        <label className="task-form-label">5. İlerleme Durumu</label>
        <Select
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={[
            { value: 'new', label: 'Yeni' },
            { value: 'in-progress', label: 'Devam Ediyor' },
            { value: 'done', label: 'Tamamlandı' },
          ]}
        />
        <textarea
          name="progress"
          value={formData.progress}
          onChange={handleChange}
          placeholder="Son durum ve ilerleme hakkında bilgi"
          className="task-form-textarea"
          rows="2"
          style={{ marginTop: '0.5rem' }}
        />
      </div>

      {/* 6. Notlar/Açıklama */}
      <div className="task-form-group">
        <label className="task-form-label">6. Notlar ve Açıklamalar</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Ek notlar, açıklamalar veya önemli bilgiler"
          className="task-form-textarea"
          rows="3"
        />
      </div>

      {/* Ek Bilgiler */}
      <div className="task-form-row">
        <Select
          label="Öncelik"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          options={[
            { value: 'low', label: 'Düşük' },
            { value: 'medium', label: 'Normal' },
            { value: 'high', label: 'Acil' },
          ]}
        />

        <Input
          label="Teslim Tarihi"
          type="date"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
        />
      </div>

      <div className="task-form-actions">
        <Button type="button" variant="secondary" onClick={onClose}>
          İptal
        </Button>
        <Button type="submit" variant="primary">
          {task ? 'İşi Güncelle' : 'İş Oluştur'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
