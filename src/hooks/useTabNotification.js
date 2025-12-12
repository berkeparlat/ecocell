import { useEffect, useRef } from 'react';

// Favicon ile badge oluştur - sağ alt köşede sadece sayı
const createBadgeFavicon = (count) => {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');

  // Orijinal favicon'u yükle
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = '/assets/app.png';

  return new Promise((resolve) => {
    img.onload = () => {
      // Orijinal ikonu çiz
      ctx.drawImage(img, 0, 0, 32, 32);

      if (count > 0) {
        const text = count > 9 ? '9+' : count.toString();
        const x = 26;
        const y = 28;
        
        // Siyah gölge/outline efekti (okunabilirlik için)
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Gölge
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillText(text, x + 1, y + 1);
        
        // Beyaz sayı
        ctx.fillStyle = '#ffffff';
        ctx.fillText(text, x, y);
      }

      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => {
      // Fallback
      if (count > 0) {
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(count > 9 ? '9+' : count.toString(), 26, 28);
      }
      resolve(canvas.toDataURL('image/png'));
    };
  });
};

// Favicon'u güncelle
const updateFavicon = async (count) => {
  let link = document.querySelector("link[rel*='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }

  if (count > 0) {
    const badgeUrl = await createBadgeFavicon(count);
    link.href = badgeUrl;
  } else {
    link.href = '/assets/app.png';
  }
};

// PWA görev çubuğu badge'i güncelle - Kapalı (boş beyaz simge sorunu)
const updateAppBadge = async (count) => {
  // Badge API kullanımı devre dışı
  // Android'de boş beyaz simge gösterme sorununu önler
  return;
};

/**
 * Tarayıcı sekmesinde bildirim gösterimi
 * - Başlıkta bildirim sayısı
 * - Favicon'da kırmızı badge
 * - PWA görev çubuğunda badge (Windows/macOS/Android)
 */
export const useTabNotification = (unreadCount) => {
  const originalTitleRef = useRef('Ecocell Portal');
  const flashIntervalRef = useRef(null);

  useEffect(() => {
    // Önceki interval'i temizle
    if (flashIntervalRef.current) {
      clearInterval(flashIntervalRef.current);
      flashIntervalRef.current = null;
    }

    if (unreadCount > 0) {
      // Favicon'a badge ekle
      updateFavicon(unreadCount);
      
      // PWA görev çubuğu badge'i
      updateAppBadge(unreadCount);

      // Başlık yanıp sönme - "2 Bildirim" ve "Ecocell Portal" arasında
      let isNotification = true;
      const notificationTitle = `${unreadCount} Bildirim`;
      
      // İlk başta bildirim göster
      document.title = notificationTitle;
      
      flashIntervalRef.current = setInterval(() => {
        document.title = isNotification ? originalTitleRef.current : notificationTitle;
        isNotification = !isNotification;
      }, 1500);
    } else {
      // Bildirim yoksa orijinal başlık ve favicon
      document.title = originalTitleRef.current;
      updateFavicon(0);
      updateAppBadge(0);
    }

    // Cleanup
    return () => {
      if (flashIntervalRef.current) {
        clearInterval(flashIntervalRef.current);
        flashIntervalRef.current = null;
      }
    };
  }, [unreadCount]);
};
