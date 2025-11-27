import { useNavigate } from 'react-router-dom';
import { 
  Activity,
  BarChart3
} from 'lucide-react';
import SimpleHeader from '../../components/layout/SimpleHeader';
import './DCSLineA.css';

const DCSLineA = () => {
  const navigate = useNavigate();
  
  const dcsItems = [
    {
      id: 'dcs-a012',
      title: 'A012 Bölgesi',
      icon: Activity,
      path: '/dcs-a012',
      color: '#10b981'
    },
    {
      id: 'dcs-a021',
      title: 'A021 Bölgesi',
      icon: BarChart3,
      path: '/dcs-a021',
      color: '#3b82f6'
    }
  ];

  const handleItemClick = (path) => {
    navigate(path);
  };

  return (
    <div className="dcs-a-menu-page">
      <SimpleHeader />
      <div className="dcs-a-menu-container">
        <h1 className="dcs-a-menu-title">DCS Haftalık Rapor A Hattı</h1>
        <div className="dcs-a-menu-grid">
          {dcsItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className="dcs-a-menu-card"
                onClick={() => handleItemClick(item.path)}
              >
                <div className="dcs-a-menu-icon" style={{ backgroundColor: item.color }}>
                  <IconComponent size={32} strokeWidth={2} />
                </div>
                <h3 className="dcs-a-menu-card-title">{item.title}</h3>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DCSLineA;
