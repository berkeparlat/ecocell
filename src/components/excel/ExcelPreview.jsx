import { useEffect, useState, useRef } from 'react';
import './ExcelPreview.css';
import { Maximize2 } from 'lucide-react';

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
  },
  shipping: {
    base: '#ff9800',
    dark: '#f57c00',
    text: '#e65100',
    soft: 'rgba(255, 152, 0, 0.16)',
    border: 'rgba(255, 152, 0, 0.35)'
  }
};

// Varsayılan zoom değerleri
const DEFAULT_ZOOM = {
  stock: 100,
  sales: 60,
  shipping: 60
};

const ExcelPreview = ({
  fileName,
  viewerUrl,
  accent = 'stock',
  hideToolbar = false,
  onZoomChange,
  currentZoom = 100,
  onFullscreen
}) => {
  const hasViewer = Boolean(viewerUrl);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM[accent] || 100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const palette = ACCENT_PALETTES[accent] || ACCENT_PALETTES.stock;
  const styleVars = {
    '--excel-accent-base': palette.base,
    '--excel-accent-dark': palette.dark,
    '--excel-accent-text': palette.text,
    '--excel-accent-soft': palette.soft,
    '--excel-accent-border': palette.border
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen]);

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 10, 200);
    setZoom(newZoom);
    if (onZoomChange) onZoomChange(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 10, 50);
    setZoom(newZoom);
    if (onZoomChange) onZoomChange(newZoom);
  };

  const handleResetZoom = () => {
    const newZoom = DEFAULT_ZOOM[accent] || 100;
    setZoom(newZoom);
    if (onZoomChange) onZoomChange(newZoom);
  };

  const handleFullscreen = () => {
    setIsFullscreen(true);
    if (onFullscreen) onFullscreen(true);
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
    if (onFullscreen) onFullscreen(false);
  };

  return (
    <>
      <div className={`excel-preview-card excel-preview-card--${accent}`} style={styleVars}>
        {/* Zoom Kontrolleri - Sağ üstte */}
        {!hideToolbar && (
          <div className="excel-toolbar">
            <div className="excel-toolbar-left">
              {/* Boş - gelecekte başlık veya info eklenebilir */}
            </div>
            <div className="excel-toolbar-right">
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
              <span className="excel-zoom-label">{zoom}%</span>
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
              <button 
                className="excel-btn"
                onClick={handleResetZoom}
                title="Varsayılan Zoom"
              >
                Sıfırla
              </button>
              <button 
                className="excel-btn excel-btn-fullscreen"
                onClick={handleFullscreen}
                title="Tam Ekran"
              >
                <Maximize2 size={16} />
                Tam Ekran
              </button>
            </div>
          </div>
        )}

        <div className="excel-render-area">
          {hasViewer ? (
            <iframe
              key={viewerUrl}
              className="excel-iframe"
              title={`Excel önizleme - ${fileName}`}
              src={viewerUrl}
              loading="lazy"
              allowFullScreen={false}
              style={{ 
                transform: `scale(${zoom / 100})`, 
                transformOrigin: 'top left',
                width: `${10000 / zoom}%`,
                height: `${10000 / zoom}%`
              }}
            />
          ) : (
            <div className="excel-preview-empty">
              <p>Excel dosyası yüklenemedi. Lütfen admin ile iletişime geçin.</p>
            </div>
          )}
        </div>
      </div>

      {/* Tam Ekran Modal */}
      {isFullscreen && (
        <div className="excel-fullscreen-modal" onClick={handleCloseFullscreen}>
          <div className="excel-fullscreen-content" onClick={(e) => e.stopPropagation()}>
            <button className="excel-fullscreen-close" onClick={handleCloseFullscreen} title="Kapat (ESC)">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <div className="excel-fullscreen-viewer">
              {hasViewer ? (
                <iframe
                  key={`fullscreen-${viewerUrl}`}
                  className="excel-iframe"
                  title={`Excel Tam Ekran - ${fileName}`}
                  src={viewerUrl}
                  loading="lazy"
                  allowFullScreen={false}
                />
              ) : (
                <div className="excel-preview-empty">
                  <p>Önizleme verisi bulunamadı.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExcelPreview;
