import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Zap, 
  AlertCircle, 
  Bell,
  MessageSquare,
  Calendar,
  FileText,
  CheckSquare,
  ShoppingCart,
  Wrench
} from 'lucide-react';
import SimpleHeader from '../../components/layout/SimpleHeader';
import './MainMenu.css';

const MainMenu = () => {
  const navigate = useNavigate();
  
  const menuItems = [
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
      id: 'announcements',
      title: 'Duyurular',
      icon: Bell,
      path: '/announcements',
      color: '#FF6B35'
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
      id: 'work-permits',
      title: 'İş İzinleri',
      icon: FileText,
      path: '/work-permits',
      color: '#3F51B5'
    },
    {
      id: 'work-tracking',
      title: 'İş Takibi',
      icon: CheckSquare,
      path: '/job-tracking',
      color: '#00BCD4'
    },
    {
      id: 'downtime-list',
      title: 'İşletme Duruş İş Planı',
      icon: Wrench,
      path: '/downtime-list',
      color: '#E91E63'
    },
    {
      id: 'messages',
      title: 'Mesajlar',
      icon: MessageSquare,
      path: '/messages',
      color: '#673AB7'
    },
    {
      id: 'sales-order',
      title: 'Sipariş ve Yükleme Listesi',
      icon: ShoppingCart,
      path: '/sales-order',
      color: '#2196F3'
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
                  <IconComponent size={28} strokeWidth={2} />
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
