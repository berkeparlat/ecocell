import { useEffect, useRef } from 'react';

// Favicon ile badge oluştur
const createBadgeFavicon = (count) => {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');

  // Orijinal favicon'u yükle
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = '/logo.png';

  return new Promise((resolve) => {
    img.onload = () => {
      // Orijinal ikonu çiz
      ctx.drawImage(img, 0, 0, 32, 32);

      if (count > 0) {
        // Kırmızı daire badge
        ctx.beginPath();
        ctx.arc(24, 8, 10, 0, 2 * Math.PI);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Sayı
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(count > 9 ? '9+' : count.toString(), 24, 8);
      }

      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => {
      // Fallback - sadece badge
      if (count > 0) {
        ctx.beginPath();
        ctx.arc(16, 16, 14, 0, 2 * Math.PI);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(count > 9 ? '9+' : count.toString(), 16, 16);
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
    link.href = '/logo.png';
  }
};

// PWA görev çubuğu badge'i güncelle (Windows/macOS/Android)
const updateAppBadge = async (count) => {
  try {
    if ('setAppBadge' in navigator) {
      if (count > 0) {
        await navigator.setAppBadge(count);
      } else {
        await navigator.clearAppBadge();
      }
    }
  } catch (error) {
    // Badge API desteklenmiyor veya izin yok
    console.log('Badge API kullanılamıyor:', error);
  }
};

/**
 * Tarayıcı sekmesinde bildirim gösterimi
 * - Başlıkta bildirim sayısı
 * - Favicon'da kırmızı badge
 * - PWA görev çubuğunda badge (Windows/macOS/Android)
 */
export const useTabNotification = (unreadCount) => {
  const originalTitleRef = useRef('Ecocell Portal');
  const prevCountRef = useRef(0);

  useEffect(() => {
    if (unreadCount > 0) {
      // Kısa format - PWA'da başlık alanı dar
      document.title = `(${unreadCount}) Bildirim`;
      
      // Favicon'a badge ekle
      updateFavicon(unreadCount);
      
      // PWA görev çubuğu badge'i
      updateAppBadge(unreadCount);

      // Yeni bildirim geldiyse ve pencere focus değilse, görev çubuğunda dikkat çek
      if (unreadCount > prevCountRef.current && !document.hasFocus()) {
        // Görev çubuğunda yanıp sönme
        if ('Notification' in window && Notification.permission === 'granted') {
          // PWA'da görev çubuğu flash efekti
          window.focus?.();
        }
      }
    } else {
      // Bildirim yoksa orijinal başlık ve favicon
      document.title = originalTitleRef.current;
      updateFavicon(0);
      updateAppBadge(0);
    }

    prevCountRef.current = unreadCount;

    // Cleanup
    return () => {
      document.title = originalTitleRef.current;
    };
  }, [unreadCount]);
};
