import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// iOS Safari için error boundary
try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (error) {
  console.error('App initialization error:', error);
  // Fallback göster
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: sans-serif;">
      <h2>Yükleme Hatası</h2>
      <p>Sayfa yüklenirken bir hata oluştu.</p>
      <p style="color: #666; font-size: 14px;">${error.message}</p>
      <button onclick="location.reload()" style="padding: 10px 20px; background: #4caf50; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px;">
        Yeniden Dene
      </button>
    </div>
  `;
}
