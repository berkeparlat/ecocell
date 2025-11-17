import chokidar from 'chokidar';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// ES Module için __dirname alternatifi
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ortam değişkenlerini yükle
dotenv.config();

// Firebase Admin SDK'yı başlat
const serviceAccount = JSON.parse(
  fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Bucket'ı al (yeni Firebase Storage formatı: .firebasestorage.app)
const bucketName = process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.firebasestorage.app`;
log(`Kullanılan bucket: ${bucketName}`);
const bucket = admin.storage().bucket(bucketName);

// Log klasörünü oluştur
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Log fonksiyonu
function log(message) {
  const now = new Date();
  const timestamp = now.toLocaleString('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage.trim());
  
  // Log dosyasına yaz
  const logFilePath = process.env.LOG_FILE_PATH || './logs/watcher.log';
  fs.appendFileSync(logFilePath, logMessage);
}

// Eski dosyaları temizle (sadece en yeni olanı tut)
async function cleanupOldFiles(fileType) {
  try {
    const folderPath = `excel/${fileType}/`;
    const [files] = await bucket.getFiles({ prefix: folderPath });
    
    if (files.length <= 1) {
      return; // Sadece 1 veya daha az dosya varsa temizleme yapma
    }
    
    // Tarih bazlı sırala (en yeni en üstte)
    files.sort((a, b) => {
      const aTime = new Date(a.metadata.timeCreated).getTime();
      const bTime = new Date(b.metadata.timeCreated).getTime();
      return bTime - aTime;
    });
    
    // En yeni olanı hariç diğerlerini sil
    const filesToDelete = files.slice(1);
    
    for (const file of filesToDelete) {
      await file.delete();
      log(`🗑️  Eski dosya silindi: ${file.name}`);
    }
    
    if (filesToDelete.length > 0) {
      log(`✓ ${filesToDelete.length} eski dosya temizlendi`);
    }
  } catch (error) {
    log(`⚠️  Eski dosya temizleme hatası: ${error.message}`);
  }
}

// Firebase'e dosya yükleme fonksiyonu
async function uploadToFirebase(filePath, fileType, retryCount = 0) {
  const maxRetries = 3;
  
  try {
    log(`Dosya yükleniyor: ${filePath} (Tip: ${fileType})`);
    
    // Dosya var mı kontrol et
    if (!fs.existsSync(filePath)) {
      // Dosya geçici olarak kilitlenmiş olabilir, tekrar dene
      if (retryCount < maxRetries) {
        log(`Dosya bulunamadı, ${2} saniye sonra tekrar denenecek... (Deneme ${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return await uploadToFirebase(filePath, fileType, retryCount + 1);
      } else {
        log(`HATA: Dosya ${maxRetries} denemeden sonra hala bulunamadı: ${filePath}`);
        return;
      }
    }

    // Sabit dosya adı kullan (timestamp yok - eskisinin üzerine yaz)
    const fileName = `${fileType}.xlsx`;
    const destination = `excel/${fileType}/${fileName}`;

    // Dosyayı Firebase Storage'a yükle (eskisinin üzerine yaz)
    await bucket.upload(filePath, {
      destination: destination,
      metadata: {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        metadata: {
          uploadedAt: new Date().toISOString(),
          originalName: path.basename(filePath),
          autoUploaded: 'true'
        }
      }
    });

    log(`✓ Başarılı: ${fileName} Firebase'e yüklendi (güncellendi)`);
    
    // Eski dosyaları temizle (async, hata olsa bile devam et)
    cleanupOldFiles(fileType).catch(err => {
      log(`⚠️  Temizleme sırasında hata (devam ediliyor): ${err.message}`);
    });
  } catch (error) {
    log(`✗ HATA: ${error.message}`);
    
    // Ağ hatası varsa tekrar dene
    if ((error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') && retryCount < maxRetries) {
      log(`Ağ hatası, ${5} saniye sonra tekrar denenecek... (Deneme ${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return await uploadToFirebase(filePath, fileType, retryCount + 1);
    }
    
    console.error(error);
  }
}

// Dosya değişikliğini işle
async function handleFileChange(filePath) {
  log(`Değişiklik algılandı: ${filePath}`);
  
  const stockPath = process.env.STOCK_FILE_PATH;
  const dcsAPath = process.env.DCS_A_FILE_PATH;
  const dcsBPath = process.env.DCS_B_FILE_PATH;
  const dcsBuharPath = process.env.DCS_BUHAR_FILE_PATH;
  const electricPath = process.env.ELECTRIC_FILE_PATH;
  const downtimePath = process.env.DOWNTIME_FILE_PATH;
  const salesPath = process.env.SALES_FILE_PATH;
  const shippingPath = process.env.SHIPPING_FILE_PATH;
  const electricalMaintenancePath = process.env.ELECTRICAL_MAINTENANCE_FILE_PATH;
  const mechanicalMaintenancePath = process.env.MECHANICAL_MAINTENANCE_FILE_PATH;
  const electricalDowntimePath = process.env.ELECTRICAL_DOWNTIME_FILE_PATH;
  const mechanicalDowntimePath = process.env.MECHANICAL_DOWNTIME_FILE_PATH;
  
  let fileType = 'unknown';
  
  if (filePath === stockPath) {
    fileType = 'stock';
  } else if (filePath === dcsAPath) {
    fileType = 'dcs-a';
  } else if (filePath === dcsBPath) {
    fileType = 'dcs-b';
  } else if (filePath === dcsBuharPath) {
    fileType = 'dcs-buhar';
  } else if (filePath === electricPath) {
    fileType = 'electric';
  } else if (filePath === downtimePath) {
    fileType = 'downtime';
  } else if (filePath === salesPath) {
    fileType = 'sales';
  } else if (filePath === shippingPath) {
    fileType = 'shipping';
  } else if (filePath === electricalMaintenancePath) {
    fileType = 'electrical-maintenance';
  } else if (filePath === mechanicalMaintenancePath) {
    fileType = 'mechanical-maintenance';
  } else if (filePath === electricalDowntimePath) {
    fileType = 'electrical-downtime';
  } else if (filePath === mechanicalDowntimePath) {
    fileType = 'mechanical-downtime';
  }
  
  if (fileType === 'unknown') {
    log(`UYARI: Bilinmeyen dosya: ${filePath}`);
    return;
  }
  
  // Kısa bir bekleme süresi (dosya kaydedilirken)
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Firebase'e yükle
  await uploadToFirebase(filePath, fileType);
}

const watchFiles = [
  process.env.STOCK_FILE_PATH,
  process.env.DCS_A_FILE_PATH,
  process.env.DCS_B_FILE_PATH,
  process.env.DCS_BUHAR_FILE_PATH,
  process.env.ELECTRIC_FILE_PATH,
  process.env.DOWNTIME_FILE_PATH,
  process.env.SALES_FILE_PATH,
  process.env.SHIPPING_FILE_PATH,
  process.env.ELECTRICAL_MAINTENANCE_FILE_PATH,
  process.env.MECHANICAL_MAINTENANCE_FILE_PATH,
  process.env.ELECTRICAL_DOWNTIME_FILE_PATH,
  process.env.MECHANICAL_DOWNTIME_FILE_PATH
].filter(Boolean);

if (watchFiles.length === 0) {
  log('HATA: İzlenecek dosya bulunamadı! .env dosyasını kontrol edin.');
  process.exit(1);
}

log('='.repeat(60));
log('Excel Dosya İzleyici Başlatıldı');
log('='.repeat(60));
log(`İzlenen dosyalar:`);
watchFiles.forEach(file => log(`  - ${file}`));
log('='.repeat(60));

// Watcher global değişkeni
let watcher = null;
let isRestarting = false;

// Son değişiklik zamanlarını takip et
const lastModifiedTimes = new Map();
let manualCheckInterval = null;

// Manuel olarak dosya değişikliklerini kontrol et (açık dosyalar için)
async function checkFileModifications() {
  for (const filePath of watchFiles) {
    try {
      const stats = fs.statSync(filePath);
      const currentMtime = stats.mtime.getTime();
      const lastMtime = lastModifiedTimes.get(filePath);
      
      if (lastMtime && currentMtime > lastMtime) {
        log(`📝 Manuel kontrol: Değişiklik tespit edildi - ${path.basename(filePath)}`);
        await handleFileChange(filePath);
      }
      
      lastModifiedTimes.set(filePath, currentMtime);
    } catch (error) {
      // Dosya erişim hatası, devam et
    }
  }
}

// Watcher'ı başlat
function startWatcher() {
  if (watcher) {
    watcher.close();
  }
  
  if (manualCheckInterval) {
    clearInterval(manualCheckInterval);
  }

  // İlk kez dosya zamanlarını kaydet
  watchFiles.forEach(filePath => {
    try {
      const stats = fs.statSync(filePath);
      lastModifiedTimes.set(filePath, stats.mtime.getTime());
    } catch (error) {
      // İlk başlangıçta dosya yoksa sorun değil
    }
  });

  watcher = chokidar.watch(watchFiles, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: false, // Açık dosyalar için kapatıldı
    usePolling: true, // Ağ dosyaları için polling kullan
    interval: 5000, // 5 saniyede bir kontrol et
    binaryInterval: 10000,
    alwaysStat: true // Her zaman stat bilgisi al
  });
  
  // Her 10 saniyede bir manuel kontrol (açık dosyalar için)
  manualCheckInterval = setInterval(checkFileModifications, 10000);
  log('✓ Manuel dosya kontrolü aktif (10 saniye aralıklarla)');

  // Olayları dinle
  watcher
    .on('change', handleFileChange)
    .on('error', (error) => {
      log(`İzleyici hatası: ${error.message}`);
      
      // Ağ hatası varsa watcher'ı yeniden başlat
      if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND' || error.code === 'UNKNOWN' || error.code === 'ENOENT') {
        if (!isRestarting) {
          isRestarting = true;
          log('⚠️  Ağ bağlantısı hatası - 30 saniye sonra yeniden başlatılıyor...');
          
          setTimeout(() => {
            log('🔄 Watcher yeniden başlatılıyor...');
            startWatcher();
            isRestarting = false;
            log('✓ Watcher yeniden başlatıldı');
          }, 30000);
        }
      }
    })
    .on('ready', () => log('✓ Dosya izleyici hazır ve çalışıyor...'));
}

// Ağ bağlantısı hazır olana kadar bekle
async function waitForNetwork() {
  log('⏳ Ağ bağlantısı kontrol ediliyor...');
  
  for (let i = 0; i < 6; i++) {
    try {
      // İlk dosyayı kontrol et
      if (watchFiles[0] && fs.existsSync(watchFiles[0])) {
        log('✓ Ağ bağlantısı hazır');
        return true;
      }
    } catch (error) {
      // Devam et
    }
    log(`Bekleniyor... (${(i + 1) * 5} saniye)`);
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  log('⚠️  Ağ hazır değil ama başlatılıyor...');
  return false;
}

// Health check - her 5 dakikada bir kontrol et
let lastHealthCheck = Date.now();
let healthCheckInterval = null;

function healthCheck() {
  const now = Date.now();
  const elapsed = Math.floor((now - lastHealthCheck) / 1000);
  
  log(`💚 Health check - Çalışma süresi: ${elapsed} saniye`);
  lastHealthCheck = now;
  
  // Watcher hala çalışıyor mu kontrol et
  if (!watcher || !watcher._isReady) {
    log('⚠️  Watcher hazır değil - yeniden başlatılıyor...');
    startWatcher();
  }
  
  // İlk dosyaya erişim kontrolü
  try {
    if (watchFiles[0]) {
      fs.accessSync(watchFiles[0], fs.constants.R_OK);
      log('✓ Ağ bağlantısı aktif');
    }
  } catch (error) {
    log(`⚠️  Ağ bağlantısı sorunu: ${error.message}`);
  }
}

// İlk başlatma - ağ hazır olana kadar bekle
(async () => {
  await waitForNetwork();
  startWatcher();
  
  // 5 dakikada bir health check
  healthCheckInterval = setInterval(healthCheck, 5 * 60 * 1000);
  log('✓ Health check başlatıldı (5 dakika aralıklarla)');
})();

// Manuel tetikleme için Firebase listener
const db = admin.firestore();
const triggerRef = db.collection('meta').doc('fileWatcherTrigger');

// Manuel tarama fonksiyonu
async function manualScan() {
  log('🔄 Manuel tarama başlatıldı...');
  
  for (const filePath of watchFiles) {
    await handleFileChange(filePath);
  }
  
  log('✓ Manuel tarama tamamlandı');
}

// Firebase trigger'ı dinle
triggerRef.onSnapshot(async (snapshot) => {
  if (!snapshot.exists) return;
  
  const data = snapshot.data();
  if (data.trigger === true) {
    log('🔔 Firebase trigger algılandı - Manuel tarama yapılıyor...');
    await manualScan();
    
    // Trigger'ı sıfırla
    await triggerRef.update({ trigger: false, lastTriggered: admin.firestore.FieldValue.serverTimestamp() });
  }
});

log('✓ Firebase trigger listener başlatıldı');

// Graceful shutdown
function shutdown(signal) {
  log(`${signal} sinyali alındı - İzleyici durduruluyor...`);
  
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
  }
  
  if (manualCheckInterval) {
    clearInterval(manualCheckInterval);
  }
  
  if (watcher) {
    watcher.close();
  }
  
  log('✓ İzleyici başarıyla durduruldu');
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Beklenmeyen hataları yakala ve logla, sonra devam et
process.on('uncaughtException', (error) => {
  log(`❌ Beklenmeyen hata: ${error.message}`);
  log(`Stack: ${error.stack}`);
  console.error(error);
  log('⚠️  İzleyici devam ediyor...');
  
  // Kritik hataysa 10 saniye sonra yeniden başlat
  if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
    setTimeout(() => {
      log('🔄 Kritik hata nedeniyle yeniden başlatılıyor...');
      startWatcher();
    }, 10000);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  log(`❌ İşlenmeyen promise reddi: ${reason}`);
  if (reason && reason.stack) {
    log(`Stack: ${reason.stack}`);
  }
  console.error(reason);
  log('⚠️  İzleyici devam ediyor...');
});
