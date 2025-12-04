import { useState, useEffect } from 'react';
import SimpleHeader from '../../components/layout/SimpleHeader';
import { RefreshCw, FileSpreadsheet, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';
import { getLatestExcelFile } from '../../services/excelService';
import { excelZoomLevels } from '../../config/excelConfig';
import ExcelPreview from '../../components/excel/ExcelPreview';
import './DailyStock.css';

const FILE_TYPE = 'stock';
const DEFAULT_ZOOM = excelZoomLevels[FILE_TYPE] || 100;

const DailyStock = () => {
  const [loading, setLoading] = useState(false);
  const [excelData, setExcelData] = useState(null);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  useEffect(() => {
    loadLatestFile();
  }, []);

  useEffect(() => {
    const applyZoom = () => {
      const iframe = document.querySelector('.stock-panel iframe');
      if (iframe) {
        iframe.style.transform = `scale(${zoom / 100})`;
        iframe.style.transformOrigin = 'top left';
        iframe.style.width = `${10000 / zoom}%`;
        iframe.style.height = `${10000 / zoom}%`;
      }
    };
    
    applyZoom();
    
    // iframe yüklenince de uygula
    const iframe = document.querySelector('.stock-panel iframe');
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
    <div className="daily-stock-page">
      <SimpleHeader />
      
      <div className="stock-container">
        {loading ? (
          <div className="loading-state">
            <RefreshCw className="spin" size={48} />
            <p>Yükleniyor...</p>
          </div>
        ) : (
          <div className="stock-single-view">
            <div className="stock-panel">
              <div className="panel-header">
                <div className="panel-header-left">
                  <FileSpreadsheet size={20} />
                  <h2>Günlük Stok Listesi</h2>
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
                        const iframe = document.querySelector('.stock-panel iframe');
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
                  accent="stock"
                  hideToolbar={true}
                />
              ) : (
                <div className="empty-panel">
                  <FileSpreadsheet size={48} />
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

export default DailyStock;
