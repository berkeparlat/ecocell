import { useState, useEffect } from 'react';
import SimpleHeader from '../../components/layout/SimpleHeader';
import { RefreshCw, ShoppingCart, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';
import { getLatestExcelFile } from '../../services/excelService';
import ExcelPreview from '../../components/excel/ExcelPreview';
import './Orders.css';

const Orders = () => {
  const [loading, setLoading] = useState(false);
  const [excelData, setExcelData] = useState(null);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    loadLatestFile();
  }, []);

  useEffect(() => {
    const iframe = document.querySelector('.orders-panel iframe');
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
      const file = await getLatestExcelFile('sales');
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
    <div className="orders-page">
      <SimpleHeader />
      
      <div className="orders-container">
        {loading ? (
          <div className="loading-state">
            <RefreshCw className="spin" size={48} />
            <p>Yükleniyor...</p>
          </div>
        ) : (
          <div className="orders-single-view">
            <div className="orders-panel">
              <div className="panel-header">
                <div className="panel-header-left">
                  <ShoppingCart size={20} />
                  <h2>Siparişler</h2>
                </div>
                <div className="panel-header-controls">
                  <button 
                    className="panel-btn"
                    onClick={() => setZoom(Math.max(50, zoom - 10))}
                    disabled={!excelData || zoom <= 50}
                    title="Küçült"
                  >
                    <ZoomOut size={16} />
                  </button>
                  <span className="panel-zoom-display">{zoom}%</span>
                  <button 
                    className="panel-btn"
                    onClick={() => setZoom(Math.min(200, zoom + 10))}
                    disabled={!excelData || zoom >= 200}
                    title="Büyüt"
                  >
                    <ZoomIn size={16} />
                  </button>
                  <button 
                    className="panel-btn"
                    onClick={() => setZoom(100)}
                    disabled={!excelData}
                    title="Varsayılan (100%)"
                  >
                    <RotateCcw size={16} />
                  </button>
                  <button 
                    className="panel-btn"
                    onClick={() => {
                      const iframe = document.querySelector('.orders-panel iframe');
                      if (iframe) {
                        iframe.requestFullscreen?.() || iframe.webkitRequestFullscreen?.() || iframe.mozRequestFullScreen?.();
                      }
                    }}
                    disabled={!excelData}
                    title="Tam Ekran"
                  >
                    <Maximize2 size={16} />
                  </button>
                </div>
              </div>
              {excelData ? (
                <ExcelPreview
                  fileName={excelData.name}
                  viewerUrl={excelData.viewerUrl}
                  accent="sales"
                  hideToolbar={true}
                />
              ) : (
                <div className="empty-state">
                  <ShoppingCart size={48} />
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

export default Orders;
