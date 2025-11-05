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
  stock: 60,
  sales: 60,
  shipping: 60
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
  const [zoom, setZoom] = useState(DEFAULT_ZOOM[accent] || 100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const contentRef = useRef(null);
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
    setIframeLoaded(false);
  }, [hasViewer, fileName]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen]);

  // Shipping için son veri satırını bul ve scroll et
  useEffect(() => {
    if (accent !== 'shipping' || !contentRef.current) return;
    if (!htmlContent && !htmlDocument) return;
    if (htmlDocument && !iframeLoaded) return; // Iframe yüklenene kadar bekle

    const timer = setTimeout(() => {
      const container = contentRef.current;
      if (!container) return;

      let targetDocument = null;

      // Eğer iframe ise contentDocument'i al
      if (container.tagName === 'IFRAME') {
        try {
          targetDocument = container.contentDocument || container.contentWindow?.document;
        } catch (e) {
          console.warn('Iframe content erişilemedi:', e);
          return;
        }
      } else {
        // Normal div ise direkt container'ı kullan
        targetDocument = container;
      }

      if (!targetDocument) return;

      // Table'ı bul
      const table = targetDocument.querySelector('table');
      if (!table) return;

      const rows = Array.from(table.querySelectorAll('tr'));
      if (rows.length <= 1) return; // Sadece header varsa

      // Son veri satırını bul (boş olmayan son satır)
      let lastDataRow = null;
      for (let i = rows.length - 1; i >= 1; i--) {
        const row = rows[i];
        const cells = Array.from(row.querySelectorAll('td'));
        
        const hasData = cells.some(cell => {
          const text = cell.textContent?.trim();
          return text && text !== '' && text !== '-' && text !== '—';
        });

        if (hasData) {
          lastDataRow = row;
          break;
        }
      }

      if (lastDataRow) {
        // Highlight ekle
        lastDataRow.style.backgroundColor = '#fff3e0';
        lastDataRow.style.border = '2px solid #ff9800';
        lastDataRow.style.boxShadow = '0 0 10px rgba(255, 152, 0, 0.3)';

        // Scroll et
        lastDataRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [accent, htmlContent, htmlDocument, iframeLoaded]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };

  const handleResetZoom = () => {
    setZoom(DEFAULT_ZOOM[accent] || 100);
  };

  const handleFullscreen = () => {
    setIsFullscreen(true);
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
  };

  return (
    <>
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

        <div className="excel-render-area">
          {showFallback || !hasViewer ? (
            hasFallbackContent ? (
              htmlDocument ? (
                <iframe
                  ref={contentRef}
                  className="excel-iframe"
                  title={`Excel HTML önizleme - ${fileName}`}
                  srcDoc={htmlDocument}
                  onLoad={() => setIframeLoaded(true)}
                  style={{ 
                    transform: `scale(${zoom / 100})`, 
                    transformOrigin: 'top left',
                    width: `${(100 / zoom) * 100}%`,
                    height: `${(100 / zoom) * 100}%`
                  }}
                />
              ) : (
                <div
                  ref={contentRef}
                  className="excel-preview-html"
                  style={{ 
                    transform: `scale(${zoom / 100})`, 
                    transformOrigin: 'top left',
                    width: `${(100 / zoom) * 100}%`,
                    height: `${(100 / zoom) * 100}%`
                  }}
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
              key={viewerUrl}
              className="excel-iframe"
              title={`Excel önizleme - ${fileName}`}
              src={viewerUrl}
              loading="lazy"
              allowFullScreen={false}
              onError={() => setShowFallback(true)}
              style={{ 
                transform: `scale(${zoom / 100})`, 
                transformOrigin: 'top left',
                width: `${(100 / zoom) * 100}%`,
                height: `${(100 / zoom) * 100}%`
              }}
            />
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
              {showFallback || !hasViewer ? (
                hasFallbackContent ? (
                  htmlDocument ? (
                    <iframe
                      className="excel-iframe"
                      title={`Excel Tam Ekran - ${fileName}`}
                      srcDoc={htmlDocument}
                    />
                  ) : (
                    <div
                      className="excel-preview-html"
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
                  key={`fullscreen-${viewerUrl}`}
                  className="excel-iframe"
                  title={`Excel Tam Ekran - ${fileName}`}
                  src={viewerUrl}
                  loading="lazy"
                  allowFullScreen={false}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExcelPreview;
