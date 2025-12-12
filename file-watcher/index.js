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
  const logFilePath = process.env.LOG_FILE_PATH || './logs/watcher.log';
  fs.appendFileSync(logFilePath, logMessage);
}

// Başarısız yüklemeler için retry listesi
const failedUploads = new Map();

// Geçici klasör
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Dosyayı güvenli bir şekilde kopyala (açık dosyalar için)
function safeCopyFile(sourcePath, destPath) {
  try {
    // Dosyayı binary modda oku (açık dosyalar için daha güvenli)
    const buffer = fs.readFileSync(sourcePath);
    fs.writeFileSync(destPath, buffer);
    return true;
  } catch (error) {
    // Eğer normal okuma başarısız olursa, shell komutu ile dene
    try {
      const { execSync } = require('child_process');
      // Windows'ta copy komutu açık dosyaları da kopyalayabilir
      execSync(`copy "${sourcePath}" "${destPath}" /Y`, { stdio: 'ignore', shell: true });
      return true;
    } catch (copyError) {
      return false;
    }
  }
}

// Firebase'e dosya yükle
async function uploadToFirebase(filePath, fileType) {
  try {
    if (!fs.existsSync(filePath)) {
      log(`HATA: Dosya bulunamadi: ${path.basename(filePath)}`);
      return false;
    }

    // Dosyayı geçici klasöre kopyala (açık dosyalar için)
    const tempFilePath = path.join(tempDir, `${fileType}.xlsx`);
    if (!safeCopyFile(filePath, tempFilePath)) {
      log(`HATA: Dosya kopyalanamadi: ${path.basename(filePath)}`);
      return false;
    }

    const fileName = `${fileType}.xlsx`;
    const destination = `excel/${fileType}/${fileName}`;

    await bucket.upload(tempFilePath, {
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

    // Geçici dosyayı temizle
    try { fs.unlinkSync(tempFilePath); } catch (e) {}

    log(`OK: ${fileName} yuklendi`);
    // Başarılı olunca retry listesinden çıkar
    failedUploads.delete(filePath);
    return true;
  } catch (error) {
    log(`HATA: ${path.basename(filePath)} yuklenemedi - ${error.message}`);
    // Geçici dosyayı temizle
    const tempFilePath = path.join(tempDir, `${fileType}.xlsx`);
    try { fs.unlinkSync(tempFilePath); } catch (e) {}
    // Ağ hatası ise retry listesine ekle
    if (error.message.includes('ECONNRESET') || 
        error.message.includes('ETIMEDOUT') || 
        error.message.includes('network') ||
        error.message.includes('socket')) {
      failedUploads.set(filePath, fileType);
    }
    return false;
  }
}

// Başarısız yüklemeleri tekrar dene (5 dakika sonra)
async function retryFailedUploads() {
  if (failedUploads.size === 0) return;
  
  log(`Basarisiz yuklemeler tekrar deneniyor (${failedUploads.size} dosya)...`);
  
  for (const [filePath, fileType] of failedUploads) {
    await uploadToFirebase(filePath, fileType);
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
  MECHANICAL_DOWNTIME_FILE_PATH: 'mechanical-downtime',
  OPERATIONS_DOWNTIME_FILE_PATH: 'operations-downtime'
};

// Dosya yolu -> tip eşleştirmesi oluştur
const pathToType = {};
for (const [envKey, fileType] of Object.entries(filePathMap)) {
  const filePath = process.env[envKey];
  if (filePath) {
    pathToType[filePath] = fileType;
  }
}

const watchFiles = Object.keys(pathToType);

if (watchFiles.length === 0) {
  log('HATA: Izlenecek dosya bulunamadi! .env dosyasini kontrol edin.');
  process.exit(1);
}

// Son değişiklik zamanlarını takip et
const lastModifiedTimes = new Map();

// İlk çalışmada tüm dosyaların zamanlarını kaydet
function initializeFileTimes() {
  for (const filePath of watchFiles) {
    try {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        lastModifiedTimes.set(filePath, stats.mtime.getTime());
      }
    } catch (error) {
      log(`Dosya okunamadi: ${path.basename(filePath)}`);
    }
  }
}

// Değişen dosyaları kontrol et ve yükle
async function checkAndUploadChangedFiles() {
  const now = new Date();
  const hour = now.getHours();
  
  // Sadece 08:00 - 18:00 arası çalış
  if (hour < 8 || hour >= 18) {
    log(`Calisma saatleri disinda (saat: ${hour})`);
    return;
  }
  
  log('Dosya kontrolu basladi...');
  let changedCount = 0;
  
  for (const filePath of watchFiles) {
    try {
      if (!fs.existsSync(filePath)) continue;
      
      const stats = fs.statSync(filePath);
      const currentMtime = stats.mtime.getTime();
      const lastMtime = lastModifiedTimes.get(filePath);
      
      // Dosya değişmişse yükle
      if (!lastMtime || currentMtime > lastMtime) {
        const fileType = pathToType[filePath];
        const success = await uploadToFirebase(filePath, fileType);
        if (success) {
          lastModifiedTimes.set(filePath, currentMtime);
          changedCount++;
        }
      }
    } catch (error) {
      log(`Dosya kontrol hatasi: ${path.basename(filePath)}`);
    }
  }
  
  if (changedCount === 0) {
    log('Degisiklik yok');
  } else {
    log(`${changedCount} dosya guncellendi`);
  }
  
  // Başarısız yüklemeler varsa 5 dakika sonra tekrar dene
  if (failedUploads.size > 0) {
    log(`${failedUploads.size} basarisiz yukleme var, 5 dakika sonra tekrar denenecek`);
    setTimeout(retryFailedUploads, 5 * 60 * 1000);
  }
}

// Bir sonraki saat başına kadar bekle
function getMillisecondsUntilNextHour() {
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(now.getHours() + 1, 0, 0, 0);
  return nextHour.getTime() - now.getTime();
}

// Firebase trigger listener (manuel tarama için)
const db = admin.firestore();
const triggerRef = db.collection('meta').doc('fileWatcherTrigger');

async function manualScan() {
  log('Manuel tarama basladi...');
  let uploadCount = 0;
  
  for (const filePath of watchFiles) {
    try {
      if (!fs.existsSync(filePath)) continue;
      
      const stats = fs.statSync(filePath);
      const currentMtime = stats.mtime.getTime();
      const lastMtime = lastModifiedTimes.get(filePath);
      
      // Sadece değişen dosyaları yükle
      if (!lastMtime || currentMtime > lastMtime) {
        const fileType = pathToType[filePath];
        const success = await uploadToFirebase(filePath, fileType);
        if (success) {
          lastModifiedTimes.set(filePath, currentMtime);
          uploadCount++;
        }
      }
    } catch (error) {}
  }
  
  if (uploadCount === 0) {
    log('Manuel tarama tamamlandi - Degisiklik yok');
  } else {
    log(`Manuel tarama tamamlandi - ${uploadCount} dosya yuklendi`);
  }
}

triggerRef.onSnapshot(async (snapshot) => {
  if (!snapshot.exists) return;
  
  const data = snapshot.data();
  if (data.trigger === true) {
    log('Firebase trigger algilandi');
    await manualScan();
    await triggerRef.update({ 
      trigger: false, 
      lastTriggered: admin.firestore.FieldValue.serverTimestamp() 
    });
  }
});

// Ana döngü
let currentTimeout = null;

function scheduleNextCheck() {
  const msUntilNextHour = getMillisecondsUntilNextHour();
  const minutesUntil = Math.round(msUntilNextHour / 60000);
  
  log(`Sonraki kontrol: ${minutesUntil} dakika sonra`);
  
  currentTimeout = setTimeout(async () => {
    await checkAndUploadChangedFiles();
    scheduleNextCheck();
  }, msUntilNextHour);
}

// Başlat
(async () => {
  log('========================================');
  log('File Watcher baslatiliyor...');
  log(`Calisma saatleri: 08:00 - 18:00`);
  log(`Kontrol sikligi: Her saat basi`);
  log(`Izlenen dosya sayisi: ${watchFiles.length}`);
  
  // İlk dosya zamanlarını kaydet
  initializeFileTimes();
  
  // İlk kontrolü hemen yap
  await checkAndUploadChangedFiles();
  
  // Sonraki kontrolleri planla
  scheduleNextCheck();
  
  log('Hazir - Bekleniyor...');
})();

// Graceful shutdown
function shutdown(signal) {
  log(`${signal} - Durduruluyor...`);
  if (currentTimeout) clearTimeout(currentTimeout);
  log('Durduruldu');
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('uncaughtException', (error) => {
  log(`Beklenmeyen hata: ${error.message}`);
});
process.on('unhandledRejection', (reason) => {
  log(`Islenmemis promise hatasi: ${reason}`);
});
