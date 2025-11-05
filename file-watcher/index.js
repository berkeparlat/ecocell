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
async function uploadToFirebase(filePath, fileType) {
  try {
    log(`Dosya yükleniyor: ${filePath} (Tip: ${fileType})`);
    
    // Dosya var mı kontrol et
    if (!fs.existsSync(filePath)) {
      log(`HATA: Dosya bulunamadı: ${filePath}`);
      return;
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
    console.error(error);
  }
}

// Dosya değişikliğini işle
async function handleFileChange(filePath) {
  log(`Değişiklik algılandı: ${filePath}`);
  
  // Dosya tipini belirle
  const stockPath = process.env.STOCK_FILE_PATH;
  const salesPath = process.env.SALES_FILE_PATH;
  const shippingPath = process.env.SHIPPING_FILE_PATH;
  
  let fileType = 'unknown';
  
  if (filePath === stockPath) {
    fileType = 'stock';
  } else if (filePath === salesPath) {
    fileType = 'sales';
  } else if (filePath === shippingPath) {
    fileType = 'shipping';
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

// İzlenecek dosyaları al
const watchFiles = [
  process.env.STOCK_FILE_PATH,
  process.env.SALES_FILE_PATH,
  process.env.SHIPPING_FILE_PATH
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

// Dosya izleyiciyi başlat
const watcher = chokidar.watch(watchFiles, {
  persistent: true,
  ignoreInitial: true, // İlk taramada değişiklik olarak algılama
  awaitWriteFinish: {
    stabilityThreshold: 2000, // 2 saniye boyunca değişiklik yoksa dosya hazır
    pollInterval: 100
  }
});

// Olayları dinle
watcher
  .on('change', handleFileChange)
  .on('error', error => log(`İzleyici hatası: ${error.message}`))
  .on('ready', () => log('✓ Dosya izleyici hazır ve çalışıyor...'));

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
process.on('SIGINT', () => {
  log('İzleyici durduruluyor...');
  watcher.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('İzleyici durduruluyor...');
  watcher.close();
  process.exit(0);
});
