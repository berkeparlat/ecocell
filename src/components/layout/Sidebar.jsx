import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  FolderKanban, 
  Plus, 
  LogOut, 
  Menu, 
  X,
  User
} from 'lucide-react';
import Modal from '../ui/Modal';
import ProjectForm from '../projects/ProjectForm';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout, projects, currentProject, setCurrentProject } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
      logout();
    }
  };

  const handleProjectClick = (project) => {
    setCurrentProject(project);
    setIsMobileOpen(false);
  };

  return (
    <>
      <button 
        className="mobile-menu-btn"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`sidebar ${isMobileOpen ? 'sidebar-mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Building2 size={28} />
            <div className="sidebar-logo-text">
              <h1>Karafiber Elyaf</h1>
              <span>Ecocell</span>
            </div>
          </div>
        </div>

        <div className="sidebar-content">
          <div className="sidebar-section">
            <div className="sidebar-section-header">
              <h3>Projeler</h3>
              <button 
                className="sidebar-add-btn"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="sidebar-projects">
              {projects.length === 0 ? (
                <p className="sidebar-empty">Henüz proje yok</p>
              ) : (
                projects.map((project) => (
                  <button
                    key={project.id}
                    className={`sidebar-project ${currentProject?.id === project.id ? 'active' : ''}`}
                    onClick={() => handleProjectClick(project)}
                  >
                    <span 
                      className="sidebar-project-dot" 
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="sidebar-project-name">{project.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              <User size={20} />
            </div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{user?.fullName || user?.username}</p>
              <p className="sidebar-user-email">{user?.department}</p>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Yeni Proje Oluştur"
        size="medium"
      >
        <ProjectForm onClose={() => setIsModalOpen(false)} />
      </Modal>
    </>
  );
};

export default Sidebar;
