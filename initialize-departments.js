// Firebase'de varsayılan departments oluştur
import admin from 'firebase-admin';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: './file-watcher/.env' });

const serviceAccount = JSON.parse(
  fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const defaultDepartments = [
  'Arge',
  'Genel Müdür',
  'İdari İşler',
  'İnsan Kaynakları',
  'Kalite Kontrol',
  'Muhasebe',
  'Planlama',
  'Satınalma',
  'Satış ve Pazarlama',
  'Teknik',
  'Üretim'
];

async function initializeDepartments() {
  try {
    const departmentsRef = db.collection('meta').doc('departments');
    
    await departmentsRef.set({
      list: defaultDepartments,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Departments başarıyla oluşturuldu:', defaultDepartments);
    console.log(`📊 Toplam ${defaultDepartments.length} birim eklendi`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

initializeDepartments();
