import { useEffect, useRef } from 'react';

/**
 * Tarayıcı sekmesinde bildirim animasyonu
 * Okunmamış bildirim, mesaj veya duyuru varsa sekme başlığı yanıp söner
 */
export const useTabNotification = (unreadCount, message = 'Yeni bildirim!') => {
  const intervalRef = useRef(null);
  const originalTitleRef = useRef(document.title);

  useEffect(() => {
    // Orijinal başlığı kaydet
    if (!originalTitleRef.current) {
      originalTitleRef.current = document.title;
    }

    // Okunmamış varsa animasyonu başlat
    if (unreadCount > 0) {
      let isOriginal = true;

      intervalRef.current = setInterval(() => {
        if (isOriginal) {
          document.title = `(${unreadCount}) ${message}`;
        } else {
          document.title = originalTitleRef.current;
        }
        isOriginal = !isOriginal;
      }, 1500); // 1.5 saniyede bir değiş
    } else {
      // Okunmamış yoksa orijinal başlığa dön
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      document.title = originalTitleRef.current;
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.title = originalTitleRef.current;
    };
  }, [unreadCount, message]);
};
