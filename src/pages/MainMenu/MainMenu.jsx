import { useNavigate } from 'react-router-dom';
import SimpleHeader from '../../components/layout/SimpleHeader';
import './MainMenu.css';

const MainMenu = () => {
  const navigate = useNavigate();
  const menuItems = [
    {
      id: 'daily-stock',
      title: 'Günlük Stok',
      icon: '📦',
      path: '/daily-stock',
      color: '#4CAF50'
    },
    {
      id: 'electric-consumption',
      title: 'Elektrik Tüketimi',
      icon: '⚡',
      path: '/electric-consumption',
      color: '#FF9800'
    },
    {
      id: 'downtime-list',
      title: 'İşletme Duruş Listesi',
      icon: '🔴',
      path: '/downtime-list',
      color: '#F44336'
    },
    {
      id: 'sales-order',
      title: 'Satış Sipariş',
      icon: '🛒',
      path: '/sales-order',
      color: '#2196F3'
    },
    {
      id: 'maintenance-plan',
      title: 'Bakım Günlük İş Planı',
      icon: '🔧',
      path: '/maintenance-plan',
      color: '#9C27B0'
    },
    {
      id: 'maintenance-downtime',
      title: 'Bakım Duruş Listesi',
      icon: '⚠️',
      path: '/maintenance-downtime',
      color: '#FF5722'
    },
    {
      id: 'work-tracking',
      title: 'İş Takibi',
      icon: '✓',
      path: '/job-tracking',
      color: '#00BCD4'
    },
    {
      id: 'work-permits',
      title: 'İş İzinleri',
      icon: '📋',
      path: '/work-permits',
      color: '#673AB7'
    },
    {
      id: 'announcements',
      title: 'Duyurular',
      icon: '📢',
      path: '/announcements',
      color: '#E91E63'
    },
    {
      id: 'messages',
      title: 'Mesajlar',
      icon: '💬',
      path: '/messages',
      color: '#9C27B0'
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
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="menu-card"
              onClick={() => handleMenuClick(item.path)}
              style={{ borderTopColor: item.color }}
            >
              <div className="menu-icon" style={{ backgroundColor: item.color }}>
                {item.icon}
              </div>
              <h3 className="menu-card-title">{item.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
