import { useState, useEffect } from 'react';
import SimpleHeader from '../../components/layout/SimpleHeader';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { getLatestExcelFile } from '../../services/excelService';
import ExcelPreview from '../../components/excel/ExcelPreview';
import './DowntimeList.css';

const DowntimeList = () => {
  const [loading, setLoading] = useState(false);
  const [excelData, setExcelData] = useState(null);

  useEffect(() => {
    loadLatestFile();
  }, []);

  const loadLatestFile = async () => {
    setLoading(true);
    try {
      const file = await getLatestExcelFile('downtime');
      
      if (file) {
        setExcelData(file);
      }
    } catch (error) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="downtime-list-page">
      <SimpleHeader />
      
      <div className="downtime-container">
        <div className="downtime-header">
          <div className="header-title">
            <AlertCircle size={22} />
            <div>
              <h1>İşletme Duruş İş Planı</h1>
              <p>Sipariş ve yükleme bilgilerini takip edin</p>
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
            accent="downtime"
          />
        ) : (
          <div className="empty-state">
            <AlertCircle size={64} />
            <h3>Henüz dosya yüklenmemiş</h3>
            <p>Admin tarafından dosya yüklendiğinde burada görüntülenecektir</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DowntimeList;
