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
      console.log('🔍 SalesOrder: Dosyalar yükleniyor...');
      
      // Sipariş dosyası
      const salesFile = await getLatestExcelFile('sales');
      console.log('📁 SalesOrder: Sipariş dosyası:', salesFile);
      if (salesFile) {
        setExcelData(salesFile);
      }
      
      // Yükleme dosyası
      const shippingFile = await getLatestExcelFile('shipping');
      console.log('📦 SalesOrder: Yükleme dosyası:', shippingFile);
      if (shippingFile) {
        setShippingData(shippingFile);
      }
      
      console.log('✅ SalesOrder: Dosyalar hazır');
    } catch (error) {
      console.error('❌ SalesOrder: Dosya yükleme hatası:', error);
      console.error('Hata detayı:', error.message);
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
          <button className="refresh-btn" onClick={loadLatestFiles}>
            <RefreshCw size={18} />
            Yenile
          </button>
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
                  downloadUrl={excelData.downloadUrl}
                  htmlContent={excelData.html}
                  htmlDocument={excelData.htmlDocument}
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
                  downloadUrl={shippingData.downloadUrl}
                  htmlContent={shippingData.html}
                  htmlDocument={shippingData.htmlDocument}
                  accent="sales"
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
