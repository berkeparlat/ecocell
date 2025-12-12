import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { X } from 'lucide-react';
import './TaskForm.css';

const TaskEditForm = ({ task, onClose }) => {
  const { updateTask } = useApp();

  const [formData, setFormData] = useState({
    status: task?.status || 'new',
    progress: task?.progress || '',
    notes: task?.notes || '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateTask(task.id, formData);
      onClose?.();
    } catch (error) {
      alert('İş güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <div className="task-form-header">
        <h2>İşi Düzenle</h2>
        <button type="button" className="task-form-close" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      {/* İş Bilgileri (Sadece Görüntüleme) */}
      <div className="task-form-group">
        <label className="task-form-label">İş Adı</label>
        <div className="task-form-readonly">
          <strong>{task?.title}</strong>
        </div>
      </div>

      <div className="task-form-group">
        <label className="task-form-label">İş Tanımı</label>
        <div className="task-form-readonly">
          {task?.description}
        </div>
      </div>

      <div className="task-form-row">
        <div className="task-form-group">
          <label className="task-form-label">Ekleyen Kişi</label>
          <div className="task-form-readonly">
            {task?.createdBy}
          </div>
        </div>
        <div className="task-form-group">
          <label className="task-form-label">İlgili Birim</label>
          <div className="task-form-readonly">
            {task?.relatedDepartment}
          </div>
        </div>
      </div>

      <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #e0e0e0' }} />

      {/* Düzenlenebilir Alanlar */}
      <div className="task-form-group">
        <label className="task-form-label">İş Durumu</label>
        <Select
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={[
            { value: 'new', label: 'Yeni' },
            { value: 'in-progress', label: 'Devam Ediyor' },
            { value: 'done', label: 'Tamamlandı' },
          ]}
          required
        />
      </div>

      <div className="task-form-group">
        <label className="task-form-label">İlerleme Durumu</label>
        <textarea
          name="progress"
          value={formData.progress}
          onChange={handleChange}
          placeholder="Son durum ve ilerleme hakkında bilgi girin"
          className="task-form-textarea"
          rows="3"
        />
      </div>

      <div className="task-form-group">
        <label className="task-form-label">Notlar ve Açıklamalar</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Ek notlar, açıklamalar veya önemli bilgiler"
          className="task-form-textarea"
          rows="4"
        />
      </div>

      <div className="task-form-actions">
        <Button type="button" variant="secondary" onClick={onClose}>
          İptal
        </Button>
        <Button type="submit" variant="primary">
          Güncelle
        </Button>
      </div>
    </form>
  );
};

export default TaskEditForm;
