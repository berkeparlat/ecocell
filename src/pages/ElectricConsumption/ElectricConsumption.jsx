import { useState, useEffect } from 'react';
import SimpleHeader from '../../components/layout/SimpleHeader';
import { RefreshCw, Zap } from 'lucide-react';
import { getLatestExcelFile } from '../../services/excelService';
import ExcelPreview from '../../components/excel/ExcelPreview';
import './ElectricConsumption.css';

const ElectricConsumption = () => {
  const [loading, setLoading] = useState(false);
  const [excelData, setExcelData] = useState(null);

  useEffect(() => {
    loadLatestFile();
  }, []);

  const loadLatestFile = async () => {
    setLoading(true);
    try {
      const file = await getLatestExcelFile('electric');
      
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
    <div className="electric-consumption-page">
      <SimpleHeader />
      
      <div className="electric-container">
        <div className="electric-header">
          <div className="header-title">
            <Zap size={22} />
            <div>
              <h1>Elektrik Tüketimi</h1>
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
            accent="electric"
          />
        ) : (
          <div className="empty-state">
            <Zap size={64} />
            <h3>Henüz dosya yüklenmemiş</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default ElectricConsumption;
