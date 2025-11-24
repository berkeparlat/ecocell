import { useNavigate } from 'react-router-dom';
import { 
  Wrench, 
  Settings, 
  TruckIcon
} from 'lucide-react';
import SimpleHeader from '../../components/layout/SimpleHeader';
import './Reports.css';

const Reports = () => {
  const navigate = useNavigate();
  
  const categoryItems = [
    {
      id: 'maintenance',
      title: 'Bakım',
      icon: Wrench,
      path: '/maintenance',
      color: '#F44336'
    },
    {
      id: 'operations',
      title: 'İşletme',
      icon: Settings,
      path: '/operations',
      color: '#00897B'
    },
    {
      id: 'sales-shipping',
      title: 'Satış ve Sevkiyat',
      icon: TruckIcon,
      path: '/sales-shipping',
      color: '#2196F3'
    }
  ];

  const handleCategoryClick = (path) => {
    navigate(path);
  };

  return (
    <div className="reports-page">
      <SimpleHeader />
      <div className="reports-container">
        <h1 className="reports-title">Raporlar, Planlar ve Listeler</h1>
        <div className="reports-grid">
          {categoryItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className="report-card"
                onClick={() => handleCategoryClick(item.path)}
              >
                <div className="report-icon" style={{ backgroundColor: item.color }}>
                  <IconComponent size={32} strokeWidth={2} />
                </div>
                <h3 className="report-card-title">{item.title}</h3>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Reports;
