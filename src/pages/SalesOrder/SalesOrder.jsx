import { useState, useEffect } from 'react';
import SimpleHeader from '../../components/layout/SimpleHeader';
import { RefreshCw, ShoppingCart, Truck } from 'lucide-react';
import { getLatestExcelFile } from '../../services/excelService';
import ExcelPreview from '../../components/excel/ExcelPreview';
import './SalesOrder.css';

const SalesOrder = () => {
  const [loading, setLoading] = useState(false);
  const [excelData, setExcelData] = useState(null);
  const [shippingData, setShippingData] = useState(null);

  useEffect(() => {
    loadLatestFiles();
  }, []);

  const loadLatestFiles = async () => {
    setLoading(true);
    try {
            
      // Sipariş dosyası
      const salesFile = await getLatestExcelFile('sales');
            if (salesFile) {
        setExcelData(salesFile);
      }
      
      // Yükleme dosyası
      const shippingFile = await getLatestExcelFile('shipping');
            if (shippingFile) {
        setShippingData(shippingFile);
      }
      
          } catch (error) {
                } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sales-order-page">
      <SimpleHeader />
      
      <div className="sales-container">
        <div className="sales-header">
          <div className="header-title">
            <ShoppingCart size={32} />
            <div>
              <h1>Satış Sipariş ve Yükleme Takibi</h1>
              <p>Güncel satış sipariş ve yükleme bilgilerini görüntüleyin</p>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="loading-state">
            <RefreshCw className="spin" size={48} />
            <p>Yükleniyor...</p>
          </div>
        ) : (
          <div className="sales-dual-view">
            {/* Sol Panel - Satış Siparişleri */}
            <div className="sales-panel">
              <div className="panel-header">
                <ShoppingCart size={20} />
                <h2>Satış Siparişleri</h2>
              </div>
              {excelData ? (
                <ExcelPreview
                  fileName={excelData.name}
                  viewerUrl={excelData.viewerUrl}
                  accent="sales"
                />
              ) : (
                <div className="empty-panel">
                  <ShoppingCart size={48} />
                  <p>Sipariş dosyası yüklenmemiş</p>
                </div>
              )}
            </div>

            {/* Sağ Panel - Yüklemeler */}
            <div className="sales-panel">
              <div className="panel-header">
                <Truck size={20} />
                <h2>Elyaf Yüklemeleri</h2>
              </div>
              {shippingData ? (
                <ExcelPreview
                  fileName={shippingData.name}
                  viewerUrl={shippingData.viewerUrl}
                  accent="shipping"
                />
              ) : (
                <div className="empty-panel">
                  <Truck size={48} />
                  <p>Yükleme dosyası yüklenmemiş</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesOrder;
