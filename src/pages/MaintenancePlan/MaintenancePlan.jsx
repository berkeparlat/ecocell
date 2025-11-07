import { useState, useEffect } from 'react';
import SimpleHeader from '../../components/layout/SimpleHeader';
import { RefreshCw, Wrench, Zap } from 'lucide-react';
import { getLatestExcelFile } from '../../services/excelService';
import ExcelPreview from '../../components/excel/ExcelPreview';
import './MaintenancePlan.css';

const MaintenancePlan = () => {
  const [loading, setLoading] = useState(false);
  const [electricalData, setElectricalData] = useState(null);
  const [mechanicalData, setMechanicalData] = useState(null);

  useEffect(() => {
    loadLatestFiles();
  }, []);

  const loadLatestFiles = async () => {
    setLoading(true);
    try {
            
      // Elektrik Bakım dosyası
      const electricalFile = await getLatestExcelFile('electrical-maintenance');
            if (electricalFile) {
        setElectricalData(electricalFile);
      }
      
      // Mekanik Bakım dosyası
      const mechanicalFile = await getLatestExcelFile('mechanical-maintenance');
            if (mechanicalFile) {
        setMechanicalData(mechanicalFile);
      }
      
          } catch (error) {
                } finally {
      setLoading(false);
    }
  };

  return (
    <div className="maintenance-plan-page">
      <SimpleHeader />
      
      <div className="maintenance-container">
        <div className="maintenance-header">
          <div className="header-title">
            <Wrench size={32} />
            <div>
              <h1>Bakım Günlük İş Planı</h1>
              <p>Elektrik ve Mekanik Bakım günlük iş planlarını görüntüleyin</p>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="loading-state">
            <RefreshCw className="spin" size={48} />
            <p>Yükleniyor...</p>
          </div>
        ) : (
          <div className="maintenance-dual-view">
            {/* Sol Panel - Elektrik Bakım */}
            <div className="maintenance-panel">
              <div className="panel-header electrical">
                <Zap size={20} />
                <h2>Elektrik Bakım İş Planı</h2>
              </div>
              {electricalData ? (
                <ExcelPreview
                  fileName={electricalData.name}
                  viewerUrl={electricalData.viewerUrl}
                  accent="electrical"
                />
              ) : (
                <div className="empty-panel">
                  <Zap size={48} />
                  <p>Elektrik bakım dosyası yüklenmemiş</p>
                </div>
              )}
            </div>

            {/* Sağ Panel - Mekanik Bakım */}
            <div className="maintenance-panel">
              <div className="panel-header mechanical">
                <Wrench size={20} />
                <h2>Mekanik Bakım İş Planı</h2>
              </div>
              {mechanicalData ? (
                <ExcelPreview
                  fileName={mechanicalData.name}
                  viewerUrl={mechanicalData.viewerUrl}
                  accent="mechanical"
                />
              ) : (
                <div className="empty-panel">
                  <Wrench size={48} />
                  <p>Mekanik bakım dosyası yüklenmemiş</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenancePlan;
