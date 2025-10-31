import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleHeader from '../../components/layout/SimpleHeader';
import { RefreshCw, FileSpreadsheet } from 'lucide-react';
import { getLatestExcelFile, fetchAndParseExcelFromRef } from '../../services/excelService';
import * as XLSX from 'xlsx';
import './DailyStock.css';

const DailyStock = () => {
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
      console.log('🔍 DailyStock: Dosya yükleniyor...');
      const file = await getLatestExcelFile('stock');
      console.log('📁 DailyStock: Bulunan dosya:', file);
      
      if (file) {
        console.log('📊 DailyStock: Excel parse ediliyor...');
        // Firebase SDK kullanarak CORS bypass
        const parsedData = await fetchAndParseExcelFromRef(file.ref);
        console.log('✅ DailyStock: Excel parse edildi, satır sayısı:', parsedData?.data?.length);
        setExcelData(parsedData);
      } else {
        console.warn('⚠️ DailyStock: Dosya bulunamadı!');
      }
    } catch (error) {
      console.error('❌ DailyStock: Dosya yükleme hatası:', error);
      console.error('Hata detayı:', error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="daily-stock-page">
      <SimpleHeader />
      
      <div className="stock-container">
        <div className="stock-header">
          <div className="header-title">
            <FileSpreadsheet size={32} />
            <div>
              <h1>Günlük Stok Takibi</h1>
              <p>Güncel stok bilgilerini görüntüleyin</p>
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
        ) : (
          <div className="empty-state">
            <FileSpreadsheet size={64} />
            <h3>Henüz dosya yüklenmemiş</h3>
            <p>Admin tarafından dosya yüklendiğinde burada görüntülenecektir</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyStock;
