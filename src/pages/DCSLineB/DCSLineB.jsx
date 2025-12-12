import { useNavigate } from 'react-router-dom';
import { 
  Activity,
  BarChart3
} from 'lucide-react';
import SimpleHeader from '../../components/layout/SimpleHeader';
import './DCSLineB.css';

const DCSLineB = () => {
  const navigate = useNavigate();
  
  const dcsItems = [
    {
      id: 'dcs-b012',
      title: 'B012 Bölgesi',
      icon: Activity,
      path: '/dcs-b012',
      color: '#3b82f6'
    },
    {
      id: 'dcs-b021',
      title: 'B021 Bölgesi',
      icon: BarChart3,
      path: '/dcs-b021',
      color: '#8b5cf6'
    }
  ];

  const handleItemClick = (path) => {
    navigate(path);
  };

  return (
    <div className="dcs-b-menu-page">
      <SimpleHeader />
      <div className="dcs-b-menu-container">
        <h1 className="dcs-b-menu-title">DCS Haftalık Rapor B Hattı</h1>
        <div className="dcs-b-menu-grid">
          {dcsItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className="dcs-b-menu-card"
                onClick={() => handleItemClick(item.path)}
              >
                <div className="dcs-b-menu-icon" style={{ backgroundColor: item.color }}>
                  <IconComponent size={32} strokeWidth={2} />
                </div>
                <h3 className="dcs-b-menu-card-title">{item.title}</h3>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DCSLineB;
