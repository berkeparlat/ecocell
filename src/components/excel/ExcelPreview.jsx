import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
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
  downloadUrl,
  htmlContent,
  htmlDocument,
  accent = 'stock'
}) => {
  const [showFallback, setShowFallback] = useState(true);
  const palette = ACCENT_PALETTES[accent] || ACCENT_PALETTES.stock;
  const styleVars = {
    '--excel-accent-base': palette.base,
    '--excel-accent-dark': palette.dark,
    '--excel-accent-text': palette.text,
    '--excel-accent-soft': palette.soft,
    '--excel-accent-border': palette.border
  };

  const hasViewer = Boolean(viewerUrl);
  const hasFallbackContent = Boolean(htmlDocument || htmlContent);
  const shouldRenderFallback = (!hasViewer && hasFallbackContent) || (showFallback && hasFallbackContent);
  const toggleLabel = showFallback ? 'Office Görünümünü Aç' : 'HTML Yedek Görünüm';

  useEffect(() => {
    setShowFallback(true);
  }, [fileName, viewerUrl, htmlDocument]);

  return (
    <div className={`excel-preview-card excel-preview-card--${accent}`} style={styleVars}>
      <div className="excel-preview-toolbar">
        <span className="excel-preview-file-name">📄 {fileName}</span>
        <div className="excel-preview-actions">
          {hasViewer && hasFallbackContent && (
            <button
              type="button"
              className="excel-preview-toggle"
              onClick={() => setShowFallback((prev) => !prev)}
            >
              {toggleLabel}
            </button>
          )}

          {downloadUrl && (
            <a
              className="excel-preview-open-btn"
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={16} />
              Yeni Sekmede Aç
            </a>
          )}
        </div>
      </div>

      <div className="excel-render-area">
        {shouldRenderFallback ? (
          htmlDocument ? (
            <iframe
              className="excel-iframe"
              title={`Excel HTML önizleme - ${fileName}`}
              srcDoc={htmlDocument}
            />
          ) : (
            <div
              className="excel-preview-html"
              dangerouslySetInnerHTML={{ __html: htmlContent || '<p>Önizleme bulunamadı.</p>' }}
            />
          )
        ) : hasViewer ? (
          <iframe
            className="excel-iframe"
            title={`Excel önizleme - ${fileName}`}
            src={viewerUrl}
            loading="lazy"
            allowFullScreen={false}
            onError={() => setShowFallback(true)}
          />
        ) : (
          <div className="excel-preview-empty">
            <p>Önizleme verisi bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelPreview;
