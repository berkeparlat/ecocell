import { useState, useEffect } from 'react';
import SimpleHeader from '../../components/layout/SimpleHeader';
import { RefreshCw, FileSpreadsheet } from 'lucide-react';
import { getLatestExcelFile } from '../../services/excelService';
import ExcelPreview from '../../components/excel/ExcelPreview';
import './DailyStock.css';

const DailyStock = () => {
  const [loading, setLoading] = useState(false);
  const [excelData, setExcelData] = useState(null);

  useEffect(() => {
    loadLatestFile();
  }, []);

  const loadLatestFile = async () => {
    setLoading(true);
    try {
            const file = await getLatestExcelFile('stock');
            
      if (file) {
                setExcelData(file);
              } else {
              }
    } catch (error) {
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
            <FileSpreadsheet size={22} />
            <div>
              <h1>Günlük Stok Takibi</h1>
              <p>Güncel stok bilgilerini görüntüleyin</p>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="loading-state">
            <RefreshCw className="spin" size={48} />
            <p>Yükleniyor...</p>
          </div>
        ) : excelData ? (
          <ExcelPreview
            fileName={excelData.name}
            viewerUrl={excelData.viewerUrl}
            accent="stock"
          />
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
