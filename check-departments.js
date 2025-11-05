import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAF7BiqKgGYAzPvZY_9fgRjLnVAXMOONcM",
  authDomain: "ecocell-5cf22.firebaseapp.com",
  projectId: "ecocell-5cf22",
  storageBucket: "ecocell-5cf22.firebasestorage.app",
  messagingSenderId: "664457997260",
  appId: "1:664457997260:web:84f70cf4a9fd6adeb1e6f0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkDepartments() {
  try {
    const docRef = doc(db, 'meta', 'departments');
    const snapshot = await getDoc(docRef);
    
    if (snapshot.exists()) {
      const data = snapshot.data();
      console.log('\n=== Firebase Departments Dokümani ===');
      console.log(JSON.stringify(data, null, 2));
      console.log('\n=== List Array ===');
      console.log(data.list);
    } else {
      console.log('\n❌ Departments dokümani bulunamadi!');
    }
  } catch (error) {
    console.error('Hata:', error);
  }
  process.exit(0);
}

checkDepartments();
