import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleHeader from '../../components/layout/SimpleHeader';
import { RefreshCw, FileSpreadsheet } from 'lucide-react';
import { getLatestExcelFile, fetchAndParseExcel } from '../../services/excelService';
import './DailyStock.css';

const DailyStock = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [excelData, setExcelData] = useState(null);
  const [latestFile, setLatestFile] = useState(null);

  useEffect(() => {
    loadLatestFile();
  }, []);
  const loadLatestFile = async () => {
    setLoading(true);
    try {
      const file = await getLatestExcelFile('stock');
      if (file) {
        setLatestFile(file);
        const parsedData = await fetchAndParseExcel(file.url);
        setExcelData(parsedData);
      }
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR') + ' ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
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
          </button>
        </div>

        {/* Dosya bilgisi */}
        {latestFile && (
          <div className="file-info-banner">
            <div className="file-info-content">
              <FileSpreadsheet size={20} />
              <div className="file-details">
                <p className="file-name">{latestFile.name}</p>
                <p className="file-date">Son güncelleme: {formatDate(latestFile.uploadDate)}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading-state">
            <RefreshCw className="spin" size={48} />
            <p>Yükleniyor...</p>
          </div>
        ) : excelData ? (
          <div className="excel-viewer">
            <div className="table-wrapper">
              <table className="excel-table">
                <thead>
                  <tr>
                    {excelData.data[0]?.map((header, index) => (
                      <th key={index}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {excelData.data.slice(1).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
