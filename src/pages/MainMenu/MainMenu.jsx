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
      id: 'sales-order',
      title: 'Satış Sipariş',
      icon: '🛒',
      path: '/sales-order',
      color: '#2196F3'
    },
    {
      id: 'work-tracking',
      title: 'İş Takibi',
      icon: '✓',
      path: '/job-tracking',
      color: '#FF9800'
    },
    {
      id: 'messages',
      title: 'Mesajlar',
      icon: '💬',
      path: '/messages',
      color: '#F44336'
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
