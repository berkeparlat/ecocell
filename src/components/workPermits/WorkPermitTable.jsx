import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Filter, Search, MoreVertical, Edit2, Trash2, FileText, MessageSquare, CheckCircle, Building2 } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import WorkPermitForm from './WorkPermitForm';
import './WorkPermitTable.css';

const WorkPermitTable = () => {
  const { user, workPermits = [], deleteWorkPermit, updateWorkPermit, departments } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingPermit, setEditingPermit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [activeMenu, setActiveMenu] = useState(null);

  const statusOptions = [
    { id: 'all', label: 'Tümü', color: '#757575' },
    { id: 'pending', label: 'Onay Bekliyor', color: '#FF6B35' },
    { id: 'approved', label: 'Onaylandı', color: '#4caf50' },
  ];

  const filteredPermits = workPermits.filter(permit => {
    const matchesSearch = permit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permit.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || permit.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || permit.relatedDepartment === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
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

  const handleApprove = async (permit) => {
    try {
      await updateWorkPermit(permit.id, {
        status: 'approved'
      });
    } catch (error) {
      console.error('Error approving permit:', error);
      alert('İş izni onaylanırken bir hata oluştu.');
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

  const getStatusLabel = (status) => {
    const statusMap = {
      'pending': 'Onay Bekliyor',
      'approved': 'Onaylandı'
    };
    return statusMap[status] || 'Onay Bekliyor';
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'pending': '#FF6B35',
      'approved': '#4caf50'
    };
    return colorMap[status] || '#FF6B35';
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
        
        <div className="table-actions">
          <div className="status-filter">
            {statusOptions.map(status => (
              <button
                key={status.id}
                className={`filter-btn ${statusFilter === status.id ? 'active' : ''}`}
                onClick={() => setStatusFilter(status.id)}
                style={{
                  '--status-color': status.color,
                }}
              >
                {status.label}
              </button>
            ))}
          </div>
          
          <Button onClick={handleAddNew} className="add-permit-btn">
            <Plus size={18} />
            Yeni İş İzni
          </Button>
        </div>
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
        <div className="department-filter">
          <Building2 size={18} />
          <select 
            value={departmentFilter} 
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="all">Tüm Birimler</option>
            {departments && departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="work-permit-table-wrapper">
        <table className="work-permit-table">
          <thead>
            <tr>
              <th style={{ width: '20%' }}>İş Adı</th>
              <th style={{ width: '12%' }}>Durum</th>
              <th style={{ width: '15%' }}>İşi Ekleyen</th>
              <th style={{ width: '15%' }}>İlgili Birim</th>
              <th style={{ width: '13%' }}>Bakım Türü</th>
              <th style={{ width: '25%' }}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredPermits.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  {searchTerm || statusFilter !== 'all'
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
                      <span 
                        className="status-badge"
                        style={{
                          backgroundColor: getStatusColor(permit.status || 'pending'),
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          display: 'inline-block'
                        }}
                      >
                        {getStatusLabel(permit.status || 'pending')}
                      </span>
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
                          className="action-btn message-btn"
                          title="Mesaj Gönder"
                        >
                          <MessageSquare size={16} />
                        </button>
                        {permit.status !== 'approved' && (
                          <button
                            className="action-btn approve-btn"
                            onClick={() => handleApprove(permit)}
                            title="Onayla"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(permit)}
                          title="Düzenle"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(permit.id)}
                          title="Sil"
                        >
                          <Trash2 size={16} />
                        </button>
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
