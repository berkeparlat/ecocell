import { useEffect, useState } from 'react';
import './ExcelPreview.css';

const ACCENT_PALETTES = {
  stock: {
    base: '#4caf50',
    dark: '#2e7d32',
    text: '#2e7d32',
    soft: 'rgba(76, 175, 80, 0.12)',
    border: 'rgba(46, 125, 50, 0.35)'
  },
  sales: {
    base: '#ff6b35',
    dark: '#ff5722',
    text: '#bf360c',
    soft: 'rgba(255, 107, 53, 0.16)',
    border: 'rgba(255, 107, 53, 0.35)'
  }
};

const ExcelPreview = ({
  fileName,
  viewerUrl,
  htmlContent,
  htmlDocument,
  accent = 'stock'
}) => {
  const hasViewer = Boolean(viewerUrl);
  const hasFallbackContent = Boolean(htmlDocument || htmlContent);
  const initialFallback = !hasViewer;
  const [showFallback, setShowFallback] = useState(initialFallback);
  const [zoom, setZoom] = useState(100);
  const [fitToWidth, setFitToWidth] = useState(true);
  const palette = ACCENT_PALETTES[accent] || ACCENT_PALETTES.stock;
  const styleVars = {
    '--excel-accent-base': palette.base,
    '--excel-accent-dark': palette.dark,
    '--excel-accent-text': palette.text,
    '--excel-accent-soft': palette.soft,
    '--excel-accent-border': palette.border
  };

  useEffect(() => {
    setShowFallback(!hasViewer);
  }, [hasViewer, fileName]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200));
    setFitToWidth(false);
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
    setFitToWidth(false);
  };

  const handleResetZoom = () => {
    setZoom(100);
    setFitToWidth(false);
  };

  const handleFitToWidth = () => {
    setFitToWidth(true);
    setZoom(100);
  };

  return (
    <div className={`excel-preview-card excel-preview-card--${accent}`} style={styleVars}>
      {/* Zoom Kontrolleri */}
      <div className="excel-toolbar">
        <div className="excel-toolbar-left">
          <button 
            className="excel-btn excel-btn-icon"
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            title="Küçült"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>
          <button 
            className="excel-btn excel-btn-icon"
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            title="Büyüt"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
              <line x1="11" y1="8" x2="11" y2="14"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>
          <span className="excel-zoom-label">{zoom}%</span>
          <button 
            className="excel-btn"
            onClick={handleResetZoom}
            title="Sıfırla"
          >
            100%
          </button>
          <button 
            className={`excel-btn ${fitToWidth ? 'excel-btn-active' : ''}`}
            onClick={handleFitToWidth}
            title="Ekrana Sığdır"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="excel-render-area">
        {showFallback || !hasViewer ? (
          hasFallbackContent ? (
            htmlDocument ? (
              <iframe
                className="excel-iframe"
                title={`Excel HTML önizleme - ${fileName}`}
                srcDoc={htmlDocument}
                style={{ transform: fitToWidth ? 'none' : `scale(${zoom / 100})`, transformOrigin: 'top left' }}
              />
            ) : (
              <div
                className={`excel-preview-html ${fitToWidth ? 'fit-width' : ''}`}
                style={{ transform: fitToWidth ? 'none' : `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                dangerouslySetInnerHTML={{ __html: htmlContent || '<p>Önizleme bulunamadı.</p>' }}
              />
            )
          ) : (
            <div className="excel-preview-empty">
              <p>Önizleme verisi bulunamadı.</p>
            </div>
          )
        ) : (
          <iframe
            className="excel-iframe"
            title={`Excel önizleme - ${fileName}`}
            src={viewerUrl}
            loading="lazy"
            allowFullScreen={false}
            onError={() => setShowFallback(true)}
            style={{ transform: fitToWidth ? 'none' : `scale(${zoom / 100})`, transformOrigin: 'top left' }}
          />
        )}
      </div>
    </div>
  );
};

export default ExcelPreview;
