// Firebase'de file-watcher trigger dokümanını oluştur
import admin from 'firebase-admin';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccount = JSON.parse(
  fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createTriggerDocument() {
  try {
    const triggerRef = db.collection('meta').doc('fileWatcherTrigger');
    
    await triggerRef.set({
      trigger: false,
      lastTriggered: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      description: 'Manuel Excel dosya taraması için trigger dokümanı'
    });

    console.log('✅ Trigger dokümanı oluşturuldu: meta/fileWatcherTrigger');
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

createTriggerDocument();
