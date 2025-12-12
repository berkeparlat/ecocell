import { useState, useEffect } from 'react';
import SimpleHeader from '../../components/layout/SimpleHeader';
import { RefreshCw, Settings, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';
import { getLatestExcelFile } from '../../services/excelService';
import { excelZoomLevels } from '../../config/excelConfig';
import ExcelPreview from '../../components/excel/ExcelPreview';
import './Mechanic.css';

const FILE_TYPE = 'mechanical-maintenance';
const DEFAULT_ZOOM = excelZoomLevels[FILE_TYPE] || 100;

const Mechanic = () => {
  const [loading, setLoading] = useState(false);
  const [excelData, setExcelData] = useState(null);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  useEffect(() => {
    loadLatestFile();
  }, []);

  useEffect(() => {
    const applyZoom = () => {
      const iframe = document.querySelector('.mechanic-panel iframe');
      if (iframe) {
        iframe.style.transform = `scale(${zoom / 100})`;
        iframe.style.transformOrigin = 'top left';
        iframe.style.width = `${10000 / zoom}%`;
        iframe.style.height = `${10000 / zoom}%`;
      }
    };
    
    applyZoom();
    
    const iframe = document.querySelector('.mechanic-panel iframe');
    if (iframe) {
      iframe.addEventListener('load', applyZoom);
      return () => iframe.removeEventListener('load', applyZoom);
    }
  }, [zoom, excelData]);

  const loadLatestFile = async () => {
    setLoading(true);
    try {
      const file = await getLatestExcelFile(FILE_TYPE);
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
    <div className="mechanic-page">
      <SimpleHeader />
      
      <div className="mechanic-container">
        {loading ? (
          <div className="loading-state">
            <RefreshCw className="spin" size={48} />
            <p>Yükleniyor...</p>
          </div>
        ) : (
          <div className="mechanic-single-view">
            <div className="mechanic-panel">
              <div className="panel-header">
                <div className="panel-header-left">
                  <Settings size={20} />
                  <h2>Mekanik Tüketimi</h2>
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
                      onClick={() => setZoom(DEFAULT_ZOOM)}
                      title={`Varsayılan (${DEFAULT_ZOOM}%)`}
                    >
                      <RotateCcw size={16} />
                    </button>
                    <button 
                      className="panel-btn"
                      onClick={() => {
                        const iframe = document.querySelector('.mechanic-panel iframe');
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
                  accent="mechanic"
                  hideToolbar={true}
                />
              ) : (
                <div className="empty-state">
                  <Settings size={48} />
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

export default Mechanic;
