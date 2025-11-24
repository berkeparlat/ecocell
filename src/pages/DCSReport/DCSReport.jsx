import { useState, useEffect } from 'react';
import SimpleHeader from '../../components/layout/SimpleHeader';
import { RefreshCw, FileText, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';
import { getLatestExcelFile } from '../../services/excelService';
import ExcelPreview from '../../components/excel/ExcelPreview';
import './DCSReport.css';

const DCSReport = () => {
  const [activeTab, setActiveTab] = useState('a');
  const [loading, setLoading] = useState(false);
  const [excelData, setExcelData] = useState({
    a: null,
    b: null,
    buhar: null
  });
  const [zoom, setZoom] = useState(100);

  const tabs = [
    { id: 'a', label: 'A Hattı', fileType: 'dcs-a' },
    { id: 'b', label: 'B Hattı', fileType: 'dcs-b' },
    { id: 'buhar', label: 'Buhar', fileType: 'dcs-buhar' }
  ];

  useEffect(() => {
    loadLatestFile(activeTab);
  }, [activeTab]);

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

  const loadLatestFile = async (tabId) => {
    if (excelData[tabId]) return; // Daha önce yüklendiyse tekrar yükleme
    
    setLoading(true);
    try {
      const tab = tabs.find(t => t.id === tabId);
      const file = await getLatestExcelFile(tab.fileType);
      
      if (file) {
        setExcelData(prev => ({
          ...prev,
          [tabId]: file
        }));
      }
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setZoom(100); // Reset zoom when switching tabs
  };

  const currentData = excelData[activeTab];
  const currentTab = tabs.find(t => t.id === activeTab);

  return (
    <div className="dcs-report-page">
      <SimpleHeader />
      
      <div className="dcs-container">
        <div className="dcs-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`dcs-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              <FileText size={20} />
              <span>{tab.label}</span>
            </button>
          ))}
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
                  <FileText size={20} />
                  <h2>{currentTab.label}</h2>
                </div>
                {currentData && (
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
                        const iframe = document.querySelector('.dcs-panel iframe');
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
              {currentData ? (
                <ExcelPreview
                  fileName={currentData.name}
                  viewerUrl={currentData.viewerUrl}
                  accent="dcs"
                  hideToolbar={true}
                />
              ) : (
                <div className="empty-panel">
                  <FileText size={48} />
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
