import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  Calendar,
  Zap,
  Wrench,
  AlertCircle,
  Activity
} from 'lucide-react';
import SimpleHeader from '../../components/layout/SimpleHeader';
import './Maintenance.css';

const Maintenance = () => {
  const navigate = useNavigate();
  
  const maintenanceItems = [
    {
      id: 'electrical-plan',
      title: 'Elektrik Bakım Günlük İş Listesi',
      icon: ClipboardList,
      path: '/electrical-plan',
      color: '#FFC107'
    },
    {
      id: 'mechanical-plan',
      title: 'Mekanik Bakım Günlük İş Listesi',
      icon: Calendar,
      path: '/mechanical-plan',
      color: '#6366f1'
    },
    {
      id: 'electrical-downtime',
      title: 'Elektrik Bakım Duruş İş Listesi',
      icon: AlertCircle,
      path: '/electrical-downtime',
      color: '#F44336'
    },
    {
      id: 'mechanical-downtime',
      title: 'Mekanik Bakım Duruş İş Listesi',
      icon: Activity,
      path: '/mechanical-downtime',
      color: '#FF9800'
    },
    {
      id: 'electric-consumption',
      title: 'Elektrik Tüketimi',
      icon: Zap,
      path: '/electric-consumption',
      color: '#4CAF50'
    }
  ];

  const handleItemClick = (path) => {
    navigate(path);
  };

  return (
    <div className="maintenance-page">
      <SimpleHeader />
      <div className="maintenance-container">
        <h1 className="maintenance-title">Bakım</h1>
        <div className="maintenance-grid">
          {maintenanceItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className="maintenance-card"
                onClick={() => handleItemClick(item.path)}
              >
                <div className="maintenance-icon" style={{ backgroundColor: item.color }}>
                  <IconComponent size={32} strokeWidth={2} />
                </div>
                <h3 className="maintenance-card-title">{item.title}</h3>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
