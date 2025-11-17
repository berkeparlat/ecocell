import { useState, useEffect } from 'react';
import SimpleHeader from '../../components/layout/SimpleHeader';
import { RefreshCw, FileSpreadsheet, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';
import { getLatestExcelFile } from '../../services/excelService';
import ExcelPreview from '../../components/excel/ExcelPreview';
import './DCSReport.css';

const DCSReport = () => {
  const [loading, setLoading] = useState(false);
  const [excelData, setExcelData] = useState(null);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    loadLatestFile();
  }, []);

  useEffect(() => {
    const iframe = document.querySelector('.dcs-panel iframe');
    if (iframe && zoom !== 100) {
      iframe.style.transform = `scale(${zoom / 100})`;
      iframe.style.transformOrigin = 'top left';
      iframe.style.width = `${10000 / zoom}%`;
      iframe.style.height = `${10000 / zoom}%`;
    } else if (iframe) {
      iframe.style.transform = '';
      iframe.style.width = '';
      iframe.style.height = '';
    }
  }, [zoom]);

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
        ) : (
          <div className="dcs-single-view">
            <div className="dcs-panel">
              <div className="panel-header">
                <div className="panel-header-left">
                  <FileSpreadsheet size={18} />
                  <h2>DCS Haftalık Rapor - Buhar</h2>
                </div>
                {excelData && (
                  <div className="panel-header-controls">
                    <button 
                      className="panel-btn"
                      onClick={() => setZoom(Math.max(50, zoom - 10))}
                      disabled={zoom <= 50}
                      title="Küçült"
                    >
                      <ZoomOut size={14} />
                    </button>
                    <span className="panel-zoom-display">{zoom}%</span>
                    <button 
                      className="panel-btn"
                      onClick={() => setZoom(Math.min(200, zoom + 10))}
                      disabled={zoom >= 200}
                      title="Büyüt"
                    >
                      <ZoomIn size={14} />
                    </button>
                    <button 
                      className="panel-btn"
                      onClick={() => setZoom(100)}
                      title="Varsayılan (100%)"
                    >
                      <RotateCcw size={14} />
                    </button>
                    <button 
                      className="panel-btn"
                      onClick={() => {
                        const iframe = document.querySelector('.dcs-panel iframe');
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
              {excelData ? (
                <ExcelPreview
                  fileName={excelData.name}
                  viewerUrl={excelData.viewerUrl}
                  accent="dcs"
                  hideToolbar={true}
                />
              ) : (
                <div className="empty-panel">
                  <FileSpreadsheet size={48} />
                  <p>Henüz dosya yüklenmemiş</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DCSReport;
