import React, { useState, useEffect } from 'react';
import SimpleHeader from '../../components/layout/SimpleHeader';
import { RefreshCw, FileText, Maximize2 } from 'lucide-react';
import { getLatestExcelFile } from '../../services/excelService';
import ExcelPreview from '../../components/excel/ExcelPreview';
import './DCSReportAB.css';

const DCSReportAB = () => {
  const [fileDataA, setFileDataA] = useState(null);
  const [fileDataB, setFileDataB] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadExcelFiles();
  }, []);

  const loadExcelFiles = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dataA, dataB] = await Promise.all([
        getLatestExcelFile('dcs-a'),
        getLatestExcelFile('dcs-b')
      ]);

      setFileDataA(dataA);
      setFileDataB(dataB);
    } catch (err) {
      console.error('Excel dosyaları yüklenirken hata:', err);
      setError('Excel dosyaları yüklenemedi');
    } finally {
      setLoading(false);
    }
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
