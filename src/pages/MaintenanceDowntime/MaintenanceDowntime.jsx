import { useState, useEffect } from 'react';
import SimpleHeader from '../../components/layout/SimpleHeader';
import { RefreshCw, Wrench, Zap, AlertTriangle, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';
import { getLatestExcelFile } from '../../services/excelService';
import ExcelPreview from '../../components/excel/ExcelPreview';
import './MaintenanceDowntime.css';

const MaintenanceDowntime = () => {
  const [activeTab, setActiveTab] = useState('electrical');
  const [loading, setLoading] = useState(false);
  const [excelData, setExcelData] = useState({
    electrical: null,
    mechanical: null
  });
  const [zoom, setZoom] = useState(100);

  const tabs = [
    { id: 'electrical', label: 'Elektrik Bakım', icon: Zap, fileType: 'electrical-downtime' },
    { id: 'mechanical', label: 'Mekanik Bakım', icon: Wrench, fileType: 'mechanical-downtime' }
  ];

  useEffect(() => {
    loadLatestFile(activeTab);
  }, [activeTab]);

  useEffect(() => {
    const iframe = document.querySelector('.downtime-panel iframe');
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
    if (excelData[tabId]) return;
    
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
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setZoom(100);
  };

  const currentData = excelData[activeTab];
  const currentTab = tabs.find(t => t.id === activeTab);
  const TabIcon = currentTab.icon;

  return (
    <div className="maintenance-downtime-page">
      <SimpleHeader />
      
      <div className="downtime-container">
        <div className="downtime-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`downtime-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        
        {loading ? (
          <div className="loading-state">
            <RefreshCw className="spin" size={48} />
            <p>Yükleniyor...</p>
          </div>
        ) : (
          <div className="downtime-single-view">
            <div className="downtime-panel">
              <div className="panel-header">
                <div className="panel-header-left">
                  <TabIcon size={20} />
                  <h2>{currentTab.label} Duruş İş Planı</h2>
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
                        const iframe = document.querySelector('.downtime-panel iframe');
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
                  accent={activeTab}
                  hideToolbar={true}
                />
              ) : (
                <div className="empty-panel">
                  <TabIcon size={48} />
                  <p>{currentTab.label} duruş dosyası yüklenmemiş</p>
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
