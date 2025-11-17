import { useState, useEffect } from 'react';
import SimpleHeader from '../../components/layout/SimpleHeader';
import { RefreshCw, FileSpreadsheet } from 'lucide-react';
import { getLatestExcelFile } from '../../services/excelService';
import ExcelPreview from '../../components/excel/ExcelPreview';
import './DCSReport.css';

const DCSReport = () => {
  const [loading, setLoading] = useState(false);
  const [excelData, setExcelData] = useState(null);

  useEffect(() => {
    loadLatestFile();
  }, []);

  const loadLatestFile = async () => {
    setLoading(true);
    try {
      const file = await getLatestExcelFile('dcs-buhar');
      
      if (file) {
        setExcelData(file);
      }
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dcs-report-page">
      <SimpleHeader />
      
      <div className="dcs-container">
        <div className="dcs-header">
          <div className="header-title">
            <FileSpreadsheet size={22} />
            <div>
              <h1>DCS Haftalık Rapor - Buhar</h1>
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
            accent="dcs"
          />
        ) : (
          <div className="empty-state">
            <FileSpreadsheet size={64} />
            <h3>Henüz dosya yüklenmemiş</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default DCSReport;
