import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MoreVertical, Edit, Trash2, LayoutGrid, List } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import ProjectForm from '../projects/ProjectForm';
import './Header.css';

const Header = () => {
  const { currentProject, deleteProject, viewMode, setViewMode } = useApp();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${currentProject.name}"?`)) {
      deleteProject(currentProject.id);
    }
    setShowMenu(false);
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
    setShowMenu(false);
  };

  if (!currentProject) {
    return (
      <header className="header">
        <div className="header-content">
          <h2 className="header-title">Karafiber Elyaf - Ecocell İş Takip</h2>
          <p className="header-subtitle">Başlamak için bir proje seçin veya yeni proje oluşturun</p>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="header">
        <div className="header-content">
          <div className="header-project">
            <div 
              className="header-project-dot" 
              style={{ backgroundColor: currentProject.color }}
            />
            <div>
              <h2 className="header-title">{currentProject.name}</h2>
              {currentProject.description && (
                <p className="header-subtitle">{currentProject.description}</p>
              )}
            </div>
          </div>

          <div className="header-actions">
            <div className="view-toggle">
              <button
                className={`view-toggle-btn ${viewMode === 'board' ? 'active' : ''}`}
                onClick={() => setViewMode('board')}
              >
                <LayoutGrid size={18} />
                <span>Pano</span>
              </button>
              <button
                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List size={18} />
                <span>Liste</span>
              </button>
            </div>

            <div className="header-menu-container">
              <button 
                className="header-menu-btn"
                onClick={() => setShowMenu(!showMenu)}
              >
                <MoreVertical size={20} />
              </button>

              {showMenu && (
                <div className="header-menu">
                  <button onClick={handleEdit}>
                    <Edit size={16} />
                    Projeyi Düzenle
                  </button>
                  <button onClick={handleDelete} className="header-menu-delete">
                    <Trash2 size={16} />
                    Projeyi Sil
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Projeyi Düzenle"
        size="medium"
      >
        <ProjectForm 
          project={currentProject}
          onClose={() => setIsEditModalOpen(false)} 
        />
      </Modal>
    </>
  );
};

export default Header;
