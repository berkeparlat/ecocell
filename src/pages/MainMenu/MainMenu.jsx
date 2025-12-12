import { useNavigate } from 'react-router-dom';
import { 
  FileText,
  CheckSquare,
  FolderOpen,
  Clock
} from 'lucide-react';
import SimpleHeader from '../../components/layout/SimpleHeader';
import './MainMenu.css';

const MainMenu = () => {
  const navigate = useNavigate();
  
  const menuItems = [
    {
      id: 'reports',
      title: 'Raporlar, Planlar ve Listeler',
      icon: FolderOpen,
      path: '/reports',
      color: '#2196F3'
    },
    {
      id: 'work-tracking',
      title: 'İş Takibi',
      icon: CheckSquare,
      path: '/job-tracking',
      color: '#00BCD4'
    },
    {
      id: 'work-permits',
      title: 'İş İzinleri',
      icon: FileText,
      path: '/work-permits',
      color: '#3F51B5'
    },
    {
      id: 'reminders',
      title: 'Hatırlatıcılar',
      icon: Clock,
      path: '/reminders',
      color: '#FF6F00'
    }
  ];

  const handleMenuClick = (path) => {
    navigate(path);
  };

  return (
    <div className="main-menu-page">
      <SimpleHeader />
      <div className="main-menu-container">
        <h1 className="main-menu-title">Ana Menü</h1>
        <div className="menu-grid">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className="menu-card"
                onClick={() => handleMenuClick(item.path)}
              >
                <div className="menu-icon" style={{ backgroundColor: item.color }}>
                  <IconComponent size={32} strokeWidth={2} />
                  {item.badge > 0 && (
                    <span className="menu-badge">{item.badge}</span>
                  )}
                </div>
                <h3 className="menu-card-title">{item.title}</h3>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
