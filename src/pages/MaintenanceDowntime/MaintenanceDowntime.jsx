import { useState, useEffect } from 'react';
import SimpleHeader from '../../components/layout/SimpleHeader';
import { RefreshCw, Wrench, Zap, AlertTriangle } from 'lucide-react';
import { getLatestExcelFile } from '../../services/excelService';
import ExcelPreview from '../../components/excel/ExcelPreview';
import './MaintenanceDowntime.css';

const MaintenanceDowntime = () => {
  const [loading, setLoading] = useState(false);
  const [electricalData, setElectricalData] = useState(null);
  const [mechanicalData, setMechanicalData] = useState(null);

  useEffect(() => {
    loadLatestFiles();
  }, []);

  const loadLatestFiles = async () => {
    setLoading(true);
    try {
      console.log('🔍 MaintenanceDowntime: Dosyalar yükleniyor...');
      
      // Elektrik Bakım Duruş dosyası
      const electricalFile = await getLatestExcelFile('electrical-downtime');
      console.log('⚡ MaintenanceDowntime: Elektrik dosyası:', electricalFile);
      if (electricalFile) {
        setElectricalData(electricalFile);
      }
      
      // Mekanik Bakım Duruş dosyası
      const mechanicalFile = await getLatestExcelFile('mechanical-downtime');
      console.log('🔧 MaintenanceDowntime: Mekanik dosyası:', mechanicalFile);
      if (mechanicalFile) {
        setMechanicalData(mechanicalFile);
      }
      
      console.log('✅ MaintenanceDowntime: Dosyalar hazır');
    } catch (error) {
      console.error('❌ MaintenanceDowntime: Dosya yükleme hatası:', error);
      console.error('Hata detayı:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="maintenance-downtime-page">
      <SimpleHeader />
      
      <div className="downtime-container">
        <div className="downtime-header">
          <div className="header-title">
            <AlertTriangle size={32} />
            <div>
              <h1>Bakım Duruş Listesi</h1>
              <p>Elektrik ve Mekanik Bakım duruş kayıtlarını görüntüleyin</p>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="loading-state">
            <RefreshCw className="spin" size={48} />
            <p>Yükleniyor...</p>
          </div>
        ) : (
          <div className="downtime-dual-view">
            {/* Sol Panel - Elektrik Bakım Duruş */}
            <div className="downtime-panel">
              <div className="panel-header electrical">
                <Zap size={20} />
                <h2>Elektrik Bakım Duruş Listesi</h2>
              </div>
              {electricalData ? (
                <ExcelPreview
                  fileName={electricalData.name}
                  viewerUrl={electricalData.viewerUrl}
                  downloadUrl={electricalData.downloadUrl}
                  htmlContent={electricalData.html}
                  htmlDocument={electricalData.htmlDocument}
                  accent="electrical"
                />
              ) : (
                <div className="empty-panel">
                  <Zap size={48} />
                  <p>Elektrik duruş dosyası yüklenmemiş</p>
                </div>
              )}
            </div>

            {/* Sağ Panel - Mekanik Bakım Duruş */}
            <div className="downtime-panel">
              <div className="panel-header mechanical">
                <Wrench size={20} />
                <h2>Mekanik Bakım Duruş Listesi</h2>
              </div>
              {mechanicalData ? (
                <ExcelPreview
                  fileName={mechanicalData.name}
                  viewerUrl={mechanicalData.viewerUrl}
                  downloadUrl={mechanicalData.downloadUrl}
                  htmlContent={mechanicalData.html}
                  htmlDocument={mechanicalData.htmlDocument}
                  accent="mechanical"
                />
              ) : (
                <div className="empty-panel">
                  <Wrench size={48} />
                  <p>Mekanik duruş dosyası yüklenmemiş</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenanceDowntime;
