import React, { useState, useEffect, useRef } from 'react';
import SimpleHeader from '../../components/layout/SimpleHeader';
import { RefreshCw, FileText, Maximize2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { getLatestExcelFile } from '../../services/excelService';
import ExcelPreview from '../../components/excel/ExcelPreview';
import './DCSReportAB.css';

const DCSReportAB = () => {
  const [fileDataA, setFileDataA] = useState(null);
  const [fileDataB, setFileDataB] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoomA, setZoomA] = useState(100);
  const [zoomB, setZoomB] = useState(100);
  const iframeRefA = useRef(null);
  const iframeRefB = useRef(null);

  useEffect(() => {
    loadExcelFiles();
  }, []);

  useEffect(() => {
    // A hattı iframe zoom
    const iframe = document.querySelector('.dcs-panel:first-child iframe');
    if (iframe) {
      iframe.style.transform = `scale(${zoomA / 100})`;
      iframe.style.transformOrigin = 'top left';
      iframe.style.width = `${10000 / zoomA}%`;
      iframe.style.height = `${10000 / zoomA}%`;
    }
  }, [zoomA]);

  useEffect(() => {
    // B hattı iframe zoom
    const iframe = document.querySelector('.dcs-panel:last-child iframe');
    if (iframe) {
      iframe.style.transform = `scale(${zoomB / 100})`;
      iframe.style.transformOrigin = 'top left';
      iframe.style.width = `${10000 / zoomB}%`;
      iframe.style.height = `${10000 / zoomB}%`;
    }
  }, [zoomB]);

  const loadExcelFiles = async () => {
    setLoading(true);
    setError(null);

    const [dataA, dataB] = await Promise.all([
      getLatestExcelFile('dcs-a').catch(() => null),
      getLatestExcelFile('dcs-b').catch(() => null)
    ]);

    setFileDataA(dataA);
    setFileDataB(dataB);
    
    if (!dataA && !dataB) {
      setError('Excel dosyaları yüklenemedi');
    }
    
    setLoading(false);
  };

  return (
    <div className="dcs-report-ab-page">
      <SimpleHeader />
      
      <div className="dcs-container">
        <div className="dcs-header">
          <div className="header-title">
            <FileText size={22} />
            <div>
              <h1>DCS Haftalık Rapor - A ve B Hattı</h1>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="loading-state">
            <RefreshCw className="spin" size={48} />
            <p>Yükleniyor...</p>
          </div>
        ) : (
          <div className="dcs-dual-view">
            {/* Sol Panel - A Hattı */}
            <div className="dcs-panel">
              <div className="panel-header dcs-a">
                <div className="panel-header-left">
                  <FileText size={18} />
                  <h2>A Hattı</h2>
                </div>
                {fileDataA && (
                  <div className="panel-header-controls">
                    <button 
                      className="panel-btn"
                      onClick={() => setZoomA(Math.max(50, zoomA - 10))}
                      disabled={zoomA <= 50}
                      title="Küçült"
                    >
                      <ZoomOut size={14} />
                    </button>
                    <span className="panel-zoom-display">{zoomA}%</span>
                    <button 
                      className="panel-btn"
                      onClick={() => setZoomA(Math.min(200, zoomA + 10))}
                      disabled={zoomA >= 200}
                      title="Büyüt"
                    >
                      <ZoomIn size={14} />
                    </button>
                    <button 
                      className="panel-btn"
                      onClick={() => setZoomA(100)}
                      title="Varsayılan (100%)"
                    >
                      <RotateCcw size={14} />
                    </button>
                    <button 
                      className="panel-btn"
                      onClick={() => {
                        const iframe = document.querySelector('.dcs-panel:first-child iframe');
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
              {fileDataA ? (
                <ExcelPreview
                  fileName={fileDataA.name}
                  viewerUrl={fileDataA.viewerUrl}
                  accent="dcs"
                  hideToolbar={true}
                />
              ) : (
                <div className="empty-panel">
                  <FileText size={48} />
                  <p>A Hattı dosyası bulunamadı</p>
                </div>
              )}
            </div>

            {/* Sağ Panel - B Hattı */}
            <div className="dcs-panel">
              <div className="panel-header dcs-b">
                <div className="panel-header-left">
                  <FileText size={18} />
                  <h2>B Hattı</h2>
                </div>
                {fileDataB && (
                  <div className="panel-header-controls">
                    <button 
                      className="panel-btn"
                      onClick={() => setZoomB(Math.max(50, zoomB - 10))}
                      disabled={zoomB <= 50}
                      title="Küçült"
                    >
                      <ZoomOut size={14} />
                    </button>
                    <span className="panel-zoom-display">{zoomB}%</span>
                    <button 
                      className="panel-btn"
                      onClick={() => setZoomB(Math.min(200, zoomB + 10))}
                      disabled={zoomB >= 200}
                      title="Büyüt"
                    >
                      <ZoomIn size={14} />
                    </button>
                    <button 
                      className="panel-btn"
                      onClick={() => setZoomB(100)}
                      title="Varsayılan (100%)"
                    >
                      <RotateCcw size={14} />
                    </button>
                    <button 
                      className="panel-btn"
                      onClick={() => {
                        const iframe = document.querySelector('.dcs-panel:last-child iframe');
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
              {fileDataB ? (
                <ExcelPreview
                  fileName={fileDataB.name}
                  viewerUrl={fileDataB.viewerUrl}
                  accent="dcs"
                  hideToolbar={true}
                />
              ) : (
                <div className="empty-panel">
                  <FileText size={48} />
                  <p>B Hattı dosyası bulunamadı</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DCSReportAB;
