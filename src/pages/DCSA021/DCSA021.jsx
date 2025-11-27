import { useState, useEffect } from 'react';
import SimpleHeader from '../../components/layout/SimpleHeader';
import { RefreshCw, Activity, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';
import { getLatestExcelFile } from '../../services/excelService';
import ExcelPreview from '../../components/excel/ExcelPreview';
import './DCSA021.css';

const DCSA021 = () => {
  const [loading, setLoading] = useState(false);
  const [excelData, setExcelData] = useState(null);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    loadLatestFile();
  }, []);

  useEffect(() => {
    const iframe = document.querySelector('.dcs-a021-panel iframe');
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
      const file = await getLatestExcelFile('dcs-a021');
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
    <div className="dcs-a021-page">
      <SimpleHeader />
      
      <div className="dcs-a021-container">
        {loading ? (
          <div className="loading-state">
            <RefreshCw className="spin" size={48} />
            <p>Yükleniyor...</p>
          </div>
        ) : (
          <div className="dcs-a021-panel">
            <div className="panel-header">
              <div className="panel-header-left">
                <Activity size={20} />
                <h2>DCS Haftalık Rapor A Hattı - A021 Bölgesi</h2>
              </div>
              <div className="panel-header-controls">
                <button 
                  className="panel-btn"
                  onClick={() => setZoom(prev => Math.max(prev - 10, 50))}
                  title="Küçült"
                >
                  <ZoomOut size={16} />
                </button>
                <span className="panel-zoom-display">{zoom}%</span>
                <button 
                  className="panel-btn"
                  onClick={() => setZoom(prev => Math.min(prev + 10, 150))}
                  title="Büyüt"
                >
                  <ZoomIn size={16} />
                </button>
                <button 
                  className="panel-btn"
                  onClick={() => setZoom(100)}
                  title="Sıfırla"
                >
                  <RotateCcw size={16} />
                </button>
                <button 
                  className="panel-btn"
                  onClick={loadLatestFile}
                  title="Yenile"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>
            
            {excelData ? (
              <ExcelPreview file={excelData} />
            ) : (
              <div className="empty-panel">
                <Activity size={48} />
                <p>Henüz dosya yüklenmemiş</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DCSA021;
