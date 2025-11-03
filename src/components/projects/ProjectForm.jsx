import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import './ProjectForm.css';

const ProjectForm = ({ project = null, onClose }) => {
  const { addProject, updateProject } = useApp();
  
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    color: project?.color || '#667eea',
    status: project?.status || 'active',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (project) {
      updateProject(project.id, formData);
    } else {
      addProject(formData);
    }

    onClose();
  };

  const colorOptions = [
    { value: '#667eea', label: 'Mor' },
    { value: '#f59e0b', label: 'Turuncu' },
    { value: '#10b981', label: 'Yeşil' },
    { value: '#ef4444', label: 'Kırmızı' },
    { value: '#3b82f6', label: 'Mavi' },
    { value: '#8b5cf6', label: 'Menekşe' },
  ];

  return (
    <form onSubmit={handleSubmit} className="project-form">
      <Input
        label="Proje Adı"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Proje adını girin"
        required
      />

      <div className="project-form-group">
        <label className="project-form-label">Açıklama</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Proje açıklamasını girin"
          className="project-form-textarea"
          rows="4"
        />
      </div>

      <div className="project-form-row">
        <div className="project-form-group">
          <label className="project-form-label">Renk</label>
          <div className="color-picker">
            {colorOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`color-option ${formData.color === option.value ? 'active' : ''}`}
                style={{ backgroundColor: option.value }}
                onClick={() => setFormData({ ...formData, color: option.value })}
                title={option.label}
              />
            ))}
          </div>
        </div>

        <Select
          label="Durum"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={[
            { value: 'active', label: 'Aktif' },
            { value: 'on-hold', label: 'Beklemede' },
            { value: 'completed', label: 'Tamamlandı' },
          ]}
        />
      </div>

      <div className="project-form-actions">
        <Button type="button" variant="secondary" onClick={onClose}>
          İptal
        </Button>
        <Button type="submit" variant="primary">
          {project ? 'Projeyi Güncelle' : 'Proje Oluştur'}
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;
