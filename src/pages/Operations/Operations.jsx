import { useNavigate } from 'react-router-dom';
import { 
  Activity,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import SimpleHeader from '../../components/layout/SimpleHeader';
import './Operations.css';

const Operations = () => {
  const navigate = useNavigate();
  
  const operationsItems = [
    {
      id: 'dcs-line-a',
      title: 'DCS Haftalık Rapor A Hattı',
      icon: Activity,
      path: '/dcs-line-a',
      color: '#10b981'
    },
    {
      id: 'dcs-line-b',
      title: 'DCS Haftalık Rapor B Hattı',
      icon: BarChart3,
      path: '/dcs-line-b',
      color: '#3b82f6'
    },
    {
      id: 'dcs-buhar',
      title: 'DCS Haftalık Rapor Buhar',
      icon: TrendingUp,
      path: '/dcs-buhar',
      color: '#8b5cf6'
    },
    {
      id: 'downtime-list',
      title: 'İşletme Duruş Listesi',
      icon: AlertTriangle,
      path: '/downtime-list',
      color: '#ef4444'
    },
    {
      id: 'operations-downtime-report',
      title: 'İşletme Duruş Raporu',
      icon: FileSpreadsheet,
      path: '/operations-downtime-report',
      color: '#f97316'
    }
  ];

  const handleItemClick = (path) => {
    navigate(path);
  };

  return (
    <div className="operations-page">
      <SimpleHeader />
      <div className="operations-container">
        <h1 className="operations-title">İşletme</h1>
        <div className="operations-grid">
          {operationsItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className="operations-card"
                onClick={() => handleItemClick(item.path)}
              >
                <div className="operations-icon" style={{ backgroundColor: item.color }}>
                  <IconComponent size={32} strokeWidth={2} />
                </div>
                <h3 className="operations-card-title">{item.title}</h3>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Operations;
