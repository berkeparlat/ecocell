import { ref, uploadBytes, getDownloadURL, listAll, deleteObject, getMetadata } from 'firebase/storage';
import { storage } from '../config/firebase';

const buildOfficeViewerUrl = (directUrl, fileType) => {
  const appOrigin = window.location.origin;
  const proxiedUrl = new URL('/api/excel-proxy', appOrigin);
  proxiedUrl.searchParams.set('url', directUrl);

  const base = 'https://view.officeapps.live.com/op/embed.aspx';
  
  let activeCell = 'A1';
  let defaultZoom = '100';
  
  if (fileType === 'stock') {
    activeCell = 'A1';
    defaultZoom = '100';
  } else if (fileType === 'electric') {
    activeCell = 'A1';
    defaultZoom = '100';
  } else if (fileType === 'downtime') {
    activeCell = 'A1';
    defaultZoom = '100';
  } else if (fileType === 'shipping') {
    activeCell = 'A1985';
    defaultZoom = '100';
  } else if (fileType === 'electrical-maintenance') {
    activeCell = 'A1130';
    defaultZoom = '80';
  } else if (fileType === 'mechanical-maintenance') {
    activeCell = 'A1';
    defaultZoom = '100';
  } else if (fileType === 'electrical-downtime' || fileType === 'mechanical-downtime') {
    activeCell = 'A1';
    defaultZoom = '100';
  }
  
  const params = new URLSearchParams({
    src: proxiedUrl.toString(),
    wdAllowInteractivity: '1',
    wdHideHeaders: '1',
    wdHideSheetTabs: '0',
    wdHideGridlines: '0',
    wdDownloadButton: '0',
    wdDefaultZoom: defaultZoom,
    wdFitToPage: '1',
    wdPageView: '1',
    ActiveCell: activeCell
  });

  return `${base}?${params.toString()}#${activeCell}`;
};

export const uploadExcelFile = async (file, type) => {
  try {
    if (!file) {
      throw new Error('Dosya seçilmedi');
    }

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!validTypes.includes(file.type)) {
      throw new Error('Geçerli bir Excel dosyası seçin (.xlsx, .xls)');
    }

    const timestamp = new Date().getTime();
    const fileName = `${type}_${timestamp}.xlsx`;
    const storageRef = ref(storage, `excel/${type}/${fileName}`);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    return {
      success: true,
      url: downloadURL,
      fileName: fileName,
      uploadDate: new Date()
    };
  } catch (error) {
    throw error;
  }
};

export const getLatestExcelFile = async (type) => {
  try {
    const listRef = ref(storage, `excel/${type}`);
    const fileList = await listAll(listRef);

    if (fileList.items.length === 0) {
      return null;
    }

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

    filesWithMetadata.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    const latestFile = filesWithMetadata[0];
    
    const viewerUrl = buildOfficeViewerUrl(latestFile.url, type);
    
    return {
      name: latestFile.name,
      uploadDate: latestFile.uploadDate,
      size: latestFile.size,
      downloadUrl: latestFile.url,
      viewerUrl
    };
  } catch (error) {
    throw error;
  }
};

export const deleteExcelFile = async (fileRef) => {
  try {
    await deleteObject(fileRef);
    return { success: true };
  } catch (error) {
    throw error;
  }
};

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

    filesWithMetadata.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    return filesWithMetadata;
  } catch (error) {
    throw error;
  }
};
