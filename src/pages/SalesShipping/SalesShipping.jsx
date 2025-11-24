import { useNavigate } from 'react-router-dom';
import { 
  Package,
  ShoppingCart,
  Truck
} from 'lucide-react';
import SimpleHeader from '../../components/layout/SimpleHeader';
import './SalesShipping.css';

const SalesShipping = () => {
  const navigate = useNavigate();
  
  const salesShippingItems = [
    {
      id: 'daily-stock',
      title: 'Günlük Stok Listesi',
      icon: Package,
      path: '/daily-stock',
      color: '#10b981'
    },
    {
      id: 'orders',
      title: 'Siparişler',
      icon: ShoppingCart,
      path: '/orders',
      color: '#3b82f6'
    },
    {
      id: 'shipments',
      title: 'Yüklemeler',
      icon: Truck,
      path: '/shipments',
      color: '#f59e0b'
    }
  ];

  const handleItemClick = (path) => {
    navigate(path);
  };

  return (
    <div className="sales-shipping-page">
      <SimpleHeader />
      <div className="sales-shipping-container">
        <h1 className="sales-shipping-title">Satış ve Sevkiyat</h1>
        <div className="sales-shipping-grid">
          {salesShippingItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className="sales-shipping-card"
                onClick={() => handleItemClick(item.path)}
              >
                <div className="sales-shipping-icon" style={{ backgroundColor: item.color }}>
                  <IconComponent size={32} strokeWidth={2} />
                </div>
                <h3 className="sales-shipping-card-title">{item.title}</h3>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SalesShipping;
