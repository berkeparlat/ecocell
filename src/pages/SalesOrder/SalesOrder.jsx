import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleHeader from '../../components/layout/SimpleHeader';
import { RefreshCw, ShoppingCart, ExternalLink } from 'lucide-react';
import { getLatestExcelFile } from '../../services/excelService';
import './SalesOrder.css';

const SalesOrder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [excelData, setExcelData] = useState(null);

  useEffect(() => {
    loadLatestFile();
  }, []);  const loadLatestFile = async () => {
    setLoading(true);
    try {
      console.log('🔍 SalesOrder: Dosya yükleniyor...');
      const file = await getLatestExcelFile('sales');
      console.log('📁 SalesOrder: Bulunan dosya:', file);
      
      if (file) {
        console.log('📊 SalesOrder: Excel dosyası hazırlanıyor...');
        // Download URL'i direkt kullan - Office Viewer ile açacağız
        setExcelData({
          url: file.url,
          name: file.name
        });
        console.log('✅ SalesOrder: Dosya hazır');
      } else {
        console.warn('⚠️ SalesOrder: Dosya bulunamadı!');
      }
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
              <h1>Satış Sipariş Takibi</h1>
              <p>Güncel satış sipariş bilgilerini görüntüleyin</p>
            </div>
          </div>
          <button className="refresh-btn" onClick={loadLatestFile}>
            <RefreshCw size={18} />
            Yenile
          </button>        </div>        {loading ? (
          <div className="loading-state">
            <RefreshCw className="spin" size={48} />
            <p>Yükleniyor...</p>
          </div>
        ) : excelData ? (
          <div className="excel-viewer">
            <div className="viewer-toolbar">
              <span className="file-name">📄 {excelData.name}</span>
              <a 
                href={excelData.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="open-external-btn"
              >
                <ExternalLink size={16} />
                Tam Ekran Aç
              </a>
            </div>            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(excelData.url)}&embedded=true`}
              className="excel-iframe"
              title="Excel Viewer"
              frameBorder="0"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SalesOrder;
