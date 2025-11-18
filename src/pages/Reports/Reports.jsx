import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Zap, 
  AlertCircle, 
  Calendar,
  FileText,
  Wrench,
  ShoppingCart
} from 'lucide-react';
import SimpleHeader from '../../components/layout/SimpleHeader';
import './Reports.css';

const Reports = () => {
  const navigate = useNavigate();
  
  const reportItems = [
    {
      id: 'maintenance-downtime',
      title: 'Bakım Duruş İş Planı',
      icon: AlertCircle,
      path: '/maintenance-downtime',
      color: '#F44336'
    },
    {
      id: 'maintenance-plan',
      title: 'Bakım Günlük İş Planı',
      icon: Calendar,
      path: '/maintenance-plan',
      color: '#9C27B0'
    },
    {
      id: 'dcs-report-ab',
      title: 'DCS Haftalık Rapor A-B',
      icon: FileText,
      path: '/dcs-report-ab',
      color: '#795548'
    },
    {
      id: 'dcs-report',
      title: 'DCS Haftalık Rapor Buhar',
      icon: FileText,
      path: '/dcs-report',
      color: '#00897B'
    },
    {
      id: 'electric-consumption',
      title: 'Elektrik Tüketimi',
      icon: Zap,
      path: '/electric-consumption',
      color: '#FFC107'
    },
    {
      id: 'daily-stock',
      title: 'Günlük Stok Takibi',
      icon: Package,
      path: '/daily-stock',
      color: '#4CAF50'
    },
    {
      id: 'downtime-list',
      title: 'İşletme Duruş İş Planı',
      icon: Wrench,
      path: '/downtime-list',
      color: '#E91E63'
    },
    {
      id: 'sales-order',
      title: 'Sipariş ve Yükleme Listesi',
      icon: ShoppingCart,
      path: '/sales-order',
      color: '#2196F3'
    }
  ];

  const handleReportClick = (path) => {
    navigate(path);
  };

  return (
    <div className="reports-page">
      <SimpleHeader />
      <div className="reports-container">
        <h1 className="reports-title">Raporlar, Planlar ve Listeler</h1>
        <div className="reports-grid">
          {reportItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className="report-card"
                onClick={() => handleReportClick(item.path)}
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
