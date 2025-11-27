import { useState, useEffect } from 'react';
import SimpleHeader from '../../components/layout/SimpleHeader';
import { RefreshCw, Activity, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';
import { getLatestExcelFile } from '../../services/excelService';
import ExcelPreview from '../../components/excel/ExcelPreview';
import './DCSA012.css';

const DCSA012 = () => {
  const [loading, setLoading] = useState(false);
  const [excelData, setExcelData] = useState(null);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    loadLatestFile();
  }, []);

  useEffect(() => {
    const iframe = document.querySelector('.dcs-a012-panel iframe');
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
      const file = await getLatestExcelFile('dcs-a012');
      if (file) {
        setExcelData(file);
      }
    } catch (error) {
      console.error('Dosya yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dcs-a012-page">
      <SimpleHeader />
      
      <div className="dcs-a012-container">
        {loading ? (
          <div className="loading-state">
            <RefreshCw className="spin" size={48} />
            <p>Yükleniyor...</p>
          </div>
        ) : (
          <div className="dcs-a012-single-view">
            <div className="dcs-a012-panel">
              <div className="panel-header">
                <div className="panel-header-left">
                  <Activity size={20} />
                  <h2>DCS Haftalık Rapor A Hattı - A012 Bölgesi</h2>
                </div>
                {excelData && (
                  <div className="panel-header-controls">
                    <button 
                      className="panel-btn"
                      onClick={() => setZoom(Math.max(50, zoom - 10))}
                      disabled={zoom <= 50}
                      title="Küçült"
                    >
                      <ZoomOut size={16} />
                    </button>
                    <span className="panel-zoom-display">{zoom}%</span>
                    <button 
                      className="panel-btn"
                      onClick={() => setZoom(Math.min(200, zoom + 10))}
                      disabled={zoom >= 200}
                      title="Büyüt"
                    >
                      <ZoomIn size={16} />
                    </button>
                    <button 
                      className="panel-btn"
                      onClick={() => setZoom(100)}
                      title="Varsayılan (100%)"
                    >
                      <RotateCcw size={16} />
                    </button>
                    <button 
                      className="panel-btn"
                      onClick={() => {
                        const iframe = document.querySelector('.dcs-a012-panel iframe');
                        if (iframe) {
                          iframe.requestFullscreen?.() || iframe.webkitRequestFullscreen?.() || iframe.mozRequestFullScreen?.();
                        }
                      }}
                      title="Tam Ekran"
                    >
                      <Maximize2 size={16} />
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
                <div className="empty-state">
                  <Activity size={48} />
                  <p>Henüz excel dosyası yüklenmemiş</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DCSA012;
