import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MoreVertical, Trash2, Edit, Clock, User, Building2 } from 'lucide-react';
import Modal from '../ui/Modal';
import TaskEditForm from './TaskEditForm';
import './TaskCard.css';

const TaskCard = ({ task }) => {
  const { deleteTask, user } = useApp();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Kullanıcı sadece kendi departmanının işlerini düzenleyebilir
  const canEdit = user?.department?.trim().toLowerCase() === task.relatedDepartment?.trim().toLowerCase();

  const priorityColors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
  };

  const priorityLabels = {
    low: 'Düşük',
    medium: 'Normal',
    high: 'Acil',
  };

  const handleDelete = () => {
    if (window.confirm('Bu işi silmek istediğinizden emin misiniz?')) {
      deleteTask(task.id);
    }
    setShowMenu(false);
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
    setShowMenu(false);
  };

  return (
    <>
      <div className="task-card">
        <div className="task-card-header">
          <div 
            className="task-priority" 
            style={{ backgroundColor: priorityColors[task.priority] }}
            title={priorityLabels[task.priority]}
          />
          {canEdit && (
            <>
              <button 
                className="task-menu-btn"
                onClick={() => setShowMenu(!showMenu)}
              >
                <MoreVertical size={16} />
              </button>
              {showMenu && (
                <div className="task-menu">
                  <button onClick={handleEdit}>
                    <Edit size={14} />
                    Düzenle
                  </button>
                  <button onClick={handleDelete} className="task-menu-delete">
                    <Trash2 size={14} />
                    Sil
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <h4 className="task-title">{task.title}</h4>
        
        {/* Ekleyen Kişi ve Birimi */}
        {task.createdBy && (
          <div className="task-creator">
            <User size={14} />
            <span>{task.createdBy}</span>
            {task.createdByDepartment && (
              <span className="task-creator-dept">• {task.createdByDepartment}</span>
            )}
          </div>
        )}

        {/* İlgili Birim */}
        {task.relatedDepartment && (
          <div className="task-department">
            <Building2 size={14} />
            <strong>{task.relatedDepartment}</strong>
          </div>
        )}

        {/* İş Tanımı */}
        {task.description && (
          <p className="task-description">{task.description}</p>
        )}

        {/* İlerleme Bilgisi */}
        {task.progress && (
          <div className="task-progress-info">
            <strong>Durum:</strong> {task.progress}
          </div>
        )}

        <div className="task-footer">
          {task.dueDate && (
            <div className="task-meta">
              <Clock size={14} />
              <span>{new Date(task.dueDate).toLocaleDateString('tr-TR')}</span>
            </div>
          )}
        </div>

      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="İşi Düzenle"
        size="large"
      >
        <TaskEditForm 
          task={task}
          onClose={() => setIsEditModalOpen(false)} 
        />
      </Modal>
    </>
  );
};

export default TaskCard;
