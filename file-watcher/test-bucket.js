import admin from 'firebase-admin';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Firebase Admin SDK'yı başlat
const serviceAccount = JSON.parse(
  fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function testBucket() {
  try {
    // Farklı bucket formatlarını test et
    const bucketsToTest = [
      `${serviceAccount.project_id}.appspot.com`,
      `${serviceAccount.project_id}.firebasestorage.app`
    ];

    console.log('Firebase Storage Bucket Test\n');
    console.log('Proje ID:', serviceAccount.project_id);
    console.log('\nTest edilen bucket\'lar:\n');

    for (const bucketName of bucketsToTest) {
      try {
        console.log(`\n🔍 Test: ${bucketName}`);
        const bucket = admin.storage().bucket(bucketName);
        
        // Bucket'ın var olup olmadığını kontrol et
        const [exists] = await bucket.exists();
        
        if (exists) {
          console.log(`✅ BAŞARILI: ${bucketName} mevcut!`);
          
          // Bucket metadata'sını al
          const [metadata] = await bucket.getMetadata();
          console.log(`   Bucket ID: ${metadata.id}`);
          console.log(`   Konum: ${metadata.location}`);
          
          return bucketName;
        } else {
          console.log(`❌ BULUNAMADI: ${bucketName}`);
        }
      } catch (error) {
        console.log(`❌ HATA: ${bucketName} - ${error.message}`);
      }
    }

    console.log('\n⚠️  Hiçbir bucket bulunamadı!');
    console.log('\nFirebase Console\'dan Storage\'ı etkinleştirmeniz gerekiyor:');
    console.log('https://console.firebase.google.com/project/ecocell-5cf22/storage');
    
  } catch (error) {
    console.error('❌ Genel hata:', error.message);
  } finally {
    process.exit(0);
  }
}

testBucket();
