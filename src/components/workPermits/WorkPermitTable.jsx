import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Filter, Search, MoreVertical, Edit2, Trash2, FileText } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import WorkPermitForm from './WorkPermitForm';
import './WorkPermitTable.css';

const WorkPermitTable = () => {
  const { user, workPermits, deleteWorkPermit } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingPermit, setEditingPermit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [maintenanceTypeFilter, setMaintenanceTypeFilter] = useState('all');
  const [activeMenu, setActiveMenu] = useState(null);

  const filteredPermits = workPermits.filter(permit => {
    const matchesSearch = permit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permit.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMaintenanceType = maintenanceTypeFilter === 'all' || permit.maintenanceType === maintenanceTypeFilter;
    return matchesSearch && matchesMaintenanceType;
  });

  const handleEdit = (permit) => {
    setEditingPermit(permit);
    setShowForm(true);
    setActiveMenu(null);
  };

  const handleDelete = async (permitId) => {
    if (window.confirm('Bu iş iznini silmek istediğinizden emin misiniz?')) {
      await deleteWorkPermit(permitId);
      setActiveMenu(null);
    }
  };

  const handleAddNew = () => {
    setEditingPermit(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPermit(null);
  };

  const getMaintenanceTypeBadge = (type) => {
    const typeMap = {
      'planned': { label: 'Planlı', class: 'maintenance-planned' },
      'breakdown': { label: 'Arızi', class: 'maintenance-breakdown' },
      'predictive': { label: 'Kestirimci', class: 'maintenance-predictive' }
    };
    return typeMap[type] || typeMap['planned'];
  };

  return (
    <div className="work-permit-table-container">
      <div className="work-permit-header">
        <div className="work-permit-header-left">
          <FileText size={24} />
          <div>
            <h1>İş İzinleri</h1>
            <p>İş izinlerini yönetin ve takip edin</p>
          </div>
        </div>
        <Button onClick={handleAddNew} className="add-permit-btn">
          <Plus size={20} />
          Yeni İş İzni Ekle
        </Button>
      </div>

      <div className="work-permit-filters">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="İş izinlerinde ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <Filter size={18} />
          <select value={maintenanceTypeFilter} onChange={(e) => setMaintenanceTypeFilter(e.target.value)}>
            <option value="all">Tüm Bakım Türleri</option>
            <option value="planned">Planlı</option>
            <option value="breakdown">Arızi</option>
            <option value="predictive">Kestirimci</option>
          </select>
        </div>
      </div>

      <div className="work-permit-table-wrapper">
        <table className="work-permit-table">
          <thead>
            <tr>
              <th>İş Adı</th>
              <th>İşi Ekleyen</th>
              <th>İlgili Birim</th>
              <th>Bakım Türü</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredPermits.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">
                  {searchTerm || maintenanceTypeFilter !== 'all'
                    ? 'Arama kriterlerine uygun iş izni bulunamadı.'
                    : 'Henüz iş izni eklenmemiş. Yeni bir iş izni eklemek için yukarıdaki butona tıklayın.'}
                </td>
              </tr>
            ) : (
              filteredPermits.map((permit) => {
                const maintenanceType = getMaintenanceTypeBadge(permit.maintenanceType);
                
                return (
                  <tr key={permit.id}>
                    <td>
                      <div className="permit-title">{permit.title}</div>
                      {permit.description && (
                        <div className="permit-description">{permit.description.substring(0, 60)}...</div>
                      )}
                    </td>
                    <td>
                      <div className="creator-info">
                        <strong>{permit.createdBy}</strong>
                        {permit.createdByDepartment && (
                          <span className="creator-dept">{permit.createdByDepartment}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="department-badge">{permit.relatedDepartment}</span>
                    </td>
                    <td>
                      <span className={`maintenance-type-badge ${maintenanceType.class}`}>
                        {maintenanceType.label}
                      </span>
                    </td>
                    <td>
                      <div className="actions-menu">
                        <button
                          className="action-btn"
                          onClick={() => setActiveMenu(activeMenu === permit.id ? null : permit.id)}
                        >
                          <MoreVertical size={18} />
                        </button>
                        {activeMenu === permit.id && (
                          <div className="action-dropdown">
                            <button onClick={() => handleEdit(permit)}>
                              <Edit2 size={16} />
                              Düzenle
                            </button>
                            <button onClick={() => handleDelete(permit.id)} className="delete-action">
                              <Trash2 size={16} />
                              Sil
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showForm} onClose={handleCloseForm}>
        <WorkPermitForm permit={editingPermit} onClose={handleCloseForm} />
      </Modal>
    </div>
  );
};

export default WorkPermitTable;
