import { useState, useEffect } from 'react';
import SimpleHeader from '../../components/layout/SimpleHeader';
import { RefreshCw, ShoppingCart, Truck, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';
import { getLatestExcelFile } from '../../services/excelService';
import ExcelPreview from '../../components/excel/ExcelPreview';
import './SalesOrder.css';

const SalesOrder = () => {
  const [loading, setLoading] = useState(false);
  const [excelData, setExcelData] = useState(null);
  const [shippingData, setShippingData] = useState(null);
  
  // Zoom states
  const [salesZoom, setSalesZoom] = useState(100);
  const [shippingZoom, setShippingZoom] = useState(100);

  useEffect(() => {
    loadLatestFiles();
  }, []);

  useEffect(() => {
    const iframe = document.querySelector('.sales-panel:first-child iframe');
    if (iframe && salesZoom !== 100) {
      iframe.style.transform = `scale(${salesZoom / 100})`;
      iframe.style.transformOrigin = 'top left';
      iframe.style.width = `${10000 / salesZoom}%`;
      iframe.style.height = `${10000 / salesZoom}%`;
    } else if (iframe) {
      iframe.style.transform = '';
      iframe.style.width = '';
      iframe.style.height = '';
    }
  }, [salesZoom]);

  useEffect(() => {
    const iframe = document.querySelector('.sales-panel:last-child iframe');
    if (iframe && shippingZoom !== 100) {
      iframe.style.transform = `scale(${shippingZoom / 100})`;
      iframe.style.transformOrigin = 'top left';
      iframe.style.width = `${10000 / shippingZoom}%`;
      iframe.style.height = `${10000 / shippingZoom}%`;
    } else if (iframe) {
      iframe.style.transform = '';
      iframe.style.width = '';
      iframe.style.height = '';
    }
  }, [shippingZoom]);

  const loadLatestFiles = async () => {
    setLoading(true);
    try {
            
      // Sipariş dosyası
      const salesFile = await getLatestExcelFile('sales');
            if (salesFile) {
        setExcelData(salesFile);
      }
      
      // Yükleme dosyası
      const shippingFile = await getLatestExcelFile('shipping');
            if (shippingFile) {
        setShippingData(shippingFile);
      }
      
          } catch (error) {
                } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sales-order-page">
      <SimpleHeader />
      
      <div className="sales-container">
        <div className="sales-header">
          <div className="header-title">
            <ShoppingCart size={22} />
            <div>
              <h1>Sipariş ve Yükleme Listesi</h1>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="loading-state">
            <RefreshCw className="spin" size={48} />
            <p>Yükleniyor...</p>
          </div>
        ) : (
          <div className="sales-dual-view">
            {/* Sol Panel - Satış Siparişleri */}
            <div className="sales-panel">
              <div className="panel-header sales">
                <div className="panel-header-left">
                  <ShoppingCart size={18} />
                  <h2>Satış ve Siparişler</h2>
                </div>
                {excelData && (
                  <div className="panel-header-controls">
                    <button 
                      className="panel-btn"
                      onClick={() => setSalesZoom(Math.max(50, salesZoom - 10))}
                      disabled={salesZoom <= 50}
                      title="Küçült"
                    >
                      <ZoomOut size={14} />
                    </button>
                    <span className="panel-zoom-display">{salesZoom}%</span>
                    <button 
                      className="panel-btn"
                      onClick={() => setSalesZoom(Math.min(200, salesZoom + 10))}
                      disabled={salesZoom >= 200}
                      title="Büyüt"
                    >
                      <ZoomIn size={14} />
                    </button>
                    <button 
                      className="panel-btn"
                      onClick={() => setSalesZoom(100)}
                      title="Varsayılan (100%)"
                    >
                      <RotateCcw size={14} />
                    </button>
                    <button 
                      className="panel-btn"
                      onClick={() => {
                        const iframe = document.querySelector('.sales-panel:first-child iframe');
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
                  accent="sales"
                  hideToolbar={true}
                />
              ) : (
                <div className="empty-panel">
                  <ShoppingCart size={48} />
                  <p>Sipariş dosyası yüklenmemiş</p>
                </div>
              )}
            </div>

            {/* Sağ Panel - Yüklemeler */}
            <div className="sales-panel">
              <div className="panel-header shipping">
                <div className="panel-header-left">
                  <Truck size={18} />
                  <h2>Elyaf Yüklemeleri</h2>
                </div>
                {shippingData && (
                  <div className="panel-header-controls">
                    <button 
                      className="panel-btn"
                      onClick={() => setShippingZoom(Math.max(50, shippingZoom - 10))}
                      disabled={shippingZoom <= 50}
                      title="Küçült"
                    >
                      <ZoomOut size={14} />
                    </button>
                    <span className="panel-zoom-display">{shippingZoom}%</span>
                    <button 
                      className="panel-btn"
                      onClick={() => setShippingZoom(Math.min(200, shippingZoom + 10))}
                      disabled={shippingZoom >= 200}
                      title="Büyüt"
                    >
                      <ZoomIn size={14} />
                    </button>
                    <button 
                      className="panel-btn"
                      onClick={() => setShippingZoom(100)}
                      title="Varsayılan (100%)"
                    >
                      <RotateCcw size={14} />
                    </button>
                    <button 
                      className="panel-btn"
                      onClick={() => {
                        const iframe = document.querySelector('.sales-panel:last-child iframe');
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
              {shippingData ? (
                <ExcelPreview
                  fileName={shippingData.name}
                  viewerUrl={shippingData.viewerUrl}
                  accent="shipping"
                  hideToolbar={true}
                />
              ) : (
                <div className="empty-panel">
                  <Truck size={48} />
                  <p>Yükleme dosyası yüklenmemiş</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesOrder;
