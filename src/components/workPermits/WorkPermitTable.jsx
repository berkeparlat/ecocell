import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Filter, Search, MoreVertical, Edit2, Trash2, FileText, MessageSquare, Building2, User, ChevronDown, Check } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import WorkPermitForm from './WorkPermitForm';
import QuickMessageModal from '../tasks/QuickMessageModal';
import './WorkPermitTable.css';

const WorkPermitTable = () => {
  const { user, workPermits = [], deleteWorkPermit, updateWorkPermit, departments } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingPermit, setEditingPermit] = useState(null);
  const [messagePermit, setMessagePermit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [activeMenu, setActiveMenu] = useState(null);
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const deptDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(event.target)) {
        setIsDeptDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const statusOptions = [
    { id: 'all', label: 'Tümü', color: '#757575' },
    { id: 'pending', label: 'Onay Bekliyor', color: '#FF6B35' },
    { id: 'approved', label: 'Onaylandı', color: '#4caf50' },
  ];

  const filteredPermits = useMemo(() => {
    return workPermits.filter(permit => {
      const matchesSearch = permit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           permit.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || permit.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || permit.relatedDepartment === departmentFilter;
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [workPermits, searchTerm, statusFilter, departmentFilter]);

  const handleEdit = useCallback((permit) => {
    setEditingPermit(permit);
    setShowForm(true);
    setActiveMenu(null);
  }, []);

  const handleMessage = useCallback((permit) => {
    setMessagePermit(permit);
  }, []);

  const handleDelete = useCallback(async (permitId) => {
    if (window.confirm('Bu iş iznini silmek istediğinizden emin misiniz?')) {
      await deleteWorkPermit(permitId);
      setActiveMenu(null);
    }
  }, [deleteWorkPermit]);

  const handleApprove = useCallback(async (permit) => {
    const approverName = user?.displayName || user?.fullName || user?.username || user?.email || 'Bilinmiyor';
    
    await updateWorkPermit(permit.id, {
      status: 'approved',
      approvedBy: approverName,
      approvedAt: new Date().toISOString()
    });
  }, [updateWorkPermit, user]);

  const handleAddNew = useCallback(() => {
    setEditingPermit(null);
    setShowForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setEditingPermit(null);
    // Yeni iş izni eklendikten sonra filtreyi sıfırla
    setDepartmentFilter('all');
  }, []);

  const getMaintenanceTypeBadge = useCallback((type) => {
    const typeMap = {
      'planned': { label: 'Planlı', class: 'maintenance-planned' },
      'breakdown': { label: 'Arızi', class: 'maintenance-breakdown' },
      'predictive': { label: 'Kestirimci', class: 'maintenance-predictive' }
    };
    return typeMap[type] || typeMap['planned'];
  }, []);

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
        <div className="permit-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="İş izni ara"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="department-filter" ref={deptDropdownRef}>
          <div 
            className="department-filter-trigger"
            onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
          >
            <Building2 size={16} />
            <span>{departmentFilter === 'all' ? 'Tüm Birimler' : departmentFilter}</span>
            <ChevronDown size={14} className={`dropdown-chevron ${isDeptDropdownOpen ? 'open' : ''}`} />
          </div>
          {isDeptDropdownOpen && (
            <div className="department-dropdown">
              <div 
                className={`department-option ${departmentFilter === 'all' ? 'selected' : ''}`}
                onClick={() => { setDepartmentFilter('all'); setIsDeptDropdownOpen(false); }}
              >
                <span>Tüm Birimler</span>
                {departmentFilter === 'all' && <Check size={14} />}
              </div>
              {departments && departments.map(dept => (
                <div 
                  key={dept}
                  className={`department-option ${departmentFilter === dept ? 'selected' : ''}`}
                  onClick={() => { setDepartmentFilter(dept); setIsDeptDropdownOpen(false); }}
                >
                  <span>{dept}</span>
                  {departmentFilter === dept && <Check size={14} />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="work-permit-table-wrapper">
        <table className="work-permit-table">
          <thead>
            <tr>
              <th style={{ width: '20%' }}>İş Adı</th>
              <th style={{ width: '10%' }}>Durum</th>
              <th style={{ width: '14%' }}>İşi Ekleyen</th>
              <th style={{ width: '14%' }}>İlgili Birim</th>
              <th style={{ width: '10%' }}>Bakım Türü</th>
              <th style={{ width: '14%' }}>Onaylayan</th>
              <th style={{ width: '18%' }}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredPermits.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
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
                        <div className="permit-description">{permit.description}</div>
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
                        <User size={14} />
                        {permit.createdBy}
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
                      {permit.status === 'approved' ? (
                        <div className="approver-info">
                          <User size={14} />
                          {permit.approvedBy || 'Bilinmiyor'}
                        </div>
                      ) : (
                        user?.department?.trim().toLowerCase() === permit.relatedDepartment?.trim().toLowerCase() ? (
                          <button
                            onClick={() => handleApprove(permit)}
                            className="approve-btn"
                          >
                            Onayla
                          </button>
                        ) : (
                          <span style={{ color: '#999', fontSize: '13px' }}>Onay Bekliyor</span>
                        )
                      )}
                    </td>
                    <td>
                      <div className="actions-menu">
                        <button
                          className="action-btn message-btn"
                          onClick={() => handleMessage(permit)}
                          title="Mesaj Gönder"
                        >
                          <MessageSquare size={16} />
                        </button>
                        {user?.department?.trim().toLowerCase() === permit.relatedDepartment?.trim().toLowerCase() && (
                          <>
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
                          </>
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

      {messagePermit && (
        <QuickMessageModal 
          task={messagePermit}
          onClose={() => setMessagePermit(null)}
        />
      )}
    </div>
  );
};

export default WorkPermitTable;
