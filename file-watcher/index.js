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
  // Türkiye saatine çevir (UTC+3)
  const turkeyTime = new Date(now.getTime() + (3 * 60 * 60 * 1000));
  const timestamp = turkeyTime.toLocaleString('tr-TR', {
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

// Watcher'ı başlat
function startWatcher() {
  if (watcher) {
    watcher.close();
  }

  watcher = chokidar.watch(watchFiles, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100
    },
    usePolling: false, // Ağ dosyaları için gerekirse true yapılabilir
    interval: 1000
  });

  // Olayları dinle
  watcher
    .on('change', handleFileChange)
    .on('error', (error) => {
      log(`İzleyici hatası: ${error.message}`);
      
      // Ağ hatası varsa watcher'ı yeniden başlat
      if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
        if (!isRestarting) {
          isRestarting = true;
          log('⚠️  Ağ bağlantısı hatası - 10 saniye sonra yeniden başlatılıyor...');
          
          setTimeout(() => {
            log('🔄 Watcher yeniden başlatılıyor...');
            startWatcher();
            isRestarting = false;
            log('✓ Watcher yeniden başlatıldı');
          }, 10000);
        }
      }
    })
    .on('ready', () => log('✓ Dosya izleyici hazır ve çalışıyor...'));
}

// İlk başlatma
startWatcher();

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
  
  if (watcher) {
    watcher.close();
  }
  
  log('✓ İzleyici başarıyla durduruldu');
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Beklenmeyen hataları yakala
process.on('uncaughtException', (error) => {
  log(`❌ Beklenmeyen hata: ${error.message}`);
  console.error(error);
  log('⚠️  İzleyici devam ediyor...');
});

process.on('unhandledRejection', (reason, promise) => {
  log(`❌ İşlenmeyen promise reddi: ${reason}`);
  console.error(reason);
  log('⚠️  İzleyici devam ediyor...');
});
