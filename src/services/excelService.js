import { ref, uploadBytes, getDownloadURL, listAll, deleteObject, getMetadata, getBytes } from 'firebase/storage';
import { storage } from '../config/firebase';
import * as XLSX from 'xlsx/xlsx.mjs';

const sanitizeSheetHtml = (rawHtml) => {
  if (!rawHtml) {
    return {
      cleanedHtml: '',
      htmlDocument: ''
    };
  }

  const styleMatches = rawHtml.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || [];
  const combinedStyles = styleMatches.join('\n');

  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1] : rawHtml;

  const cleanedBody = bodyContent
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<meta[^>]*>/gi, '')
    .replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .trim();

  const resetStyles = `
    <style>
      *, *::before, *::after {
        box-sizing: border-box;
      }
      html, body {
        margin: 0;
        padding: 0;
        min-height: 100%;
        background: #ffffff;
        overflow: auto;
      }
      body {
        padding: 16px;
        width: 100%;
        max-width: 100%;
      }
      table {
        border-collapse: collapse;
        width: 100% !important;
        max-width: 100% !important;
        table-layout: fixed;
        font-size: 12px;
      }
      table td, table th {
        word-wrap: break-word;
        overflow-wrap: break-word;
        white-space: normal;
        padding: 6px 8px;
        border: 1px solid #d0d0d0;
      }
      table th {
        background: #f1f5f9;
        font-weight: 600;
      }
      img {
        max-width: 100%;
        height: auto;
        display: block;
      }
      @media (max-width: 1200px) {
        table {
          font-size: 11px;
        }
        table td, table th {
          padding: 4px 6px;
        }
      }
      @media (max-width: 768px) {
        table {
          font-size: 10px;
        }
        table td, table th {
          padding: 3px 4px;
        }
      }
    </style>
  `;

  const htmlDocument = [
    '<!DOCTYPE html>',
    '<html lang="tr">',
    '<head>',
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    resetStyles,
    combinedStyles,
    '</head>',
    '<body>',
    cleanedBody,
    '<script>window.onload = function() { window.scrollTo(0, 0); };</script>',
    '</body>',
    '</html>'
  ].join('');

  return {
    cleanedHtml: cleanedBody,
    htmlDocument
  };
};

const buildOfficeViewerUrl = (directUrl) => {
  if (!directUrl) {
    return null;
  }

  const appOrigin =
    typeof window !== 'undefined'
      ? window.location.origin
      : import.meta?.env?.VITE_APP_ORIGIN || '';

  if (!appOrigin) {
    return null;
  }

  const proxiedUrl = new URL('/api/excel-proxy', appOrigin);
  proxiedUrl.searchParams.set('url', directUrl);

  const base = 'https://view.officeapps.live.com/op/embed.aspx';
  const params = new URLSearchParams({
    src: proxiedUrl.toString(),
    wdAllowInteractivity: '1',
    wdHideHeaders: '1',
    wdHideSheetTabs: '0',
    wdHideGridlines: '0',
    wdDownloadButton: '0',
    wdDefaultZoom: '100',
    wdFitToPage: '1',
    wdPageView: '1',
    ActiveCell: 'A1'
  });

  return `${base}?${params.toString()}#A1`;
};

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

// En son yüklenen Excel dosyasını getir ve HTML'e çevir (CORS bypass ile)
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
          size: metadata.size
        };
      })
    );

    // Tarihe göre sırala ve en sonuncuyu al
    filesWithMetadata.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    const latestFile = filesWithMetadata[0];
    console.log('✅ excelService: En son dosya:', latestFile?.name);
    
    // Vercel proxy kullanarak Excel'i indir ve HTML'e çevir
    console.log('📥 excelService: Vercel proxy ile indiriliyor...');
    const proxyURL = `/api/excel-proxy?url=${encodeURIComponent(latestFile.url)}`;
    const response = await fetch(proxyURL);
    
    if (!response.ok) {
      throw new Error(`Proxy error! status: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    console.log('📊 excelService: Excel parse ediliyor...');
    
    const workbook = XLSX.read(arrayBuffer, { 
      type: 'array',
      cellStyles: true,
      cellHTML: true
    });
    
    // İlk sheet'i HTML'e çevir
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawHtml = XLSX.utils.sheet_to_html(worksheet, {
      id: 'excel-table',
      editable: false,
      header: '',
      footer: ''
    });
    const { cleanedHtml, htmlDocument } = sanitizeSheetHtml(rawHtml);
    const viewerUrl = buildOfficeViewerUrl(latestFile.url);
    
    console.log('✅ excelService: HTML hazır');
    
    return {
      name: latestFile.name,
      html: cleanedHtml,
      htmlDocument,
      uploadDate: latestFile.uploadDate,
      size: latestFile.size,
      sheets: workbook.SheetNames,
      downloadUrl: latestFile.url,
      viewerUrl,
      sheetName: firstSheetName
    };
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
    
    // ArrayBuffer'ı doğrudan XLSX'e ver - STILLER ile birlikte
    console.log('🔄 excelService: Excel parse ediliyor (stiller dahil)...');
    const workbook = XLSX.read(arrayBuffer, { 
      type: 'array',
      cellStyles: true,
      cellHTML: true,
      cellDates: true
    });
    
    // İlk sheet'i al
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // HTML olarak render et (stiller dahil)
    const rawHtml = XLSX.utils.sheet_to_html(worksheet, {
      id: 'excel-table',
      editable: false,
      header: '',
      footer: ''
    });
    const { cleanedHtml, htmlDocument } = sanitizeSheetHtml(rawHtml);
    
    // JSON data da al (yedek için)
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      raw: false,
      dateNF: 'dd/mm/yyyy'
    });
    
    // Kolon genişlikleri
    const colWidths = worksheet['!cols'] || [];
    
    // Satır yükseklikleri
    const rowHeights = worksheet['!rows'] || [];
    
    console.log('✅ excelService: Parse tamamlandı!');
    return {
      sheetName: firstSheetName,
      data: jsonData,
      html: cleanedHtml,
      htmlDocument,
      colWidths: colWidths,
      rowHeights: rowHeights,
      allSheets: workbook.SheetNames,
      rawWorksheet: worksheet
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
