import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Trash2, Building2, Users, X } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import './DepartmentsModal.css';

const DepartmentsModal = ({ onClose }) => {
  const { updateDepartments, departments = [] } = useApp();
  const [localDepartments, setLocalDepartments] = useState([...departments]);
  const [newDepartment, setNewDepartment] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalDepartments(Array.isArray(departments) ? [...departments] : []);
    setError('');
  }, [departments]);

  const handleAddDepartment = () => {
    const trimmed = newDepartment.trim();
    if (!trimmed) {
      setError('Birim adı boş olamaz');
      return;
    }

    const exists = localDepartments.some(
      (dept) => dept.toLowerCase() === trimmed.toLowerCase()
    );

    if (exists) {
      setError('Bu birim zaten mevcut');
      return;
    }

    setLocalDepartments((prev) =>
      [...prev, trimmed].sort((a, b) => a.localeCompare(b, 'tr', { sensitivity: 'base' }))
    );
    setNewDepartment('');
    setError('');
  };

  const handleDeleteDepartment = (dept) => {
    if (window.confirm(`"${dept}" birimini silmek istediğinizden emin misiniz?`)) {
      setLocalDepartments((prev) => prev.filter((d) => d !== dept));
    }
  };

  const handleSave = async () => {
    if (localDepartments.length === 0) {
      setError('En az bir birim olmalıdır');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await updateDepartments(localDepartments);
      alert('Birimler başarıyla güncellendi!');
      onClose();
    } catch (err) {
      setError('Birimler kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddDepartment();
    }
  };

  return (
    <div className="departments-modal">
      <div className="departments-header">
        <div className="header-icon">
          <Building2 size={24} />
        </div>
        <div className="header-text">
          <h2>Birimleri Yönet</h2>
          <p>Şirketinizdeki birimleri ekleyin veya kaldırın</p>
        </div>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="departments-content">
        {/* Yeni Birim Ekleme */}
        <div className="add-department-section">
          <div className="add-department-input">
            <Input
              type="text"
              name="newDepartment"
              value={newDepartment}
              onChange={(e) => {
                setNewDepartment(e.target.value);
                setError('');
              }}
              onKeyPress={handleKeyPress}
              placeholder="Yeni birim adı girin"
              icon={<Plus size={18} />}
            />
          </div>
          <Button 
            variant="primary" 
            onClick={handleAddDepartment}
            className="add-btn"
          >
            <Plus size={18} />
            Ekle
          </Button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Birimler Listesi */}
        <div className="departments-list-section">
          <div className="list-header">
            <Users size={18} />
            <span>Mevcut Birimler ({localDepartments.length})</span>
          </div>
          
          <div className="departments-list">
            {localDepartments.map((dept, index) => (
              <div key={index} className="department-item">
                <div className="department-info">
                  <Building2 size={16} />
                  <span>{dept}</span>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteDepartment(dept)}
                  title="Sil"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="departments-footer">
        <button className="btn-secondary" onClick={onClose}>
          İptal
        </button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </div>
    </div>
  );
};

export default DepartmentsModal;
