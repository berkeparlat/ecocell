import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Service Worker'dan gelen bildirim tıklama mesajlarını dinler
 * ve kullanıcıyı ilgili sayfaya yönlendirir
 */
export const useNotificationNavigation = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
        const targetUrl = event.data.url || '/notifications';
        navigate(targetUrl);
      }
    };

    // Service Worker mesajlarını dinle
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleMessage);
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      }
    };
  }, [navigate]);
};
