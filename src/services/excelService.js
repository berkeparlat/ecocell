import { ref, uploadBytes, getDownloadURL, listAll, deleteObject, getMetadata, getBytes } from 'firebase/storage';
import { storage } from '../config/firebase';
import * as XLSX from 'xlsx';

// Excel dosyası yükle
export const uploadExcelFile = async (file, type) => {
  try {
    if (!file) {
      throw new Error('Dosya seçilmedi');
    }

    // Dosya tipini kontrol et
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!validTypes.includes(file.type)) {
      throw new Error('Geçerli bir Excel dosyası seçin (.xlsx, .xls)');
    }

    // Dosya yolu belirleme (type: 'stock' veya 'sales')
    const timestamp = new Date().getTime();
    const fileName = `${type}_${timestamp}.xlsx`;
    const storageRef = ref(storage, `excel/${type}/${fileName}`);

    // Dosyayı yükle
    await uploadBytes(storageRef, file);

    // İndirme URL'sini al
    const downloadURL = await getDownloadURL(storageRef);

    return {
      success: true,
      url: downloadURL,
      fileName: fileName,
      uploadDate: new Date()
    };
  } catch (error) {
    console.error('Excel yükleme hatası:', error);
    throw error;
  }
};

// En son yüklenen Excel dosyasını getir
export const getLatestExcelFile = async (type) => {
  try {
    console.log(`📂 excelService: ${type} klasörü kontrol ediliyor...`);
    const listRef = ref(storage, `excel/${type}`);
    const fileList = await listAll(listRef);

    console.log(`📋 excelService: Bulunan dosya sayısı: ${fileList.items.length}`);

    if (fileList.items.length === 0) {
      console.warn(`⚠️ excelService: ${type} klasöründe dosya yok!`);
      return null;
    }

    // En son dosyayı bul
    const filesWithMetadata = await Promise.all(
      fileList.items.map(async (item) => {
        const metadata = await getMetadata(item);
        const url = await getDownloadURL(item);
        return {
          name: item.name,
          url: url,
          uploadDate: metadata.timeCreated,
          size: metadata.size,
          ref: item
        };
      })
    );

    // Tarihe göre sırala ve en sonuncuyu al
    filesWithMetadata.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    console.log('✅ excelService: En son dosya:', filesWithMetadata[0]?.name);
    return filesWithMetadata[0];
  } catch (error) {
    console.error('❌ excelService: Excel dosyası getirme hatası:', error);
    console.error('Hata kodu:', error.code);
    console.error('Hata mesajı:', error.message);
    throw error;
  }
};

// Excel dosyasını oku ve JSON'a çevir
export const parseExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // İlk sheet'i al
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // JSON'a çevir
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        resolve({
          sheetName: firstSheetName,
          data: jsonData,
          allSheets: workbook.SheetNames
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

// Storage referansından Excel dosyasını indir ve parse et (CORS bypass)
export const fetchAndParseExcelFromRef = async (storageRef) => {
  try {
    console.log('🔥 excelService: Excel dosyası indiriliyor...');
    console.log('📂 Dosya yolu:', storageRef.fullPath);
    
    // Download URL al
    const downloadURL = await getDownloadURL(storageRef);
    console.log('🔗 Firebase URL alındı');
    
    // Vercel serverless function proxy kullan
    const proxyURL = `/api/excel-proxy?url=${encodeURIComponent(downloadURL)}`;
    console.log('🌐 Vercel proxy ile indiriliyor...');
    
    const response = await fetch(proxyURL);
    
    if (!response.ok) {
      throw new Error(`Proxy error! status: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    console.log('📥 Bytes alındı, boyut:', arrayBuffer.byteLength, 'bytes');
    
    // ArrayBuffer'ı doğrudan XLSX'e ver
    console.log('🔄 excelService: Excel parse ediliyor...');
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // İlk sheet'i al
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // JSON'a çevir
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log('✅ excelService: Parse tamamlandı!');
    return {
      sheetName: firstSheetName,
      data: jsonData,
      allSheets: workbook.SheetNames
    };
  } catch (error) {
    console.error('❌ excelService: Excel indirme hatası:', error);
    console.error('Hata mesajı:', error.message);
    throw error;
  }
};

// URL'den Excel dosyasını indir ve parse et (DEPRECATED - CORS sorunu var)
export const fetchAndParseExcel = async (url) => {
  try {
    console.log('🌐 excelService: Excel dosyası indiriliyor:', url);
    
    // CORS bypass için XMLHttpRequest kullan
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    
    const blob = await new Promise((resolve, reject) => {
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(xhr.response);
        } else {
          reject(new Error(`HTTP error! status: ${xhr.status}`));
        }
      };
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.open('GET', url);
      xhr.send();
    });
    
    console.log('📥 excelService: Response alındı, blob oluşturuluyor...');
    console.log('📄 excelService: Blob boyutu:', blob.size, 'bytes');
    
    console.log('🔄 excelService: Excel parse ediliyor...');
    const result = await parseExcelFile(blob);
    console.log('✅ excelService: Parse tamamlandı!');
    return result;
  } catch (error) {
    console.error('❌ excelService: Excel parse hatası:', error);
    throw error;
  }
};

// Excel dosyasını sil
export const deleteExcelFile = async (fileRef) => {
  try {
    await deleteObject(fileRef);
    return { success: true };
  } catch (error) {
    console.error('Excel silme hatası:', error);
    throw error;
  }
};

// Tüm Excel dosyalarını listele
export const listAllExcelFiles = async (type) => {
  try {
    const listRef = ref(storage, `excel/${type}`);
    const fileList = await listAll(listRef);

    const filesWithMetadata = await Promise.all(
      fileList.items.map(async (item) => {
        const metadata = await getMetadata(item);
        const url = await getDownloadURL(item);
        return {
          name: item.name,
          url: url,
          uploadDate: metadata.timeCreated,
          size: metadata.size,
          ref: item
        };
      })
    );

    // Tarihe göre sırala (yeniden eskiye)
    filesWithMetadata.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    return filesWithMetadata;
  } catch (error) {
    console.error('Excel listesi getirme hatası:', error);
    throw error;
  }
};
