import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { X } from 'lucide-react';
import './WorkPermitForm.css';

const WorkPermitForm = ({ permit = null, onClose }) => {
  const { addWorkPermit, updateWorkPermit, user, departments } = useApp();
  const departmentOptions = Array.isArray(departments) ? departments : [];
  const initialRelatedDepartment =
    permit?.relatedDepartment ||
    user?.department ||
    departmentOptions[0] ||
    'Genel';

  const [formData, setFormData] = useState({
    title: permit?.title || '', // 1. İş Adı
    createdBy: permit?.createdBy || user?.username || '', // 2. Ekleyen Kişi (otomatik)
    relatedDepartment: initialRelatedDepartment, // 3. İlgili Birim
    description: permit?.description || '', // 4. İş Tanımı
    maintenanceType: permit?.maintenanceType || 'planned', // 5. Bakım Türü
    status: permit?.status || 'pending', // Durum (Onay Bekliyor / Onaylandı)
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
      permit?.createdBy ||
      user?.fullName ||
      user?.username ||
      user?.email ||
      'Bilinmeyen';
    const creatorDepartment =
      permit?.createdByDepartment ||
      user?.department ||
      formData.relatedDepartment ||
      '';

    const permitData = {
      ...formData,
      createdBy: creatorName,
      createdByDepartment: creatorDepartment,
    };

    try {
      if (permit) {
        await updateWorkPermit(permit.id, permitData);
      } else {
        await addWorkPermit(permitData);
      }
      onClose?.();
    } catch (error) {
      alert('İş izni kaydedilirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="work-permit-form">
      <div className="work-permit-form-header">
        <h2>{permit ? 'İş İznini Düzenle' : 'Yeni İş İzni Oluştur'}</h2>
        <button type="button" className="work-permit-form-close" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      
      <div className="work-permit-form-body">
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
        <div className="work-permit-form-group">
          <label className="work-permit-form-label">2. İşi Ekleyen Kişi</label>
          <div className="work-permit-form-readonly">
            <strong>{user?.fullName || user?.username}</strong> - {user?.department}
          </div>
        </div>

        {/* 3. İlgili Birim */}
        <div className="work-permit-form-group">
          <label className="work-permit-form-label">3. İlgili Birim</label>
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
        <div className="work-permit-form-group">
          <label className="work-permit-form-label">4. İş Tanımı</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="İşin detaylı açıklamasını girin"
            className="work-permit-form-textarea"
            rows="4"
            required
          />
        </div>

        {/* 5. Bakım Türü */}
        <div className="work-permit-form-group">
          <label className="work-permit-form-label">5. Bakım Türü</label>
          <Select
            name="maintenanceType"
            value={formData.maintenanceType}
            onChange={handleChange}
            options={[
              { value: 'planned', label: 'Planlı' },
              { value: 'breakdown', label: 'Arızi' },
              { value: 'predictive', label: 'Kestirimci' },
            ]}
            required
          />
        </div>

        {/* 6. Durum */}
        <div className="work-permit-form-group">
          <label className="work-permit-form-label">6. Durum</label>
          <Select
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={[
              { value: 'pending', label: 'Onay Bekliyor' },
              { value: 'approved', label: 'Onaylandı' },
            ]}
            required
          />
        </div>
      </div>

      <div className="work-permit-form-actions">
        <Button type="button" variant="secondary" onClick={onClose}>
          İptal
        </Button>
        <Button type="submit" variant="primary">
          {permit ? 'İş İznini Güncelle' : 'İş İzni Oluştur'}
        </Button>
      </div>
    </form>
  );
};

export default WorkPermitForm;
