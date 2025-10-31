import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleHeader from '../../components/layout/SimpleHeader';
import { RefreshCw, FileSpreadsheet, ShoppingCart } from 'lucide-react';
import { getLatestExcelFile, fetchAndParseExcelFromRef } from '../../services/excelService';
import * as XLSX from 'xlsx';
import './SalesOrder.css';

const SalesOrder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [excelData, setExcelData] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    loadLatestFile();
  }, []);

  useEffect(() => {
    if (excelData && containerRef.current) {
      renderExcelToCanvas();
    }
  }, [excelData]);

  const renderExcelToCanvas = () => {
    if (!excelData || !containerRef.current) return;

    // Container'ı temizle
    containerRef.current.innerHTML = '';

    // XLSX workbook'u HTML table olarak render et (tam stiller ile)
    const html = XLSX.utils.sheet_to_html(excelData.rawWorksheet, {
      id: 'excel-table',
      editable: false
    });

    containerRef.current.innerHTML = html;
  };const loadLatestFile = async () => {
    setLoading(true);
    try {
      console.log('🔍 SalesOrder: Dosya yükleniyor...');
      const file = await getLatestExcelFile('sales');
      console.log('📁 SalesOrder: Bulunan dosya:', file);
      
      if (file) {
        console.log('📊 SalesOrder: Excel parse ediliyor...');
        // Firebase SDK kullanarak CORS bypass
        const parsedData = await fetchAndParseExcelFromRef(file.ref);
        console.log('✅ SalesOrder: Excel parse edildi, satır sayısı:', parsedData?.data?.length);
        setExcelData(parsedData);
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
            <div 
              ref={containerRef}
              className="excel-canvas-viewer"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SalesOrder;
