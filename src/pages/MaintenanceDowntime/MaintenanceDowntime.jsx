import { useState, useEffect } from 'react';
import SimpleHeader from '../../components/layout/SimpleHeader';
import { RefreshCw, Wrench, Zap, AlertTriangle, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';
import { getLatestExcelFile } from '../../services/excelService';
import ExcelPreview from '../../components/excel/ExcelPreview';
import './MaintenanceDowntime.css';

const MaintenanceDowntime = () => {
  const [loading, setLoading] = useState(false);
  const [electricalData, setElectricalData] = useState(null);
  const [mechanicalData, setMechanicalData] = useState(null);
  
  // Zoom states
  const [electricalZoom, setElectricalZoom] = useState(100);
  const [mechanicalZoom, setMechanicalZoom] = useState(100);

  useEffect(() => {
    loadLatestFiles();
  }, []);

  const loadLatestFiles = async () => {
    setLoading(true);
    try {
            
      // Elektrik Bakım Duruş dosyası
      const electricalFile = await getLatestExcelFile('electrical-downtime');
            if (electricalFile) {
        setElectricalData(electricalFile);
      }
      
      // Mekanik Bakım Duruş dosyası
      const mechanicalFile = await getLatestExcelFile('mechanical-downtime');
            if (mechanicalFile) {
        setMechanicalData(mechanicalFile);
      }
      
          } catch (error) {
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
            <AlertTriangle size={22} />
            <div>
              <h1>Bakım Duruş İş Planı</h1>
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
                <div className="panel-header-left">
                  <Zap size={18} />
                  <h2>Elektrik Bakım Duruş Listesi</h2>
                </div>
                {electricalData && (
                  <div className="panel-header-controls">
                    <button 
                      className="panel-btn"
                      onClick={() => setElectricalZoom(Math.max(50, electricalZoom - 10))}
                      disabled={electricalZoom <= 50}
                      title="Küçült"
                    >
                      <ZoomOut size={14} />
                    </button>
                    <span className="panel-zoom-display">{electricalZoom}%</span>
                    <button 
                      className="panel-btn"
                      onClick={() => setElectricalZoom(Math.min(200, electricalZoom + 10))}
                      disabled={electricalZoom >= 200}
                      title="Büyüt"
                    >
                      <ZoomIn size={14} />
                    </button>
                    <button 
                      className="panel-btn"
                      onClick={() => setElectricalZoom(100)}
                      title="Varsayılan (100%)"
                    >
                      <RotateCcw size={14} />
                    </button>
                    <button 
                      className="panel-btn"
                      onClick={() => {
                        const iframe = document.querySelector('.downtime-panel:first-child iframe');
                        if (iframe) {
                          iframe.requestFullscreen?.() || iframe.webkitRequestFullscreen?.() || iframe.mozRequestFullScreen?.();
                        }
                      }}
                      title="Tam Ekran"
                    >
                      <Maximize2 size={14} />
                    </button>
                  </div>
                )}
              </div>
              {electricalData ? (
                <ExcelPreview
                  fileName={electricalData.name}
                  viewerUrl={electricalData.viewerUrl}
                  accent="electrical"
                  hideToolbar={true}
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
                <div className="panel-header-left">
                  <Wrench size={18} />
                  <h2>Mekanik Bakım Duruş Listesi</h2>
                </div>
                {mechanicalData && (
                  <div className="panel-header-controls">
                    <button 
                      className="panel-btn"
                      onClick={() => setMechanicalZoom(Math.max(50, mechanicalZoom - 10))}
                      disabled={mechanicalZoom <= 50}
                      title="Küçült"
                    >
                      <ZoomOut size={14} />
                    </button>
                    <span className="panel-zoom-display">{mechanicalZoom}%</span>
                    <button 
                      className="panel-btn"
                      onClick={() => setMechanicalZoom(Math.min(200, mechanicalZoom + 10))}
                      disabled={mechanicalZoom >= 200}
                      title="Büyüt"
                    >
                      <ZoomIn size={14} />
                    </button>
                    <button 
                      className="panel-btn"
                      onClick={() => setMechanicalZoom(100)}
                      title="Varsayılan (100%)"
                    >
                      <RotateCcw size={14} />
                    </button>
                    <button 
                      className="panel-btn"
                      onClick={() => {
                        const iframe = document.querySelector('.downtime-panel:last-child iframe');
                        if (iframe) {
                          iframe.requestFullscreen?.() || iframe.webkitRequestFullscreen?.() || iframe.mozRequestFullScreen?.();
                        }
                      }}
                      title="Tam Ekran"
                    >
                      <Maximize2 size={14} />
                    </button>
                  </div>
                )}
              </div>
              {mechanicalData ? (
                <ExcelPreview
                  fileName={mechanicalData.name}
                  viewerUrl={mechanicalData.viewerUrl}
                  accent="mechanical"
                  hideToolbar={true}
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
