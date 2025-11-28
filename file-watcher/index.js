import chokidar from 'chokidar';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Firebase başlat
const serviceAccount = JSON.parse(
  fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const bucketName = process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.firebasestorage.app`;
const bucket = admin.storage().bucket(bucketName);

// Log klasörü
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Log fonksiyonu (emoji yok, sade)
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
  const logFilePath = process.env.LOG_FILE_PATH || './logs/watcher.log';
  fs.appendFileSync(logFilePath, logMessage);
}

// Firebase'e dosya yükle
async function uploadToFirebase(filePath, fileType, retryCount = 0) {
  const maxRetries = 3;
  
  try {
    if (!fs.existsSync(filePath)) {
      if (retryCount < maxRetries) {
        log(`Dosya bulunamadi, tekrar deneniyor... (${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return await uploadToFirebase(filePath, fileType, retryCount + 1);
      } else {
        log(`HATA: Dosya bulunamadi: ${path.basename(filePath)}`);
        return;
      }
    }

    const fileName = `${fileType}.xlsx`;
    const destination = `excel/${fileType}/${fileName}`;

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

    log(`OK: ${fileName} yuklendi`);
  } catch (error) {
    if ((error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') && retryCount < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      return await uploadToFirebase(filePath, fileType, retryCount + 1);
    }
    log(`HATA: ${path.basename(filePath)} yuklenemedi`);
  }
}

// Dosya tipi belirleme
const filePathMap = {
  STOCK_FILE_PATH: 'stock',
  DCS_BUHAR_FILE_PATH: 'dcs-buhar',
  DCS_A012_FILE_PATH: 'dcs-a012',
  DCS_A021_FILE_PATH: 'dcs-a021',
  DCS_B012_FILE_PATH: 'dcs-b012',
  DCS_B021_FILE_PATH: 'dcs-b021',
  ELECTRIC_FILE_PATH: 'electric',
  DOWNTIME_FILE_PATH: 'downtime',
  SALES_FILE_PATH: 'sales',
  SHIPPING_FILE_PATH: 'shipping',
  ELECTRICAL_MAINTENANCE_FILE_PATH: 'electrical-maintenance',
  MECHANICAL_MAINTENANCE_FILE_PATH: 'mechanical-maintenance',
  ELECTRICAL_DOWNTIME_FILE_PATH: 'electrical-downtime',
  MECHANICAL_DOWNTIME_FILE_PATH: 'mechanical-downtime'
};

// Dosya yolu -> tip eşleştirmesi oluştur
const pathToType = {};
for (const [envKey, fileType] of Object.entries(filePathMap)) {
  const filePath = process.env[envKey];
  if (filePath) {
    pathToType[filePath] = fileType;
  }
}

// İzlenecek dosyalar
const watchFiles = Object.keys(pathToType);

if (watchFiles.length === 0) {
  log('HATA: Izlenecek dosya bulunamadi! .env dosyasini kontrol edin.');
  process.exit(1);
}

// Debounce için
const lastProcessedTimes = new Map();
const processingFiles = new Set();

// Dosya değişikliğini işle
async function handleFileChange(filePath) {
  if (processingFiles.has(filePath)) return;
  
  const lastProcessed = lastProcessedTimes.get(filePath) || 0;
  if (Date.now() - lastProcessed < 5000) return;
  
  const fileType = pathToType[filePath];
  if (!fileType) return;
  
  processingFiles.add(filePath);
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  await uploadToFirebase(filePath, fileType);
  
  lastProcessedTimes.set(filePath, Date.now());
  processingFiles.delete(filePath);
}

// Manuel dosya kontrolü
const lastModifiedTimes = new Map();

async function checkFileModifications() {
  for (const filePath of watchFiles) {
    try {
      const stats = fs.statSync(filePath);
      const currentMtime = stats.mtime.getTime();
      const lastMtime = lastModifiedTimes.get(filePath);
      
      if (lastMtime && currentMtime > lastMtime) {
        await handleFileChange(filePath);
      }
      
      lastModifiedTimes.set(filePath, currentMtime);
    } catch (error) {
      // Dosya erişim hatası
    }
  }
}

// Watcher değişkenleri
let watcher = null;
let manualCheckInterval = null;
let healthCheckInterval = null;
let isRestarting = false;

// Watcher başlat
function startWatcher() {
  if (watcher) watcher.close();
  if (manualCheckInterval) clearInterval(manualCheckInterval);

  // İlk dosya zamanlarını kaydet
  watchFiles.forEach(filePath => {
    try {
      const stats = fs.statSync(filePath);
      lastModifiedTimes.set(filePath, stats.mtime.getTime());
    } catch (error) {}
  });

  watcher = chokidar.watch(watchFiles, {
    persistent: true,
    ignoreInitial: true,
    usePolling: true,
    interval: 5000,
    binaryInterval: 10000,
    alwaysStat: true
  });
  
  manualCheckInterval = setInterval(checkFileModifications, 10000);

  watcher
    .on('change', handleFileChange)
    .on('error', (error) => {
      if (['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'UNKNOWN', 'ENOENT'].includes(error.code)) {
        if (!isRestarting) {
          isRestarting = true;
          log('Ag hatasi - 30 saniye sonra yeniden baslatiliyor...');
          setTimeout(() => {
            startWatcher();
            isRestarting = false;
          }, 30000);
        }
      }
    })
    .on('ready', () => log('Watcher hazir'));
}

// Ağ kontrolü
async function waitForNetwork() {
  log('Ag baglantisi kontrol ediliyor...');
  
  for (let i = 0; i < 6; i++) {
    try {
      if (watchFiles[0] && fs.existsSync(watchFiles[0])) {
        log('Ag baglantisi hazir');
        return true;
      }
    } catch (error) {}
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  log('Ag hazir degil ama baslatiliyor...');
  return false;
}

// Health check
let lastHealthCheck = Date.now();

function healthCheck() {
  const elapsed = Math.floor((Date.now() - lastHealthCheck) / 1000);
  log(`Health check - Calisma suresi: ${elapsed} saniye`);
  lastHealthCheck = Date.now();
  
  try {
    if (watchFiles[0]) {
      fs.accessSync(watchFiles[0], fs.constants.R_OK);
      log('Ag baglantisi aktif');
    }
  } catch (error) {
    log(`Ag baglantisi sorunu: ${error.message}`);
  }
}

// Firebase trigger listener
const db = admin.firestore();
const triggerRef = db.collection('meta').doc('fileWatcherTrigger');

async function manualScan() {
  log('Manuel tarama basladi...');
  for (const filePath of watchFiles) {
    await handleFileChange(filePath);
  }
  log('Manuel tarama tamamlandi');
}

triggerRef.onSnapshot(async (snapshot) => {
  if (!snapshot.exists) return;
  
  const data = snapshot.data();
  if (data.trigger === true) {
    log('Firebase trigger algilandi');
    await manualScan();
    await triggerRef.update({ trigger: false, lastTriggered: admin.firestore.FieldValue.serverTimestamp() });
  }
});

// Başlat
(async () => {
  log('========================================');
  log('File Watcher baslatiliyor...');
  await waitForNetwork();
  startWatcher();
  healthCheckInterval = setInterval(healthCheck, 5 * 60 * 1000);
  log('Hazir - ' + watchFiles.length + ' dosya izleniyor');
})();

// Graceful shutdown
function shutdown(signal) {
  log(`${signal} - Durduruluyor...`);
  if (healthCheckInterval) clearInterval(healthCheckInterval);
  if (manualCheckInterval) clearInterval(manualCheckInterval);
  if (watcher) watcher.close();
  log('Durduruldu');
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('uncaughtException', () => {});
process.on('unhandledRejection', () => {});
